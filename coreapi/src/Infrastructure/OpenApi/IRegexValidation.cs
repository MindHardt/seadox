using System.Text.RegularExpressions;

namespace Seadox.CoreApi.Infrastructure.OpenApi;

public interface IRegexValidation
{
    public static abstract Regex ValidationRegex { get; }
}