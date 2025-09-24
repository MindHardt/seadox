using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SeadoxUser = Seadox.CoreApi.Features.Users.SeadoxUser;

namespace Seadox.CoreApi.Tests.Infrastructure;

public static class FakeAuth
{
    public const string Scheme = nameof(FakeAuth);
    public const string UserIdHeader = "x-user-id";
    public const string RoleHeader = "x-user-role";
    
    public static IServiceCollection AddFakeAuth(this IServiceCollection services)
    {
        services.AddAuthentication(Scheme).AddScheme<Options, Handler>(Scheme, 
            configureOptions: null);
        return services;
    }

    public static void SetUserId(this HttpClient http, long? zitadelId, IEnumerable<string>? roles = null)
    {
        if (zitadelId is null)
        {
            http.DefaultRequestHeaders.Remove(UserIdHeader);
        }
        http.DefaultRequestHeaders.Add(UserIdHeader, zitadelId.ToString());
        http.DefaultRequestHeaders.Add(RoleHeader, roles ?? []);
    }

    public static void SetUser(this HttpClient http,SeadoxUser? user, IEnumerable<string>? roles = null) => 
        SetUserId(http, user?.ZitadelId, roles);

    private class Options : AuthenticationSchemeOptions;

    private class Handler(IOptionsMonitor<Options> options, ILoggerFactory logger, UrlEncoder encoder) 
        : AuthenticationHandler<Options>(options, logger, encoder)
    {
        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var headers = Context.Request.Headers;
            if (headers.TryGetValue(UserIdHeader, out var sub) is false ||
                long.TryParse(sub, out var zitadelId) is false)
            {
                return Task.FromResult(AuthenticateResult.Fail($"No {UserIdHeader} found"));
            }

            var principal = new ClaimsPrincipal(new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, zitadelId.ToString()),
                ..headers[RoleHeader].OfType<string>().Select(role => new Claim(ClaimTypes.Role, role))    
            ], authenticationType: FakeAuth.Scheme));
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, FakeAuth.Scheme)));
        }
    }
}