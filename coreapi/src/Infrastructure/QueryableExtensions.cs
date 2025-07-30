namespace CoreApi.Infrastructure;

public static class QueryableExtensions
{
    public static IQueryable<TResult> Project<TSource, TResult>(
        this IQueryable<TSource> source, Func<IQueryable<TSource>, IQueryable<TResult>> projection) 
        => projection(source);
}