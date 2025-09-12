using System.Net;
using System.Net.Http.Json;
using CoreApi.Features.Access;
using CoreApi.Features.Docs;
using CoreApi.Features.Docs.Actions;
using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using CoreApi.Tests.Infrastructure;
using Microsoft.Extensions.DependencyInjection;

namespace CoreApi.Tests;

public class AccessTests(ApiFixture fixture) : IAsyncLifetime
{
    private SeadoxUser _owner = null!;
    private SeadoxUser _other = null!;
    private SeadoxUser _admin = null!;
    private Seadoc _root = null!;
    private Seadoc _publicChild = null!;
    private Seadoc _privateGrandchild = null!;
    private Seadoc _cascadingPublicChild = null!;
    private Seadoc _publicGrandchild = null!;
    
    public async ValueTask InitializeAsync()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var scope = fixture.ApiFactory.Services.CreateAsyncScope();
        var dataContext = scope.ServiceProvider.GetRequiredService<DataContext>();
        
        _owner = SampleData.User();
        _other = SampleData.User();
        _admin = SampleData.User();
        
        dataContext.Users.AddRange(_owner, _other);

        _root = SampleData.Doc("root", _owner);
        
        _publicChild = SampleData.Doc("public", _owner, 
            parent: _root, 
            share: new DocumentShareMode
            {
                Access = AccessLevel.Read,
                Type = ShareType.CurrentOnly
            });
        _privateGrandchild = SampleData.Doc("public->private", _owner, 
            parent: _publicChild);
        
        _cascadingPublicChild = SampleData.Doc("cascading", _owner, 
            parent: _root, 
            share: new DocumentShareMode
            {
                Access = AccessLevel.Read,
                Type = ShareType.Cascades
            });
        _publicGrandchild = SampleData.Doc("cascading->public", _owner, 
            parent: _cascadingPublicChild);
        
        dataContext.Seadocs.AddRange(_root, _publicChild, _privateGrandchild, _cascadingPublicChild, _publicGrandchild);
        await dataContext.SaveChangesAsync(ct);
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;
    
    [Fact]
    public async Task AccessTests_Read_Success()
    {
        var ct = TestContext.Current.CancellationToken;
        var encoder = fixture.ApiFactory.Services.GetRequiredService<TextIdEncoders>().Seadocs;

        List<(Seadoc doc, SeadoxUser? user, string[]? roles)> testCases =
        [
            (_root, _owner, null),
            (_publicChild, _owner, null),
            (_publicChild, _other, null),
            (_publicChild, null, null),
            (_cascadingPublicChild, _owner, null),
            (_cascadingPublicChild, _other, null),
            (_cascadingPublicChild, null, null),
            (_publicGrandchild, _owner, null),
            (_publicGrandchild, _other, null),
            (_publicGrandchild, null, null),
            (_privateGrandchild, _owner, null),
            
            (_privateGrandchild, _admin, [RoleNames.Admin])
        ];
        foreach (var (doc, user, roles) in testCases)
        {
            var client = fixture.ApiFactory.CreateClient();
            client.SetUser(user, roles);

            var docId = encoder.EncodeTextId(doc.Id);
            var res = await client.GetAsync("/seadocs/" + docId, ct);
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
            
            var result = await res.Content.ReadFromJsonAsync<Seadoc.Model>(ct);
        
            Assert.NotNull(result);
            Assert.Equal(docId, result.Id);
        }
    }
    
    [Fact]
    public async Task AccessTests_Write_Success()
    {
        var ct = TestContext.Current.CancellationToken;
        var encoder = fixture.ApiFactory.Services.GetRequiredService<TextIdEncoders>().Seadocs;

        List<(Seadoc doc, SeadoxUser? user, string[]? roles)> testCases =
        [
            (_privateGrandchild, _owner, null),
            (_privateGrandchild, _admin, [RoleNames.Admin])
        ];
        foreach (var (doc, user, roles) in testCases)
        {
            var client = fixture.ApiFactory.CreateClient();
            client.SetUser(user, roles);

            var docId = encoder.EncodeTextId(doc.Id);
            var content = JsonContent.Create(new UpdateDoc.Request.Body
            {
                Name = doc.Name,
                Description = doc.Description,
                CoverUrl = doc.CoverUrl
            });
            var res = await client.PatchAsync("/seadocs/" + docId, content, ct);
            Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        }
    }

    [Fact]
    public async Task AccessTests_Unauthorized()
    {
        var ct = TestContext.Current.CancellationToken;
        var encoder = fixture.ApiFactory.Services.GetRequiredService<TextIdEncoders>().Seadocs;

        List<(Seadoc doc, SeadoxUser? user)> testCases =
        [
            (_root, null),
            (_root, _other),
            (_privateGrandchild, null),
            (_privateGrandchild, _other)
        ];
        foreach (var (doc, user) in testCases)
        {
            var client = fixture.ApiFactory.CreateClient();
            client.SetUser(user);

            var docId = encoder.EncodeTextId(doc.Id);
            var res = await client.GetAsync("/seadocs/" + docId, ct);
            Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
        }
    }

    [Fact]
    public async Task AccessTests_NotFound()
    {
        var ct = TestContext.Current.CancellationToken;
        var encoder = fixture.ApiFactory.Services.GetRequiredService<TextIdEncoders>().Seadocs;
        
        var noneId = encoder.EncodeTextId(int.MaxValue);
        var client = fixture.ApiFactory.CreateClient();

        var noneResponse = await client.GetAsync("/seadocs/" + noneId, ct);
        Assert.Equal(HttpStatusCode.NotFound, noneResponse.StatusCode);

        var brokenId = TextId.From("+");
        Assert.Null(encoder.DecodeTextId(brokenId));
        
        var brokenResponse =  await client.GetAsync("/seadocs/" + brokenId, ct);
        Assert.Equal(HttpStatusCode.NotFound, brokenResponse.StatusCode);
    }
}