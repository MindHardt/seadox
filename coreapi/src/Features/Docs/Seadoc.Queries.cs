using CoreApi.Features.Access;
using CoreApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Docs;

public static class SeadocQueries
{
    
    /// <summary>
    /// Constructs a query that returns lineage of the <see cref="Seadoc"/> with the given <paramref name="id"/>.
    /// </summary>
    /// <returns>Doc lineage ordered from itself to its root ancestor.</returns>
    public static IQueryable<Seadoc> GetLineageOf(this DataContext dataContext, int id) => dataContext.Seadocs.FromSqlInterpolated(
        // lang=postgresql
        $"""
         WITH RECURSIVE cte AS (
           SELECT * FROM seadocs WHERE id = {id}
                              
           UNION ALL
                    
           SELECT seadocs.* FROM seadocs JOIN cte ON cte.parent_id = seadocs.id
         )
         SELECT * FROM cte
         """);

    public static IQueryable<Seadoc> OwnedBy(this IQueryable<Seadoc> query, int? userId) => query
        .Where(x => x.OwnerId == userId);
    
    public static IQueryable<Seadoc> DocsVisibleTo(this DataContext dataContext, int? userId) => dataContext.Seadocs.Where(x => 
        x.OwnerId == userId || 
        x.Share.Access >= AccessMode.Read || 
            dataContext.GetLineageOf(x.Id)
            .Select(s => s.Share)
            .Any(s => s.Access >= AccessMode.Read && s.ShareType == ShareType.Cascades));
}