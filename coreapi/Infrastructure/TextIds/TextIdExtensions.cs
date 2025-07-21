using System.Diagnostics.CodeAnalysis;
using System.Numerics;
using Sqids;

namespace CoreApi.Infrastructure.TextIds;

public static class TextIdExtensions
{
    [return: NotNullIfNotNull(nameof(value))]
    public static TextId? EncodeTextId<TInt>(this SqidsEncoder<TInt> encoder, TInt? value) 
        where TInt : unmanaged, IBinaryInteger<TInt>, IMinMaxValue<TInt>
        => value is { } id ? TextId.From(encoder.Encode(id)) : null;
    
    public static TextId EncodeTextId<TInt>(this SqidsEncoder<TInt> encoder, TInt value)
        where TInt : unmanaged, IBinaryInteger<TInt>, IMinMaxValue<TInt>
        => TextId.From(encoder.Encode(value));

    public static TInt? DecodeTextId<TInt>(this SqidsEncoder<TInt> encoder, TextId id)
        where TInt : unmanaged, IBinaryInteger<TInt>, IMinMaxValue<TInt>
        => encoder.Decode(id.Value) is [var value, ..] ? value : null;

    public static TInt DecodeRequiredTextId<TInt>(this SqidsEncoder<TInt> encoder, TextId id)
        where TInt : unmanaged, IBinaryInteger<TInt>, IMinMaxValue<TInt>
        => DecodeTextId(encoder, id) ?? throw new InvalidOperationException("Could not decode required text id");
}