using CoreApi.Features.Uploads;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.Minio;
using Testcontainers.PostgreSql;

namespace CoreApi.Tests.Infrastructure;

public class ApiFactory(PostgreSqlContainer postgres, MinioContainer minio) : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration(config =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                // ["Serilog:MinimumLevel:Default"] = "Debug",
                ["ConnectionStrings:Postgres"] = postgres.GetConnectionString(),
                ["ConnectionStrings:Redis"] = null,
                [$"{S3FileStorageOptions.Section}:{nameof(S3FileStorageOptions.ServiceUrl)}"] = minio.GetConnectionString(),
                [$"{S3FileStorageOptions.Section}:{nameof(S3FileStorageOptions.AccessKeyId)}"] = minio.GetAccessKey(),
                [$"{S3FileStorageOptions.Section}:{nameof(S3FileStorageOptions.SecretAccessKey)}"] = minio.GetSecretKey()
            });
        });
        builder.ConfigureServices(services =>
        {
            services.AddSingleton(SampleData.TextIdEncoders());
            services.AddFakeAuth();
        });
        base.ConfigureWebHost(builder);
    }
}