using System.Net;
using System.Net.Http.Json;
using CoreApi.Features.Users;
using CoreApi.Tests.Infrastructure;

namespace CoreApi.Tests;

public class FakeAuthenticationTests(ApiFixture fixture)
{
    [Fact]
    public async Task TestUserId()
    {
        var ct = TestContext.Current.CancellationToken;
        var user = SampleData.User();
        var client = fixture.ApiFactory.CreateClient();
        client.SetUser(user);

        var res = await client.GetAsync("/users/me", ct);
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);

        var response = await res.Content.ReadFromJsonAsync<SeadoxUser.Model>(ct);
        Assert.NotNull(response);
        Assert.Equal(user.ZitadelId, response.ZitadelId);
    }
}