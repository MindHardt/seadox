using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using CoreApi;
using CoreApi.Features.Users;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.OpenApi;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Npgsql;
using Scalar.AspNetCore;
using Zitadel.Authentication;
using Zitadel.Extensions;

var builder = WebApplication.CreateBuilder(args);

var npgsql = new NpgsqlDataSourceBuilder(builder.Configuration.GetConnectionString("Postgres"))
    .EnableDynamicJson()
    .Build();

builder.Services.AddDbContext<DataContext>(db => db.UseNpgsql(npgsql));

builder.Services.AddHybridCache();
builder.Services.AddStackExchangeRedisCache(redis =>
{
    redis.Configuration = builder.Configuration.GetConnectionString("Redis");
});

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
        zitadel.ClientId = builder.Configuration["Zitadel:ClientId"];
        zitadel.ClientSecret = builder.Configuration["Zitadel:ClientSecret"];
    });

builder.Services.AddHttpContextAccessor();
builder.Services.AddCoreApiHandlers();
builder.Services.AutoRegisterFromCoreApi();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    await scope.ServiceProvider.GetRequiredService<DataContext>().Database.MigrateAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsProduction() is false)
{
    app.MapOpenApi();
    app.MapScalarApiReference(scalar => scalar.AddPreferredSecuritySchemes(ZitadelDefaults.AuthenticationScheme));
    app.MapGet("/", () => Results.Redirect("/scalar")).ExcludeFromDescription();
}

app.MapCoreApiEndpoints();

app.Run();
