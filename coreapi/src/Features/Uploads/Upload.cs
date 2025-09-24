using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riok.Mapperly.Abstractions;
using Seadox.CoreApi.Features.Users;

namespace Seadox.CoreApi.Features.Uploads;

public partial class Upload
{
    public long Id { get; set; }
    public required Sha256HashString Hash { get; set; }
    public required string ContentType { get; set; }
    public required string FileName { get; set; }
    public required UploadScope Scope { get; set; }
    public required FileSize FileSize { get; set; }
    
    public int UploaderId { get; set; }
    [MapperIgnore]
    public SeadoxUser? Uploader { get; set; }
    
    public DateTimeOffset UploadTime { get; set; } = DateTimeOffset.UtcNow;

    public static string CacheKey(long id) => nameof(Upload) + ':' + id;
    public class EntityConfiguration : IEntityTypeConfiguration<Upload>
    {
        public void Configure(EntityTypeBuilder<Upload> builder)
        {
            builder.HasIndex(x => x.Hash);
            builder.Property(x => x.Hash)
                .HasConversion<Sha256HashString.EfCoreValueConverter, Sha256HashString.EfCoreValueComparer>()
                .HasMaxLength(Sha256HashString.LengthChars)
                .UseCollation("C");
            builder.Property(x => x.FileSize)
                .HasConversion<FileSize.EfCoreValueConverter, FileSize.EfCoreValueComparer>();
        }
    }
}

[JsonConverter(typeof(JsonStringEnumConverter<UploadScope>))]
public enum UploadScope : sbyte
{
    Admin = -128,
    Attachment = 0,
    Avatar = 1
}