using System.Security.Cryptography;
using System.Text.RegularExpressions;
using CoreApi.Infrastructure.OpenApi;
using Vogen;

namespace CoreApi.Features.Uploads;

[ValueObject<string>(Conversions.SystemTextJson | Conversions.EfCoreValueConverter)]
public readonly partial struct Sha256HashString : IRegexValidation
{
    public const int LengthBytes = SHA256.HashSizeInBytes;
    public const int LengthChars = LengthBytes * 2;
    
    [GeneratedRegex("[0-9A-F]{64}")]
    public static partial Regex ValidationRegex { get; }

    private static string NormalizeInput(string input) => input.ToUpper();

    private static Validation Validate(string input) => input switch
    {
        { Length: not LengthChars } => Validation.Invalid($"{nameof(Sha256HashString)} length must be {LengthChars}."),
        _ when ValidationRegex.IsMatch(input) => Validation.Ok,
        _ => Validation.Invalid($"input string {input} does not satisfy regex {ValidationRegex}")
    };

}