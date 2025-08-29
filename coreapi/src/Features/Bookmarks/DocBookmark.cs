using CoreApi.Features.Docs;
using CoreApi.Features.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoreApi.Features.Bookmarks;

public class DocBookmark
{
    public required int UserId { get; set; }
    public SeadoxUser? User { get; set; }
    
    public required int DocId { get; set; }
    public Seadoc? Doc { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; }
    
    public class EntityConfiguration : IEntityTypeConfiguration<DocBookmark>
    {
        public void Configure(EntityTypeBuilder<DocBookmark> builder)
        {
            builder.HasKey(x => new { x.DocId, x.UserId });
        }
    }
}