using CoreApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace CoreApi.Tests;

public class ApiFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:17.4")
        .Build();
    public ApiFactory ApiFactory { get; private set; } = null!;
    
    public async ValueTask InitializeAsync()
    {
        await _postgres.StartAsync();
        ApiFactory = new ApiFactory(_postgres);
        await using var scope = ApiFactory.Services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<DataContext>().Database.MigrateAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await ApiFactory.DisposeAsync();
        await _postgres.StopAsync();
    }
}