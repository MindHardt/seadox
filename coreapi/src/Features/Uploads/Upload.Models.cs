using Seadox.CoreApi.Infrastructure.TextIds;

namespace Seadox.CoreApi.Features.Uploads;

public partial class Upload
{
    public record Model
    {
        public required TextId Id { get; set; }
        public required TextId UploaderId { get; set; }
        public required Sha256HashString Hash { get; set; }
        public required string ContentType { get; set; }
        public required string FileName { get; set; }
        public required FileSize FileSize { get; set; }
        public required DateTimeOffset UploadTime { get; set; }
        public required UploadScope Scope { get; set; }
    }
}