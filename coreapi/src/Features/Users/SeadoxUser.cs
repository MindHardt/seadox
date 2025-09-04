using CoreApi.Features.Colors;
using CoreApi.Features.Docs;
using CoreApi.Features.Uploads;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riok.Mapperly.Abstractions;

namespace CoreApi.Features.Users;

public partial class SeadoxUser
{
    public int Id { get; set; }
    public required long ZitadelId { get; set; }
    public string? AvatarUrl { get; set; }

    public Color Color { get; set; } = Color.GetRandom();

    public FileSize StorageUsed { get; set; } = FileSize.Zero;
    
    [MapperIgnore]
    public ICollection<Seadoc>? Seadocs { get; set; }

    public static string GetCacheKey(long zitadelId) => $"{nameof(SeadoxUser)}:{zitadelId}";
    public string GetCacheKey() => GetCacheKey(ZitadelId);
    
    public class EntityConfiguration : IEntityTypeConfiguration<SeadoxUser>
    {
        public void Configure(EntityTypeBuilder<SeadoxUser> builder)
        {
            builder.HasIndex(x => x.ZitadelId).IsUnique();
            builder.Property(x => x.StorageUsed)
                .HasConversion<FileSize.EfCoreValueConverter, FileSize.EfCoreValueComparer>();
            builder.Property(x => x.Color)
                .HasConversion<Color.EfCoreValueConverter, Color.EfCoreValueComparer>();
        }
    }
}