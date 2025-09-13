using Ecommer.Application.Abstractions.Brands;
using Ecommer.Application.Abstractions.Carts;
using Ecommer.Application.Abstractions.Categories;
using Ecommer.Application.Abstractions.Cloudary;
using Ecommer.Application.Abstractions.Notifications;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Abstractions.Users;
using Ecommer.Application.Abstractions.Variants;
using Ecommer.Application.Notifications.Commands;
using Ecommer.Infrastructure;
using Infrastructure.Hubs;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace Ecommer.Container.ServiceRegister;

public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(config.GetConnectionString("Postgres")));

        var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
        services.AddCors(options =>
        {

            options.AddPolicy(name: MyAllowSpecificOrigins,
                policy =>
                {
                    policy.WithOrigins(
                            "http://localhost:3000",
                            "https://227cf21975e9.ngrok-free.app"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });
        
        // Repositories
        services.AddSignalR();

        services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
        
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<INotificationsRepository, NotificationsRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IVariantRepository, VariantRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<NotificationsRepository>();
        
        services.AddMemoryCache();
        services.AddHttpClient();
        services.AddSignalR()
            .AddHubOptions<NotifyHub>(options =>
            {
                options.EnableDetailedErrors = true;
            });

        return services;
    }
}