using System.Security.Claims;
using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace CoreApi.Features.Users;

[RegisterScoped]
public class CallerContext(
    IHttpContextAccessor accessor, 
    HybridCache cache, 
    DataContext dataContext, 
    TextIdEncoders encoders,
    SeadoxUser.Mapper mapper)
{
    private readonly Lazy<Func<CancellationToken, ValueTask<State?>>> _stateTask = new(() => async ct =>
    {
        if (accessor.HttpContext?.User.FindFirstValue("sub") is not { } sub)
        {
            return null;
        }

        var userId = long.Parse(sub);
        return await cache.GetOrCreateAsync($"{nameof(SeadoxUser)}:{userId}", factory: async innerCt =>
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

                return new State(user);
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
        ? encoders.User.DecodeRequiredTextId(state.User.Id)
        : null;

    public async ValueTask<int> GetRequiredUserId(CancellationToken ct) =>
        encoders.User.DecodeRequiredTextId((await GetRequiredStateAsync(ct)).User.Id);

    public readonly record struct State(
        SeadoxUser.Model User);
}