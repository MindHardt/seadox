using System.Text.Json.Nodes;
using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Features.Dev;

[Handler, MapGet("/dev/login-callback")]
public partial class LoginCallback
{
    public record Request
    {
        public required HttpContext Context { get; set; }
        [FromQuery(Name = "code")]
        public required string Code { get; set; }
    }

    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint.ExcludeFromDescription();

    private static async ValueTask<ContentHttpResult> HandleAsync(
        Request request,
        IConfiguration configuration,
        IHttpClientFactory httpFactory,
        CancellationToken ct)
    {
        var tokenEndpoint = configuration["Zitadel:Authority"] + "/oauth/v2/token";
        
        var codeVerifier = request.Context.Request.Cookies["codeVerifier"];
        var state = request.Context.Request.Cookies["state"];

        using var content = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["code"] = request.Code,
            ["redirect_uri"] = $"{request.Context.Request.Scheme}://{request.Context.Request.Host}/dev/login-callback",
            ["client_id"] = configuration["Zitadel:WebClientId"]!,
            ["code_verifier"] = codeVerifier!,
            ["state"] = state!
        });
        using var http = httpFactory.CreateClient();
        var response = await http.PostAsync(tokenEndpoint, content, ct);
        var tokens = await response.Content.ReadFromJsonAsync<JsonObject>(ct);
        return TypedResults.Text(tokens?["access_token"]?.ToString() ?? "null");
    }
}