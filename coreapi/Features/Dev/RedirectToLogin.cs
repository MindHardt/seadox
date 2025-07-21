using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using CoreApi.Infrastructure;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Options;

namespace CoreApi.Features.Dev;

[Handler, MapGet("/dev/login")]
public partial class RedirectToLogin
{
    public record Request
    {
        public required HttpContext Context { get; set; }
    }
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .WithTags(ApiTags.Dev);

    private static ValueTask<ContentHttpResult> HandleAsync(
        Request request,
        IConfiguration configuration,
        CancellationToken ct)
    {
        var authority = configuration["Zitadel:Authority"];
        var authEndpoint = authority + "/oauth/v2/authorize";

        var codeVerifier = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));
        var codeChallenge = Base64Url.EncodeToString(SHA256.HashData(Encoding.UTF8.GetBytes(codeVerifier)));
        var state = Guid.NewGuid().ToString();
        
        request.Context.Response.Cookies.Append("codeVerifier", codeVerifier);
        request.Context.Response.Cookies.Append("state", state);
        
        var authUrl = new UriBuilder(authEndpoint)
        {
            Query = QueryString.Create(new Dictionary<string, string?>
            {
                ["response_type"] = "code",
                ["client_id"] = configuration["Zitadel:WebClientId"],
                ["redirect_uri"] = $"{request.Context.Request.Scheme}://{request.Context.Request.Host}/dev/login-callback",
                ["code_challenge"] = codeChallenge,
                ["code_challenge_method"] = "S256",
                ["scope"] = string.Join(' ', "openid", "profile", "offline_access"),
                ["prompt"] = "select_account",
                ["state"] = state
            }).ToString()
        };

        return ValueTask.FromResult(TypedResults.Text(authUrl.ToString()));
    }
}