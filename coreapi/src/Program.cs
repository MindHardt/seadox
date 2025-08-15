using Amazon.S3;
using CoreApi;
using CoreApi.Features.Docs;
using CoreApi.Features.Uploads;
using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.OpenApi;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Npgsql;
using Scalar.AspNetCore;
using Serilog;
using Zitadel.Authentication;
using Zitadel.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog(logger => logger.ReadFrom.Configuration(builder.Configuration));

builder.Services.AddDbContext<DataContext>((sp, db) =>
{
    var connStr = sp.GetRequiredService<IConfiguration>().GetConnectionString("Postgres");
    var npgsql = new NpgsqlDataSourceBuilder(connStr)
        .EnableDynamicJson()
        .Build();
    db.UseNpgsql(npgsql);
});

builder.Services.AddHybridCache();
if (builder.Configuration.GetConnectionString("Redis") is { Length: > 0 } redisConn)
{
    builder.Services.AddStackExchangeRedisCache(redis =>
    {
        redis.Configuration = redisConn;
    });   
}

builder.Services.AddS3FileStorage();
builder.Services.AddOpenApi(openapi =>
{
    openapi.AddSchemaTransformer<ValueObjectTransformer>();
    openapi.AddSchemaTransformer<SchemaNamingTransformer>();
    openapi.AddDocumentTransformer((doc, ctx, ct) =>
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

builder.Services.AddHttpContextAccessor();
builder.Services.ConfigureHttpJsonOptions(httpJson => httpJson.SerializerOptions.SetDefaults());
builder.Services.AddCoreApiBehaviors();
builder.Services.AddCoreApiHandlers();
builder.Services.AutoRegisterFromCoreApi();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    await scope.ServiceProvider.GetRequiredService<DataContext>().Database.MigrateAsync();
    await scope.ServiceProvider.GetRequiredService<S3FileStorage>().Initialize();
    await scope.ServiceProvider.GetRequiredService<IAmazonS3>().EnsureSeadocContentsBucket();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsProduction() is false)
{
    app.MapOpenApi();
    app.MapScalarApiReference(scalar => scalar.AddPreferredSecuritySchemes(ZitadelDefaults.AuthenticationScheme));
    app.MapGet("/", () => Results.Redirect("/scalar")).ExcludeFromDescription();
}

app.UseAuthentication();

app.UseAuthorization();

app.MapCoreApiEndpoints();

app.Run();

namespace CoreApi
{
    public partial class Program;
}