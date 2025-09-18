using Ecommer.Api.Endpoints;
using Ecommer.Container.ServiceRegister;
using Ecommer.Controllers.Endpoints;
using Infrastructure.Hubs;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "Ecommerce", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAuthenticationServices(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Ecommerce v1");
    });
}

// CORS
app.UseCors("_myAllowSpecificOrigins");

app.UseHttpsRedirection();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map feature endpoints
app.MapProducts();
app.MapVariantsEndpoints();
app.MapUsers();
app.MapAuths();
app.MapCategories();
app.MapCarts();
app.MapBrands();
app.MapNotifications();
app.MapHub<NotifyHub>("/notify");
app.MapHub<ChatHub>("/chat");
app.MapOrdersEndpoints(builder.Configuration);

app.Run();