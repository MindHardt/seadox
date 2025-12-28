using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riok.Mapperly.Abstractions;
using Seadox.CoreApi.Features.Access;
using Seadox.CoreApi.Features.Users;

namespace Seadox.CoreApi.Features.Docs;

public partial class Seadoc
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string? CoverUrl { get; set; }
    public bool IsIndexed { get; set; }
    
    public int? ParentId { get; set; }
    [MapperIgnore]
    public Seadoc? Parent { get; set; }
    [MapperIgnore]
    public ICollection<Seadoc>? Children { get; set; }
    
    public int OwnerId { get; set; }
    [MapperIgnore]
    public SeadoxUser? Owner { get; set; }
    
    public DocumentShareMode Share { get; set; } = DocumentShareMode.Default;
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    
    public class EntityConfiguration : IEntityTypeConfiguration<Seadoc>
    {
        public void Configure(EntityTypeBuilder<Seadoc> builder)
        {
            builder.OwnsOne(x => x.Share);
            
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