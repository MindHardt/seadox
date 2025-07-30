using CoreApi.Features.Users;
using CoreApi.Features.Workspaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoreApi.Features.Invites;

public class InviteVisit
{
    public required long InviteCodeId { get; set; }
    public InviteCode? InviteCode { get; set; }
    
    public required int UserId { get; set; }
    public SeadoxUser? User { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public class EntityConfiguration : IEntityTypeConfiguration<InviteVisit>
    {
        public void Configure(EntityTypeBuilder<InviteVisit> builder)
        {
            builder.HasKey(x => new { x.InviteCodeId, x.UserId });
            builder.HasOne(x => x.InviteCode)
                .WithMany(x => x.Visits)
                .HasForeignKey(x => x.InviteCodeId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}