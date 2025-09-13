using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Ecommer.Container.ServiceRegister;

public static class AuthenticationRegistration
    {
        public static IServiceCollection AddAuthenticationServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = "SmartScheme";
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddScheme<AuthenticationSchemeOptions, AllowAnonymousHandler>("AllowAnonymous", _ => { })
            .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = configuration["Jwt:Issuer"],
                    ValidAudience = configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
                };

                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var path = context.HttpContext.Request.Path;
                        if (path.StartsWithSegments("/chat") || path.StartsWithSegments("/notify"))
                        {
                            var token = context.Request.Query["access_token"];
                            if (!string.IsNullOrEmpty(token))
                                context.Token = token;
                        }
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = context =>
                    {
                        var claimsIdentity = context.Principal?.Identity as ClaimsIdentity;
                        if (claimsIdentity != null &&
                            claimsIdentity.FindFirst(ClaimTypes.NameIdentifier) == null)
                        {
                            var sub = claimsIdentity.FindFirst("sub")?.Value;
                            if (sub != null)
                                claimsIdentity.AddClaim(new Claim(ClaimTypes.NameIdentifier, sub));
                        }
                        return Task.CompletedTask;
                    }
                };
            })
            .AddPolicyScheme("SmartScheme", "SmartScheme for SignalR", options =>
            {
                options.ForwardDefaultSelector = context =>
                {
                    var token = context.Request.Query["access_token"];
                    return string.IsNullOrEmpty(token)
                        ? "AllowAnonymous"
                        : JwtBearerDefaults.AuthenticationScheme;
                };
            }).AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddGoogle(GoogleDefaults.AuthenticationScheme, options =>
            {
                options.ClientId = configuration["Authentication:Google:ClientId"];
                options.ClientSecret = configuration["Authentication:Google:ClientSecret"];
                options.CallbackPath = "/signin-google";
                options.SaveTokens = true;
            });

            services.AddHttpContextAccessor();
            services.AddAuthorization(options =>
            {
                options.AddPolicy("UserPolicy", policy =>
                    policy.RequireClaim(ClaimTypes.Role, "Admin", "Staff", "Customer"));
                options.AddPolicy("AdminPolicy", policy =>
                    policy.RequireClaim(ClaimTypes.Role, "Admin"));
                options.AddPolicy("UserCommon", policy =>
                    policy.RequireClaim(ClaimTypes.Role, "Admin", "Staff", "Customer, Guest"));
            });

            return services;
        }
    }

    public class AllowAnonymousHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public AllowAnonymousHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            ISystemClock clock)
            : base(options, logger, encoder, clock) { }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // Cho phép guest truy cập mà không cần auth
            var identity = new ClaimsIdentity();
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);
            return Task.FromResult(AuthenticateResult.Success(ticket));
        }
    }