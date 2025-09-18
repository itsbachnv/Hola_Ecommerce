using System.Security.Claims;
using Ecommer.Application.Orders;
using Ecommer.Domain;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using Ecommer.Application.Notifications.Commands;
using Ecommer.Application.Users.Commands;
using MediatR;

namespace Ecommer.Infrastructure.Services;

public class OrderConsumerService : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly IConfiguration _config;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IMediator _mediator;

    public OrderConsumerService(IServiceProvider services, IConfiguration config, IHttpContextAccessor httpContextAccessor, IMediator mediator)
    {
        _services = services;
        _config = config;
        _httpContextAccessor = httpContextAccessor;
        _mediator = mediator;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory
        {
            HostName = _config["RabbitMQ:Host"],
            UserName = _config["RabbitMQ:User"],
            Password = _config["RabbitMQ:Pass"]
        };
        
        await using var connection = await factory.CreateConnectionAsync(stoppingToken);
        await using var channel = await connection.CreateChannelAsync(
            options: null,
            cancellationToken: stoppingToken
        );

        await channel.QueueDeclareAsync(
            queue: "orders",
            durable: true,
            exclusive: false,
            autoDelete: false,
            cancellationToken: stoppingToken
        );
        
        var consumer = new AsyncEventingBasicConsumer(channel);

        consumer.ReceivedAsync += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var json = Encoding.UTF8.GetString(body);
            var command = JsonSerializer.Deserialize<CreateOrderCommand>(json);
            
            if (command != null)
            {
                using var scope = _services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                await using var transaction = await db.Database.BeginTransactionAsync(stoppingToken);
                try
                {
                    long currentUserId = 0;
                    if (command.CustomerInfo.CreateAccount)
                    {
                        var existingUser = await db.Users
                            .Where(u => u.Email == command.CustomerInfo.Email)
                            .FirstOrDefaultAsync(stoppingToken);
                        
                        if (existingUser != null)
                            throw new Exception("Email đã tồn tại. Vui lòng đăng nhập hoặc sử dụng email khác.");
                        
                        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();
                        var createUserCmd = new CreateUserCommand(
                            command.CustomerInfo.Email,
                            command.CustomerInfo.FullName,
                            "123456",
                            "Customer",
                            true
                        );
                        var newUser = await mediator.Send(createUserCmd, stoppingToken);
                        currentUserId = newUser.Id;
                    }
                    else
                    {
                        currentUserId = command.CustomerInfo.UserId;
                    }
                    
                    var order = new Order
                    {
                        Code = $"ORD-{Guid.NewGuid().ToString()[..8]}",
                        UserId = currentUserId,
                        CustomerFullName = command.CustomerInfo.FullName,
                        CustomerEmail = command.CustomerInfo.Email,
                        CustomerPhone = command.CustomerInfo.Phone,
                        Status = Enums.OrderStatus.Ordered,
                        Subtotal = command.Subtotal,
                        ShippingFee = command.ShippingFee,
                        DiscountTotal = 0,
                        GrandTotal = command.Total,
                        VoucherCode = command.VoucherCode,
                        ShippingAddress = JsonDocument.Parse(JsonSerializer.Serialize(command.ShippingAddress)),
                        Notes = command.Notes,
                        CreatedBy = command.CustomerInfo.FullName
                    };

                    db.Orders.Add(order);
                    await db.SaveChangesAsync(stoppingToken);

                    foreach (var item in command.Items)
                    {
                        var variant = await db.Variants
                            .Where(v => v.Id == item.VariantId)
                            .FirstOrDefaultAsync(stoppingToken);

                        if (variant == null || variant.StockQty < item.Quantity)
                            throw new Exception($"Sản phẩm {item.VariantId} không đủ số lượng.");

                        variant.StockQty -= item.Quantity;

                        db.OrderItems.Add(new OrderItem
                        {
                            OrderId = order.Id,
                            ProductId = item.ProductId,
                            VariantId = item.VariantId,
                            Quantity = item.Quantity,
                            UnitPrice = item.Price,
                            TotalPrice = item.Price * item.Quantity
                        });
                    }

                    await db.SaveChangesAsync(stoppingToken);
                    await transaction.CommitAsync(stoppingToken);
                    try
                    {
                        var message = 
                            $"Khách hàng {command.CustomerInfo.FullName} đã tạo đơn hàng lúc {DateTime.Now:dd/MM/yyyy HH:mm}.";
                        int userId = Convert.ToInt32(currentUserId);
                        await _mediator.Send(new SendNotificationCommand(
                            userId,
                            "Tạo đơn hàng mới",
                            message,
                            "Xem chi tiết",
                            0, $"/profile/orders/{order.Code}"
                        ), stoppingToken);
                        var admins = await db.Users
                            .Where(u => u.Role == "Admin")
                            .Select(u => u.Id)
                            .ToListAsync(stoppingToken);

                        foreach (var adminId in admins)
                        {
                            await _mediator.Send(new SendNotificationCommand(
                                (int)adminId,
                                "Đơn hàng mới",
                                message,
                                "Xem chi tiết",
                                0,
                                $"/admin/orders/{order.Code}"
                            ), stoppingToken);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                    
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync(stoppingToken);
                    Console.WriteLine($"[ERROR] {ex.Message}");
                }
            }
        };
        
        channel.BasicConsumeAsync(
            queue: "orders",
            autoAck: true,
            consumer: consumer
        );
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}
