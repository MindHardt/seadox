using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
using CoreApi.Infrastructure.OpenApi;
using Vogen;

namespace CoreApi.Infrastructure.TextIds;

[ValueObject<string>]
[SuppressMessage("Usage", "AddNormalizeInputMethod:Value Objects can have a method that normalizes (sanitizes) input")]
[SuppressMessage("Usage", "AddValidationMethod:Value Objects can have validation")]
public readonly partial record struct TextId : IRegexValidation
{
    [GeneratedRegex("[A-Z-a-z0-9-_]+")]
    public static partial Regex ValidationRegex { get; }
}