using System.Text.RegularExpressions;

namespace CoreApi.Infrastructure.OpenApi;

public interface IRegexValidation
{
    public static abstract Regex ValidationRegex { get; }
}