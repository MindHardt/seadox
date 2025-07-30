using CoreApi.Features.Docs;
using CoreApi.Features.Invites;
using CoreApi.Features.Uploads;
using CoreApi.Features.Users;
using CoreApi.Features.Workspaces;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Infrastructure.Data;

public class DataContext(DbContextOptions<DataContext> options) : DbContext(options)
{
    public DbSet<SeadoxUser> Users => Set<SeadoxUser>();
    public DbSet<Seadoc> Seadocs => Set<Seadoc>();
    public DbSet<Upload> Uploads => Set<Upload>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<InviteCode> InviteCodes => Set<InviteCode>();
    public DbSet<InviteVisit> InviteVisits => Set<InviteVisit>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSnakeCaseNamingConvention();
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
        base.OnModelCreating(modelBuilder);
    }
}