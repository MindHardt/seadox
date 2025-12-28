using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;

namespace Seadox.CoreApi.Infrastructure.Optionals;

/// <summary>
/// Represents a value that may or may not exist.
/// Used for JavaScript undefined value.
/// </summary>
/// <remarks>
/// When using with JSON serialization, property must be marked with
/// <code>
/// [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
/// </code>
/// </remarks>
[DebuggerDisplay("{ToString(),nq}")]
public readonly partial record struct Optional<T>
{
    private readonly T? _value;
    
    public bool HasValue { get; }
    public T Value => HasValue
        ? _value!
        : throw new InvalidOperationException("Value not set");

    public T? ValueOrDefault => HasValue ? _value : default;

    private Optional(bool hasValue, T? value)
    {
        HasValue = hasValue;
        _value = value;
    }
    
    [return: NotNullIfNotNull(nameof(fallback))]
    public T? Or(T? fallback) => HasValue ? _value! : fallback;

    public static Optional<T> FromValue(T value) => new(true, value);
    /// <summary>
    /// A nonexistent value.
    /// </summary>
    public static Optional<T> Undefined => new(false, default);

    public bool Equals(Optional<T>? other) =>
        other is { } another && 
        HasValue == another.HasValue &&
        Value?.Equals(other.Value) is true;

    public override int GetHashCode() => ValueOrDefault?.GetHashCode() ?? 0;

    public override string? ToString() => HasValue ? Value?.ToString() : "undefined";
    
    public static implicit operator Optional<T>(T value) => FromValue(value);
}