using System.Collections.Concurrent;
using System.Numerics;
using CoreApi.Features.Docs;
using CoreApi.Features.Uploads;
using CoreApi.Features.Users;
using Sqids;

namespace CoreApi.Infrastructure.TextIds;

[RegisterSingleton]
public class TextIdEncoders(IConfiguration configuration)
{
    private readonly IConfigurationSection _section = configuration.GetRequiredSection(nameof(TextIdEncoders));
    private readonly ConcurrentDictionary<string, SqidsOptions> _options = [];

    public SqidsEncoder<int> Seadocs => GetEncoder<int, Seadoc>();
    public SqidsEncoder<int> User => GetEncoder<int, SeadoxUser>();
    public SqidsEncoder<long> Uploads => GetEncoder<long, Upload>();
    
    private SqidsOptions GetOptions(string name) => _options.GetOrAdd(name, _ => 
        _section.GetSection(name).Get<SqidsOptions>() ?? 
        _section.GetSection("Default").Get<SqidsOptions>() ?? 
        throw new InvalidOperationException($"Cannot retrieve text id encoder with name {name}"));
    private SqidsEncoder<TInt> GetEncoder<TInt>(string name)
        where TInt : unmanaged, IBinaryInteger<TInt>, IMinMaxValue<TInt> =>
        new(GetOptions(name));
    private SqidsEncoder<TInt> GetEncoder<TInt>(Type type)
        where TInt : unmanaged, IBinaryInteger<TInt>, IMinMaxValue<TInt> =>
        GetEncoder<TInt>(type.Name);
    public SqidsEncoder<TInt> GetEncoder<TInt, TName>()
        where TInt : unmanaged, IBinaryInteger<TInt>, IMinMaxValue<TInt> =>
        GetEncoder<TInt>(typeof(TName));
}