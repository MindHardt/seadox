using System.Security.Claims;
using IdentityModel;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;
using Seadox.CoreApi.Infrastructure;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.TextIds;

namespace Seadox.CoreApi.Features.Users;

[RegisterScoped]
public class CallerContext(
    IHttpContextAccessor accessor, 
    HybridCache cache, 
    DataContext dataContext, 
    TextIdEncoders encoders,
    SeadoxUser.Mapper mapper)
{
    private static string? GetSub(ClaimsPrincipal principal) => 
        principal.FindFirstValue(ClaimTypes.NameIdentifier) ??
        principal.FindFirstValue(JwtClaimTypes.Subject);
    
    private readonly Lazy<Func<CancellationToken, ValueTask<State?>>> _stateTask = new(() => async ct =>
    {
        var principal = accessor.HttpContext?.User;
        if (principal is null ||
            GetSub(principal) is not { } sub || 
            long.TryParse(sub, out var userId) is false)
        {
            return null;
        }

        var roles = principal.FindAll(ClaimTypes.Role).Select(x => x.Value).ToArray();
        return await cache.GetOrCreateAsync(SeadoxUser.GetCacheKey(userId), factory: async innerCt =>
            {
                var user = await dataContext.Users
                    .Where(x => x.ZitadelId == userId)
                    .Project(mapper.ProjectToModel)
                    .FirstOrDefaultAsync(innerCt);

                // ReSharper disable once InvertIf
                if (user is null)
                {
                    var newUser = new SeadoxUser
                    {
                        ZitadelId = userId,
                        AvatarUrl = null
                    };
                    dataContext.Users.Add(newUser);
                    await dataContext.SaveChangesAsync(innerCt);
                    user = mapper.ToModel(newUser);
                }

                return new State(user, encoders.User.DecodeRequiredTextId(user.Id), roles);
            },
            options: new HybridCacheEntryOptions
            {
                Expiration = TimeSpan.FromMinutes(5),
                LocalCacheExpiration = TimeSpan.FromMinutes(5)
            },
            cancellationToken: ct);
    }, LazyThreadSafetyMode.ExecutionAndPublication);
    
    public async ValueTask<State> GetRequiredStateAsync(CancellationToken ct) =>
        await GetCurrentStateAsync(ct) ?? throw new InvalidOperationException("Cannot retrieve required state");

    public ValueTask<State?> GetCurrentStateAsync(CancellationToken ct) => _stateTask.Value(ct);

    public async ValueTask<int?> GetCurrentUserId(CancellationToken ct) => await GetCurrentStateAsync(ct) is { } state
        ? state.UserId
        : null;

    public async ValueTask<int> GetRequiredUserId(CancellationToken ct) =>
        (await GetRequiredStateAsync(ct)).UserId;

    public readonly record struct State(
        SeadoxUser.Model User,
        int UserId,
        IReadOnlyCollection<string> Roles);
}