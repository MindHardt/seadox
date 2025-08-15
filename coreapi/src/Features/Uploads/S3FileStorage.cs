using System.ComponentModel.DataAnnotations;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace CoreApi.Features.Uploads;

[RegisterScoped]
public class S3FileStorage(IAmazonS3 s3, IOptions<S3FileStorageOptions> options, ILogger<S3FileStorage> logger)
{
    public async Task<Stream> GetFileStream(Sha256HashString hash, CancellationToken ct = default)
        => (await s3.GetObjectAsync(new GetObjectRequest
        {
            Key = hash.Value,
            BucketName = options.Value.BucketName
        }, ct)).ResponseStream;

    public Task SaveFile(Stream content, Sha256HashString hash, CancellationToken ct = default)
        => s3.PutObjectAsync(new PutObjectRequest
        {
            Key = hash.Value,
            InputStream = content,
            BucketName = options.Value.BucketName
        }, ct);

    public async Task<bool> FileExists(Sha256HashString hash, CancellationToken ct = default)
        => (await s3.ListObjectsAsync(new ListObjectsRequest
        {
            BucketName = options.Value.BucketName,
            Prefix = hash.Value,
            MaxKeys = 1
        }, ct)).S3Objects is [var s3Object, ..] && s3Object.Key == hash.Value;

    public Task DeleteFile(Sha256HashString hash, CancellationToken ct = default)
        => s3.DeleteObjectAsync(new DeleteObjectRequest
        {
            BucketName = options.Value.BucketName,
            Key = hash.Value
        }, ct);

    public async Task Initialize(CancellationToken ct = default)
    {
        try
        {
            await s3.PutBucketAsync(new PutBucketRequest
            {
                BucketName = options.Value.BucketName
            }, ct);
            logger.LogInformation($"{nameof(S3FileStorage)} initialized, bucket created");
        }
        catch (BucketAlreadyOwnedByYouException)
        {
            logger.LogInformation($"{nameof(S3FileStorage)} initialized, bucket already exists");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, $"Error initializing {nameof(S3FileStorage)}");
            throw;
        }
    }
}

public record S3FileStorageOptions
{
    public const string Section = "S3";

    [Required]
    public required string AccessKeyId { get; set; }
    [Required]
    public required string SecretAccessKey { get; set; }
    [Required]
    public required string BucketName { get; set; }

    public string ServiceUrl { get; set; } = "https://s3.yandexcloud.net";
}

public static class DependencyInjection
{
    public static IServiceCollection AddS3FileStorage(this IServiceCollection services)
    {
        services.AddOptions<S3FileStorageOptions>()
            .BindConfiguration(S3FileStorageOptions.Section)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddScoped<IAmazonS3>(sp =>
        {
            var options = sp.GetRequiredService<IOptions<S3FileStorageOptions>>().Value;
            return new AmazonS3Client(
                new BasicAWSCredentials(options.AccessKeyId, options.SecretAccessKey),
                new AmazonS3Config
                {
                    ServiceURL = options.ServiceUrl,
                    ForcePathStyle = true
                });
        });
        return services;
    }
}