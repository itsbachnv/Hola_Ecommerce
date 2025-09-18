using Ecommer.Application.Orders;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;
using Ecommer.Application.Orders.Queries;
using MediatR;

namespace Ecommer.Controllers.Endpoints;

public static class OrdersEndpoints
{
    public static void MapOrdersEndpoints(this IEndpointRouteBuilder app, IConfiguration config)
    {
        var group = app.MapGroup("/api/orders")
                       .WithTags("Orders");

        group.MapPost("/checkout", async (HttpContext context, CreateOrderCommand command) =>
        {
            var factory = new ConnectionFactory()
            {
                HostName = config["RabbitMQ:Host"],
                UserName = config["RabbitMQ:User"],
                Password = config["RabbitMQ:Pass"]
            };

            await using var connection = await factory.CreateConnectionAsync();
            await using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: "orders",
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            var message = JsonSerializer.Serialize(command);
            var body = Encoding.UTF8.GetBytes(message);

            var props = new BasicProperties
            {
                ContentType = "application/json",
                DeliveryMode = DeliveryModes.Persistent
            };

            await channel.BasicPublishAsync<BasicProperties>(
                exchange: "",
                routingKey: "orders",
                mandatory: false,
                basicProperties: props,
                body: body,
                cancellationToken: default
            );

            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(
                JsonSerializer.Serialize(new { Message = "Đơn hàng đang được xử lý..." })
            );
        });
        
        group.MapGet("/test", async (HttpContext context) =>
        {
            var factory = new ConnectionFactory()
            {
                HostName = config["RabbitMQ:Host"],
                UserName = config["RabbitMQ:User"],
                Password = config["RabbitMQ:Pass"]
            };

            await using var connection = await factory.CreateConnectionAsync();
            await using var channel = await connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: "orders",
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            // Tạo message test
            var testCommand = new CreateOrderCommand
            {
                Subtotal = 100000,
                ShippingFee = 20000,
                Total = 120000,
                VoucherCode = "DISCOUNT10",
                ShippingAddress = new ShippingAddressDto()
                {
                    Address = "123 Đường ABC",
                    Ward = "Phường 1",
                    District = "Quận 1",
                    City = "TP.HCM",
                    PostalCode = "700000"
                },
                Notes = "Đơn hàng test",
                Items = new List<OrderItemDto>
                {
                    new OrderItemDto { ProductId = 1, VariantId = 1, Quantity = 1, Price = 100000 }
                }
            };

            var message = JsonSerializer.Serialize(testCommand);
            var body = Encoding.UTF8.GetBytes(message);

            var props = new BasicProperties
            {
                ContentType = "application/json",
                DeliveryMode = DeliveryModes.Persistent
            };

            await channel.BasicPublishAsync<BasicProperties>(
                exchange: "",
                routingKey: "orders",
                mandatory: false,
                basicProperties: props,
                body: body,
                cancellationToken: default
            );

            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(
                JsonSerializer.Serialize(new { Message = "Message test đã gửi vào queue orders" })
            );
        });
        
        group.MapGet("/", async (HttpContext context, IMediator mediator) =>
        {
            var query = new ViewListOrderQuery();
            var orders = await mediator.Send(query);

            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(orders));
        });
        
        group.MapGet("/{orderCode}", async (string orderCode, HttpContext context, IMediator mediator) =>
        {
            var query = new ViewByOrderCodeQuery(orderCode);
            var order = await mediator.Send(query);

            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(order));
        });

    }
}

