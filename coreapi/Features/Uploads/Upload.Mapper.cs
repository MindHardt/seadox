using CoreApi.Infrastructure.TextIds;
using Riok.Mapperly.Abstractions;

namespace CoreApi.Features.Uploads;

public partial record Upload
{
    [Mapper, RegisterSingleton]
    public partial class Mapper(TextIdEncoders encoders)
    {
        [MapperIgnoreSource(nameof(EqualityContract))]   
        [MapProperty(nameof(Id), nameof(Id), Use = nameof(EncodeUploadId))]
        [MapProperty(nameof(UploaderId), nameof(UploaderId), Use = nameof(EncodeUploaderId))]
        public partial Model ToModel(Upload upload);

        public partial IQueryable<Model> ProjectToModel(IQueryable<Upload> uploads);

        public TextId EncodeUploadId(long uploadId) => encoders.Uploads.EncodeTextId(uploadId);
        public TextId EncodeUploaderId(int uploaderId) => encoders.Seadocs.EncodeTextId(uploaderId);
    }
}