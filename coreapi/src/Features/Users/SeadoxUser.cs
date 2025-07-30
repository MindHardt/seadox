using CoreApi.Features.Docs;
using CoreApi.Features.Invites;
using CoreApi.Features.Uploads;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riok.Mapperly.Abstractions;

namespace CoreApi.Features.Users;

public partial class SeadoxUser
{
    public int Id { get; set; }
    public required long ZitadelId { get; set; }
    public required string? AvatarUrl { get; set; }

    public FileSize StorageUsed { get; set; } = FileSize.Zero;
    
    [MapperIgnore]
    public ICollection<Seadoc>? Seadocs { get; set; }
    [MapperIgnore]
    public ICollection<InviteVisit>? InviteVisits { get; set; }
    
    public class EntityConfiguration : IEntityTypeConfiguration<SeadoxUser>
    {
        public void Configure(EntityTypeBuilder<SeadoxUser> builder)
        {
            builder.HasIndex(x => x.ZitadelId).IsUnique();
            builder.Property(x => x.StorageUsed)
                .HasConversion<FileSize.EfCoreValueConverter, FileSize.EfCoreValueComparer>();
        }
    }
}