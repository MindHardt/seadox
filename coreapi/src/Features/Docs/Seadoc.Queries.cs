using Microsoft.EntityFrameworkCore;
using Seadox.CoreApi.Features.Access;
using Seadox.CoreApi.Features.Users;
using Seadox.CoreApi.Infrastructure.Data;

namespace Seadox.CoreApi.Features.Docs;

public static class SeadocQueries
{
    public static IQueryable<Seadoc> DocsVisibleTo(this DataContext dataContext, CallerContext.State? state) => 
        state?.Roles.Contains(RoleNames.Admin) is true 
            ? dataContext.Seadocs 
            : DocsVisibleTo(dataContext, state?.UserId);
    public static IQueryable<Seadoc> DocsVisibleTo(this DataContext dataContext, int? userId) => dataContext.Seadocs
        .Where(x => 
            x.OwnerId == userId || 
            x.Share.Access >= AccessLevel.Read || 
            dataContext.GetLineageOf(x.Id)
                .Select(s => s.Share)
                .Any(s => s.Access >= AccessLevel.Read && s.Type == ShareType.Cascades));
    
    public static IQueryable<Seadoc> DocsEditableBy(this DataContext dataContext, CallerContext.State? state) => 
        state?.Roles.Contains(RoleNames.Admin) is true 
            ? dataContext.Seadocs 
            : DocsEditableBy(dataContext, state?.UserId);
    public static IQueryable<Seadoc> DocsEditableBy(this DataContext dataContext, int? userId) => dataContext.Seadocs
        .Where(x => 
            x.OwnerId == userId || 
            x.Share.Access >= AccessLevel.Write || 
            dataContext.GetLineageOf(x.Id)
                .Select(s => s.Share)
                .Any(s => s.Access >= AccessLevel.Write && s.Type == ShareType.Cascades));

    public static async Task<AccessLevel> GetAccessLevelOf(this DataContext dataContext, Seadoc doc, int? userId,
        CancellationToken ct)
        => userId == doc.OwnerId
            ? AccessLevel.Write
            : (AccessLevel)sbyte.Max((sbyte)doc.Share.Access, (sbyte)await dataContext
                .GetLineageOf(doc.Id)
                .Where(x => x.Share.Type == ShareType.Cascades)
                .Select(x => x.Share.Access)
                .DefaultIfEmpty()
                .MaxAsync(ct));
}