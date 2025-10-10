using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Npgsql;
using Scalar.AspNetCore;
using Seadox.CoreApi;
using Seadox.CoreApi.Features.Uploads;
using Seadox.CoreApi.Infrastructure;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.OpenApi;
using Serilog;
using StackExchange.Redis;
using Zitadel.Authentication;
using Zitadel.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog(logger => logger.ReadFrom.Configuration(builder.Configuration));

builder.Services.AddSingleton(sp =>
    new NpgsqlDataSourceBuilder(sp.GetRequiredService<IConfiguration>().GetConnectionString("Postgres"))
        .EnableDynamicJson()
        .Build());
builder.Services.AddDbContext<DataContext>((sp, db) =>
{
    db.UseNpgsql(sp.GetRequiredService<NpgsqlDataSource>());
});

builder.Services.AddHybridCache();
if (builder.Configuration.GetConnectionString("Redis") is { Length: > 0 } redisConn)
{
    var multiplexerTask = async () => await ConnectionMultiplexer.ConnectAsync(redisConn, config =>
        {
            config.AbortOnConnectFail = false;
        })
        as IConnectionMultiplexer;
    builder.Services.AddStackExchangeRedisCache(redis =>
    {
        redis.ConnectionMultiplexerFactory = multiplexerTask;
    });   
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

builder.Services.AddS3FileStorage();
builder.Services.AddHealthChecks();
builder.Services.AddOpenApi(openapi =>
{
    openapi.AddSchemaTransformer<ValueObjectTransformer>();
    openapi.AddSchemaTransformer<SchemaNamingTransformer>();
    openapi.AddOperationTransformer<CustomizeOpenApi.OperationTransformer>();
    openapi.AddSchemaTransformer<CustomizeOpenApi.SchemaTransformer>();
    openapi.AddSchemaTransformer<OptionalTransformer>();
    openapi.AddDocumentTransformer((doc, _, _) =>
    {
        doc.Components ??= new OpenApiComponents();
        doc.Components.SecuritySchemes = new Dictionary<string, OpenApiSecurityScheme>
        {
            [ZitadelDefaults.AuthenticationScheme] = new()
            {
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "jwt",
                Description = "Zitadel jwt token"
            }
        };
        return Task.CompletedTask;
    });
    openapi.CreateSchemaReferenceId = type => SchemaNamingTransformer.GetTypeName(type.Type);
});

builder.Services
    .AddAuthorization()
    .AddAuthentication(ZitadelDefaults.AuthenticationScheme)
    .AddZitadelIntrospection(zitadel =>
    {
        zitadel.Authority = builder.Configuration["Zitadel:Authority"];
        zitadel.IntrospectionEndpoint = builder.Configuration["Zitadel:Authority"] + "/oauth/v2/introspect";
        zitadel.ClientId = builder.Configuration["Zitadel:ClientId"];
        zitadel.ClientSecret = builder.Configuration["Zitadel:ClientSecret"];
        
        zitadel.DiscoveryPolicy.RequireHttps = builder.Environment.IsProduction();
        zitadel.EnableCaching = true;
        zitadel.CacheKeyPrefix = "CoreApi:Zitadel:";

        if (builder.Configuration["Zitadel:HostMask"] is { Length: > 0 } host)
        {
            zitadel.Events.OnSendingRequest = ctx =>
            {
                ctx.TokenIntrospectionRequest.Headers.Host = host;
                return Task.CompletedTask;
            };
        }
        
    });

builder.Services.AddDataProtection().PersistKeysToDbContext<DataContext>();

builder.Services.AddCors();
builder.Services.AddHttpContextAccessor();
builder.Services.ConfigureHttpJsonOptions(httpJson => httpJson.SerializerOptions.SetDefaults());
builder.Services.AddCoreApiBehaviors();
builder.Services.AddCoreApiHandlers();
builder.Services.AutoRegisterFromCoreApi();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    await scope.ServiceProvider.GetRequiredService<DataContext>().Database.MigrateAsync();
    if (builder.Environment.IsDevelopment())
    {
        await scope.ServiceProvider.GetRequiredService<S3FileStorage>().Initialize();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsProduction() is false)
{
    app.MapOpenApi();
    app.MapScalarApiReference(scalar => scalar.AddPreferredSecuritySchemes(ZitadelDefaults.AuthenticationScheme));
    app.MapGet("/", () => Results.Redirect("/scalar")).ExcludeFromDescription();
}

app.UseHealthChecks("/healthz");

app.UseAuthentication();
app.UseAuthorization();

app.MapCoreApiEndpoints();

app.Run();

namespace Seadox.CoreApi
{
    // ReSharper disable once ClassNeverInstantiated.Global
    // ReSharper disable once PartialTypeWithSinglePart
    public partial class Program;
}