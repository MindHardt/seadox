using CoreApi.Features.Docs;
using CoreApi.Features.Invites;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CoreApi.Features.Workspaces;

public partial class Workspace
{
    public int Id { get; set; }
    
    public required int DocId { get; set; }
    public Seadoc? Doc { get; set; }
    
    public required WorkspaceAccess Access { get; set; }
    /// <summary>
    /// If <see langword="true"/>, then this <see cref="Workspace"/> does not restrict
    /// access granted by previous <see cref="Workspace"/>s.
    /// </summary>
    public bool Inherits { get; set; } = true;
    
    public ICollection<InviteCode>? InviteCodes { get; set; }

    public class EntityConfiguration : IEntityTypeConfiguration<Workspace>
    {
        public void Configure(EntityTypeBuilder<Workspace> builder)
        {
            builder.HasOne(x => x.Doc)
                .WithOne(x => x.Workspace)
                .HasForeignKey<Workspace>(x => x.DocId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

public enum WorkspaceAccess : sbyte
{
    None = 0,
    Read = 1,
    Write = 2,
}