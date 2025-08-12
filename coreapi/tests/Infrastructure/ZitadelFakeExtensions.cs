using CoreApi.Features.Users;

namespace CoreApi.Tests.Infrastructure;

public static class ZitadelFakeExtensions
{

    public static void SetAnonUser(this HttpClient http) => SetUserId(http, null);
    public static void SetUser(this HttpClient http, SeadoxUser? user) => SetUserId(http, user?.ZitadelId);
    
    public static void SetUserId(this HttpClient http, long? zitadelId)
    {
        if (zitadelId.HasValue)
        {
            http.DefaultRequestHeaders.Add("x-zitadel-fake-user-id", zitadelId.ToString());
        }
        else
        {
            http.DefaultRequestHeaders.Add("x-zitadel-fake-auth", "false");
        }
    }
}