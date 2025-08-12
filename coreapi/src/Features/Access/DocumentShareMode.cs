using System.Diagnostics.CodeAnalysis;

namespace CoreApi.Features.Access;

public record DocumentShareMode
{
    public required AccessMode Access { get; set; }
    public required ShareType ShareType { get; set; }

    public static DocumentShareMode Default => new()
    {
        Access = AccessMode.None,
        ShareType = ShareType.CurrentOnly
    };
}

public enum AccessMode : sbyte
{
    None = 0,
    Read = 1,
    Write = 2,
}

public enum ShareType : sbyte
{
    CurrentOnly = 0,
    Cascades = 1
}