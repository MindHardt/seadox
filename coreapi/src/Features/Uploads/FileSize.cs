using Vogen;

namespace CoreApi.Features.Uploads;

[ValueObject<long>(Conversions.SystemTextJson | Conversions.EfCoreValueConverter)]
public readonly partial struct FileSize
{
    public static FileSize Zero { get; } = FromBytes(0);
    
    public long Bytes => Value;
    public decimal KiloBytes => Bytes / 1024m;
    public decimal MegaBytes => KiloBytes / 1024m;
    public decimal GigaBytes => MegaBytes / 1024m;
    
    public static FileSize FromBytes(long bytes) => From(bytes);
    public static FileSize FromKiloBytes(decimal kilobytes) => FromBytes((long)kilobytes * 1024);
    public static FileSize FromMegaBytes(decimal megabytes) => FromKiloBytes(megabytes * 1024);
    public static FileSize FromGigaBytes(decimal gigabytes) => FromMegaBytes(gigabytes * 1024);

    private static Validation Validate(long input) => input < 0
        ? Validation.Invalid($"{nameof(FileSize)} cannot be negative")
        : Validation.Ok;
}