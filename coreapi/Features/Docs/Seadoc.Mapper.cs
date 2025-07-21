using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Riok.Mapperly.Abstractions;

namespace CoreApi.Features.Docs;

public partial record Seadoc
{
    [Mapper, RegisterSingleton]
    public partial class Mapper(TextIdEncoders encoders)
    {
        [MapperIgnoreSource(nameof(EqualityContract))]
        [MapProperty(nameof(Id), nameof(Id), Use = nameof(EncodeSeadocId))]
        [MapProperty(nameof(OwnerId), nameof(OwnerId), Use = nameof(EncodeOwnerId))]
        [MapProperty(nameof(ParentId), nameof(ParentId), Use = nameof(EncodeParentId))]
        // ReSharper disable once UnusedMember.Global
        public partial Info ToInfo(Seadoc doc);
        
        public partial IQueryable<Info> ProjectToInfo(IQueryable<Seadoc> query);

        [MapperIgnoreSource(nameof(EqualityContract))]
        public partial Model ToModel(Seadoc doc, IReadOnlyCollection<Info> lineage);

        public TextId EncodeOwnerId(int id) => encoders.User.EncodeTextId(id);
        public TextId EncodeSeadocId(int id) => encoders.Seadocs.EncodeTextId(id);
        public TextId? EncodeParentId(int? id) => encoders.Seadocs.EncodeTextId(id);
    }
}