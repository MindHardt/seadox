using Microsoft.Extensions.Configuration;
using Seadox.CoreApi.Features.Access;
using Seadox.CoreApi.Infrastructure.TextIds;
using Seadoc = Seadox.CoreApi.Features.Docs.Seadoc;
using SeadoxUser = Seadox.CoreApi.Features.Users.SeadoxUser;

namespace Seadox.CoreApi.Tests.Infrastructure;

public static class SampleData
{
    private static long _zitadelId = 1;
    public static SeadoxUser User() => new()
    {
        ZitadelId = Interlocked.Increment(ref _zitadelId),
    };

    public static Seadoc Doc(
        string name,
        SeadoxUser owner,
        string description = "",
        string? coverUrl = null,
        DocumentShareMode? share = null,
        Seadoc? parent = null) => new()
    {
        Name = name,
        Owner = owner,
        Description = description,
        CoverUrl = coverUrl,
        Share = share ?? DocumentShareMode.Default,
        Parent = parent
    };

    public static TextIdEncoders TextIdEncoders() => new(new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["TextIdEncoders:Default:Alphabet"] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
        })
        .Build());
}