using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Seadox.CoreApi.Features.Docs;
using Seadox.CoreApi.Features.Users;

namespace Seadox.CoreApi.Features.Bookmarks;

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