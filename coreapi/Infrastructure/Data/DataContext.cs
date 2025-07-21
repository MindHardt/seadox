using CoreApi.Features.Docs;
using CoreApi.Features.Users;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Infrastructure.Data;

public class DataContext(DbContextOptions<DataContext> options) : DbContext(options)
{
    public DbSet<SeadoxUser> Users => Set<SeadoxUser>();
    public DbSet<Seadoc> Seadocs => Set<Seadoc>();

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