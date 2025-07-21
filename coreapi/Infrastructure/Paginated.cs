using System.ComponentModel;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Infrastructure;

public static class Paginated
{
    public record Request
    {
        [DefaultValue(0), Description("Offset (pagination)")]
        public int Offset { get; set; } = 0;
        [DefaultValue(10), Description("Count (pagination)")]
        public int Limit { get; set; } = 10;
    }

    public record Response<T>
    {
        public required int Total { get; set; }
        public required IReadOnlyCollection<T> Data { get; set; }
    }
    
    public static IQueryable<T> WithPagination<T>(this IQueryable<T> query, Request request) => query
        .Skip(request.Offset)
        .Take(request.Limit);
    
    public static IEnumerable<T> WithPagination<T>(this IEnumerable<T> query, Request request) => query
        .Skip(request.Offset)
        .Take(request.Limit);

    public static Response<T> ToPaginatedResponse<T>(
        this IEnumerable<T> data,
        Request request) => ToPaginatedResponse(data.ToArray(), request);
    
    public static Response<T> ToPaginatedResponse<T>(
        this IReadOnlyCollection<T> data,
        Request request) => new()
    {   
        Total = data.Count,
        Data = data.WithPagination(request).ToArray()
    };

    public static async Task<Response<T>> ToPaginatedResponseAsync<T>(
        this IQueryable<T> query,
        Request request,
        CancellationToken ct) => new()
    {
        Total = await query.CountAsync(ct),
        Data = await query.WithPagination(request).ToListAsync(ct)
    };
}