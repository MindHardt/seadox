namespace Seadox.CoreApi.Features.Access;

public record DocumentShareMode
{
    public required AccessLevel Access { get; set; }
    public required ShareType Type { get; set; }

    public static DocumentShareMode Default => new()
    {
        Access = AccessLevel.None,
        Type = ShareType.CurrentOnly
    };
}

public enum AccessLevel : sbyte
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