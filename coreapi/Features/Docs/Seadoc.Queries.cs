using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Docs;

public static class SeadocQueries
{
    public static IQueryable<Seadoc> GetLineageOf(this DbSet<Seadoc> seadocs, int docId) => seadocs.FromSqlInterpolated(
        // lang=postgresql
        $"""
         WITH RECURSIVE cte AS (
           SELECT * FROM seadocs WHERE id = {docId}
                              
           UNION ALL
                    
           SELECT seadocs.* FROM seadocs JOIN cte ON cte.parent_id = seadocs.id
         )
         SELECT * FROM cte
         """);
}