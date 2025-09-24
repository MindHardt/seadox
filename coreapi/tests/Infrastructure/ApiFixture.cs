using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Seadox.CoreApi.Infrastructure.Data;
using Testcontainers.Minio;
using Testcontainers.PostgreSql;

namespace Seadox.CoreApi.Tests.Infrastructure;

public class ApiFixture : IAsyncLifetime
{
    private readonly MinioContainer _minio = new MinioBuilder()
        .WithUsername("minio-user")
        .WithPassword("minio-password")
        .Build();
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:17.4")
        .Build();
    public ApiFactory ApiFactory { get; private set; } = null!;
    
    public async ValueTask InitializeAsync()
    {
        await Task.WhenAll(_postgres.StartAsync(), _minio.StartAsync());
        ApiFactory = new ApiFactory(_postgres, _minio);
        await using var scope = ApiFactory.Services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<DataContext>().Database.MigrateAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await ApiFactory.DisposeAsync();
        await _postgres.StopAsync();
    }
}