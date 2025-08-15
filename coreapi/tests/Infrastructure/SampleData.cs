using CoreApi.Features.Access;
using CoreApi.Features.Docs;
using CoreApi.Features.Users;
using CoreApi.Infrastructure.TextIds;
using Microsoft.Extensions.Configuration;

namespace CoreApi.Tests.Infrastructure;

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