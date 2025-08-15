using Amazon.S3;
using Amazon.S3.Model;

namespace CoreApi.Features.Docs;

public static class SeadocExtensions
{
    public static Task EnsureSeadocContentsBucket(this IAmazonS3 s3)
        => s3.EnsureBucketExistsAsync(Seadoc.ContentsBucketName);
}