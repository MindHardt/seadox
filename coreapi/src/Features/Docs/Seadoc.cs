using CoreApi.Features.Access;
using CoreApi.Features.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riok.Mapperly.Abstractions;

namespace CoreApi.Features.Docs;

public partial class Seadoc
{
    public const string ContentsBucketName = "seadocs.contents";
    public string GetKey() => $"{nameof(Seadoc)}_{Id}";
    
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string? CoverUrl { get; set; }
    
    public int? ParentId { get; set; }
    [MapperIgnore]
    public Seadoc? Parent { get; set; }
    [MapperIgnore]
    public ICollection<Seadoc>? Children { get; set; }
    
    public int OwnerId { get; set; }
    [MapperIgnore]
    public SeadoxUser? Owner { get; set; }
    
    [MapperIgnore]
    public DocumentShareMode Share { get; set; } = DocumentShareMode.Default;
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    public class EntityConfiguration : IEntityTypeConfiguration<Seadoc>
    {
        public void Configure(EntityTypeBuilder<Seadoc> builder)
        {
            builder.OwnsOne(x => x.Share, prop => prop.ToJson());
            
            builder.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.HasOne(x => x.Owner)
                .WithMany(x => x.Seadocs)
                .HasForeignKey(x => x.OwnerId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}