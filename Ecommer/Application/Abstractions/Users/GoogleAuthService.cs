using System.Net.Http.Headers;
using Ecommer.Domain;
using Ecommer.Infrastructure;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json;

namespace Ecommer.Application.Abstractions.Users;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IJwtService _jwtService;
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;


    public GoogleAuthService(
        IHttpClientFactory httpClientFactory,
        IJwtService jwtService,
        AppDbContext context, IConfiguration configuration)
    {
        _httpClientFactory = httpClientFactory;
        _jwtService = jwtService;
        _context = context;
        _configuration = configuration;
    }

    public async Task<string?> HandleGoogleCallbackAsync(HttpContext httpContext, CancellationToken cancellation)
    {
        var authenticateResult = await httpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        if (!authenticateResult.Succeeded)
            return null;

        var accessToken = authenticateResult.Properties.GetTokenValue("access_token");
        dynamic googleUser = await GetGoogleUserInfoAsync(accessToken);

        string email = googleUser?.email;
        string fullName = googleUser?.name;
        string imageUrl = googleUser?.picture;

        if (googleUser == null || string.IsNullOrEmpty(email))
            return null;

        var user = _context.Users.FirstOrDefault(x => x.Email.ToLower() == email.ToLower());
        if (user == null)
        {
            user = new User
            {
                Email = email,
                FullName = fullName,
                IsActive = true,
                Role = "Customer",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellation);
        }
        else if (!user.IsActive)
        {
            return null;
        }

        var role = user.Role ?? "Customer";
        var id = user.Id;
        var jwt = _jwtService.GenerateJWTToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken(user.Id.ToString());

        var domain = _configuration["Frontend:Domain"];
        if (string.IsNullOrWhiteSpace(domain))
            domain = "http://localhost:5173/";
        
        var queryParams = new Dictionary<string, string?>
        {
            ["token"] = jwt,
            ["id"] = id.ToString(),
            ["fullName"] = fullName,
            ["refreshToken"] = refreshToken,
            ["role"] = role,
            ["image"] = imageUrl,
            ["email"] = email
        };

        var redirectUrl = QueryHelpers.AddQueryString($"{domain}auth", queryParams);
        return redirectUrl;
    }

    private async Task<dynamic> GetGoogleUserInfoAsync(string accessToken)
    {
        var client = _httpClientFactory.CreateClient();
        var request = new HttpRequestMessage(HttpMethod.Get, "https://www.googleapis.com/oauth2/v3/userinfo");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject(json);
    }
}