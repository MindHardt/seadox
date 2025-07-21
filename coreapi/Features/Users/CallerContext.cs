using System.Security.Claims;
using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Hybrid;

namespace CoreApi.Features.Users;

[RegisterScoped]
public class CallerContext(
    IHttpContextAccessor accessor, 
    HybridCache cache, 
    DataContext dataContext, 
    SeadoxUser.Mapper mapper)
{
    public async ValueTask<State> GetRequiredStateAsync(CancellationToken ct) =>
        await GetCurrentStateAsync(ct) ?? throw new InvalidOperationException("Cannot retrieve required state");
    
    public async ValueTask<State?> GetCurrentStateAsync(CancellationToken ct)
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
    }

    public readonly record struct State(
        SeadoxUser.Model User);
}