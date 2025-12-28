namespace Seadox.CoreApi.Infrastructure.Optionals;

public readonly partial record struct Optional<T>
{
    /// <summary>
    /// Checks whether this <see cref="Optional{T}"/> has a value, and it matches predicate.
    /// </summary>
    public bool Is(Predicate<T> predicate, out T value)
    {
        value = ValueOrDefault!;
        return HasValue && predicate(value);
    }

    /// <summary>
    /// Checks whether this <see cref="Optional{T}"/> has a value, and it does not match predicate.
    /// </summary>
    public bool IsNot(Predicate<T> predicate, out T value)
    {
        value = ValueOrDefault!;
        return HasValue && predicate(value) is false;
    }
}