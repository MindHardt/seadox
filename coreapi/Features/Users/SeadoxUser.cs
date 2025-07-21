using CoreApi.Features.Docs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Riok.Mapperly.Abstractions;

namespace CoreApi.Features.Users;

public partial record SeadoxUser
{
    public int Id { get; set; }
    public required long ZitadelId { get; set; }
    public required string? AvatarUrl { get; set; }
    
    [MapperIgnore]
    public ICollection<Seadoc>? Seadocs { get; set; }
    
    public class EntityConfiguration : IEntityTypeConfiguration<SeadoxUser>
    {
        public void Configure(EntityTypeBuilder<SeadoxUser> builder)
        {
            builder.HasIndex(x => x.ZitadelId).IsUnique();
        }
    }
}