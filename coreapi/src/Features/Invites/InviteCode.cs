using System.Text.Json;
using CoreApi.Features.Workspaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoreApi.Features.Invites;

public class InviteCode
{
    public long Id { get; set; }
    
    public required int WorkspaceId { get; set; }
    public Workspace? Workspace { get; set; }

    public bool Active { get; set; } = true;
    
    public ICollection<InviteVisit>? Visits { get; set; }
    
    public class EntityConfiguration : IEntityTypeConfiguration<InviteCode>
    {
        public void Configure(EntityTypeBuilder<InviteCode> builder)
        {
            builder.HasIndex(x => x.WorkspaceId)
                .HasFilter(JsonNamingPolicy.SnakeCaseLower.ConvertName(nameof(Active)))
                .IsUnique();
            builder.HasOne(x => x.Workspace)
                .WithMany(x => x.InviteCodes)
                .HasForeignKey(x => x.WorkspaceId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}