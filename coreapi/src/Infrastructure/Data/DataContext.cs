using CoreApi.Features.Docs;
using CoreApi.Features.Uploads;
using CoreApi.Features.Users;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Infrastructure.Data;

public class DataContext(DbContextOptions<DataContext> options) : DbContext(options)
{
    public DbSet<SeadoxUser> Users => Set<SeadoxUser>();
    public DbSet<Seadoc> Seadocs => Set<Seadoc>();
    public DbSet<Upload> Uploads => Set<Upload>();

    /// <summary>
    /// When called in a query, retrieves  lineage of this <see cref="Seadoc"/> from itself to its root ancestor.
    /// </summary>
    // ReSharper disable once InconsistentNaming, UnusedParameter.Global
    public IQueryable<Seadoc> GetLineageOf(int doc_id) => Seadocs
        .Where(x => x.Id == doc_id)
        .SelectMany(x => GetLineageOf(x.Id));

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSnakeCaseNamingConvention();
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDbFunction(typeof(DataContext).GetMethod(nameof(GetLineageOf))!, func =>
        {
            func.HasParameter("doc_id", param => param.HasStoreType("integer"));
            func.HasStoreType("setof seadocs");
            func.HasName("get_lineage_of");
            func.IsBuiltIn(false);
        });
        
        modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
        base.OnModelCreating(modelBuilder);
    }
}