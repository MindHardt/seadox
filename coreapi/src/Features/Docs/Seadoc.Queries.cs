using CoreApi.Features.Access;
using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Docs;

public static class SeadocQueries
{
    public static IQueryable<Seadoc> DocsVisibleTo(this DataContext dataContext, CallerContext.State? state) => 
        state?.Roles.Contains(RoleNames.Admin) is true 
            ? dataContext.Seadocs 
            : DocsVisibleTo(dataContext, state?.UserId);
    public static IQueryable<Seadoc> DocsVisibleTo(this DataContext dataContext, int? userId) => dataContext.Seadocs
        .Where(x => 
            x.OwnerId == userId || 
            x.Share.Access >= AccessMode.Read || 
            dataContext.GetLineageOf(x.Id)
                .Select(s => s.Share)
                .Any(s => s.Access >= AccessMode.Read && s.ShareType == ShareType.Cascades));
    
    public static IQueryable<Seadoc> DocsEditableBy(this DataContext dataContext, CallerContext.State? state) => 
        state?.Roles.Contains(RoleNames.Admin) is true 
            ? dataContext.Seadocs 
            : DocsEditableBy(dataContext, state?.UserId);
    public static IQueryable<Seadoc> DocsEditableBy(this DataContext dataContext, int? userId) => dataContext.Seadocs
        .Where(x => 
            x.OwnerId == userId || 
            x.Share.Access >= AccessMode.Write || 
            dataContext.GetLineageOf(x.Id)
                .Select(s => s.Share)
                .Any(s => s.Access >= AccessMode.Write && s.ShareType == ShareType.Cascades));
}