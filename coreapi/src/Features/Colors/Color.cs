using System.Collections.Frozen;
using System.Collections.Immutable;
using System.Text.RegularExpressions;
using CoreApi.Infrastructure.OpenApi;
using Vogen;

namespace CoreApi.Features.Colors;

[ValueObject<string>(Conversions.SystemTextJson | Conversions.EfCoreValueConverter)]
public readonly partial record struct Color : IRegexValidation
{
    private static string NormalizeInput(string input) => 
        (input.StartsWith('#') ? string.Empty : "#") + input.ToLower();
    
    private static Validation Validate(string input) => ValidationRegex.IsMatch(input)
        ? Validation.Ok
        : Validation.Invalid($"String {input} does not satisfy color regex {ValidationRegex}");

    [GeneratedRegex("^#[a-f0-9]{6}$")]
    public static partial Regex ValidationRegex { get; }

    public (byte R, byte G, byte B) ToRgb()
    {
        Span<byte> bytes = stackalloc byte[3];
        Convert.FromHexString(Value.TrimStart('#'), bytes, out _, out _);
        return (bytes[0], bytes[1], bytes[2]);
    }

    public int ToRgbInt()
    {
        var (r, g, b) = ToRgb();
        return r << 16 | g << 8 | b;
    }

    public static class DefaultPalette
    {
        public static Color Red { get; } = From("#ef4444");
        public static Color Orange { get; } = From("#f97316");
        public static Color Amber { get; } = From("#f59e0b");
        public static Color Yellow { get; } = From("#eab308");
        public static Color Lime { get; } = From("#84cc16");
        public static Color Green { get; } = From("#22c55e");
        public static Color Emerald { get; } = From("#10b981");
        public static Color Teal { get; } = From("#14b8a6");
        public static Color Cyan { get; } = From("#06b6d4");
        public static Color Sky { get; } = From("#0ea5e9");
        public static Color Blue { get; } = From("#3b82f6");
        public static Color Indigo { get; } = From("#6366f1");
        public static Color Violet { get; } = From("#8b5cf6");
        public static Color Purple { get; } = From("#a855f7");
        public static Color Fuchsia { get; } = From("#d946ef");
        public static Color Pink { get; } = From("#ec4899");
        public static Color Rose { get; } = From("#f43f5e");
        
        public static FrozenDictionary<string, Color> Dictionary { get; } = typeof(DefaultPalette)
            .GetProperties()
            .Where(x => x.PropertyType == typeof(Color))
            .ToFrozenDictionary(x => x.Name, x => (Color)x.GetValue(null)!);
        
        public static ImmutableArray<Color> All { get; } = Dictionary.Values;
        public static Color PickRandom(Random? random = null) => (random ?? Random.Shared)
            .GetItems(All.AsSpan(), 1)
            .Single();
    }
}