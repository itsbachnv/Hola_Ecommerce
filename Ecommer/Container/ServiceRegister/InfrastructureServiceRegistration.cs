using Ecommer.Application.Abstractions.Categories;
using Ecommer.Application.Abstractions.Cloudary;
using Ecommer.Application.Abstractions.Notifications;
using Ecommer.Application.Abstractions.Products;
using Ecommer.Application.Abstractions.Users;
using Ecommer.Application.Abstractions.Variants;
using Ecommer.Infrastructure;
using Ecommer.Infrastructure.Notifications;
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
                            "http://localhost:3000"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
        });
        
        // Repositories
        services.AddSignalR();

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<INotificationRepository, NotificationRepository>();
        services.AddScoped<IAppNotificationPublisher, SignalRAppNotificationPublisher>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IVariantRepository, VariantRepository>();
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}