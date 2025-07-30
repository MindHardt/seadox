using System.Security.Cryptography;
using CoreApi.Features.Docs;
using CoreApi.Features.Invites;
using CoreApi.Features.Users;
using CoreApi.Features.Workspaces;
using CoreApi.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Xunit.v3;

namespace CoreApi.Tests;


public class WorkspaceTests(ApiFixture fixture) : IClassFixture<ApiFixture>
{
    private static CancellationToken Ct => TestContextAccessor.Instance.Current.CancellationToken;
    
    [Fact]
    public async Task CheckAccess_Correct()
    {
        await using var scope = fixture.ApiFactory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<DataContext>();
        var owner = new SeadoxUser
        {
            ZitadelId = long.Abs(BitConverter.ToInt64(RandomNumberGenerator.GetBytes(sizeof(long)))),
            AvatarUrl = null
        };
        db.Users.Add(owner);
        
        var guest = new SeadoxUser
        {
            ZitadelId = long.Abs(BitConverter.ToInt64(RandomNumberGenerator.GetBytes(sizeof(long)))),
            AvatarUrl = null
        };
        db.Users.Add(guest);
        
        var rootDoc = new Seadoc
        {
            Name = "Test doc 1",
            Description = "Test doc 1",
            Owner = owner
        };
        db.Seadocs.Add(rootDoc);
        
        var sharedDoc = new Seadoc
        {
            Name = "Shared doc",
            Description = "Shared doc",
            Owner = owner,
            Parent = rootDoc
        };
        db.Seadocs.Add(sharedDoc);
        
        var sharedWorkspace = new Workspace
        {
            DocId = 0,
            Doc = sharedDoc,
            Access = WorkspaceAccess.Read,
            InviteCodes = []
        };
        db.Workspaces.Add(sharedWorkspace);
        await db.SaveChangesAsync(Ct);

        var inviteCode = new InviteCode
        {
            WorkspaceId = sharedWorkspace.Id,
            Active = true,
            Visits = []
        };
        sharedWorkspace.InviteCodes.Add(inviteCode);
        await db.SaveChangesAsync(Ct);

        var visit = new InviteVisit
        {
            UserId = guest.Id,
            InviteCodeId = inviteCode.Id,
        };
        inviteCode.Visits.Add(visit);
        db.InviteVisits.Add(visit);

        await db.SaveChangesAsync(Ct);
        
        var ownerAccess = (await Workspace.Context.FetchAsync(db, rootDoc.Id, owner.Id, Ct)).GetGrantedAccess(rootDoc);
        Assert.Equal(WorkspaceAccess.Write, ownerAccess);

        var noAccess = (await Workspace.Context.FetchAsync(db, rootDoc.Id, guest.Id, Ct)).GetGrantedAccess(rootDoc);
        Assert.Equal(WorkspaceAccess.None, noAccess);
        
        var sharedAccess = (await Workspace.Context.FetchAsync(db, sharedDoc.Id, guest.Id, Ct)).GetGrantedAccess(sharedDoc);
        Assert.Equal(WorkspaceAccess.Read, sharedAccess);
    }
}