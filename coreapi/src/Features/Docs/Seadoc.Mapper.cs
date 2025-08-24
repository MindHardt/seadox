using CoreApi.Features.Access;
using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Microsoft.EntityFrameworkCore;
using Riok.Mapperly.Abstractions;
using Sqids;

namespace CoreApi.Features.Docs;

public partial class Seadoc
{
    [Mapper, RegisterSingleton]
    public partial class Mapper(TextIdEncoders encoders)
    {
        public SqidsEncoder<int> Encoder { get; } = encoders.Seadocs;
        
        [MapProperty(nameof(Id), nameof(Id), Use = nameof(EncodeSeadocId))]
        [MapProperty(nameof(OwnerId), nameof(OwnerId), Use = nameof(EncodeOwnerId))]
        [MapProperty(nameof(ParentId), nameof(ParentId), Use = nameof(EncodeParentId))]
        // ReSharper disable once UnusedMember.Global
        public partial Info ToInfo(Seadoc doc);
        
        public partial IQueryable<Info> ProjectToInfo(IQueryable<Seadoc> query);
        
        public partial Model ToModel(Seadoc doc, IReadOnlyCollection<Info> lineage, AccessLevel accessLevel);

        public async Task<Model> ToModelAsync(Seadoc doc, DataContext dataContext, int? userId, CancellationToken ct)
        {
            var lineage = await dataContext.GetLineageOf(doc.Id)
                .Project(ProjectToInfo)
                .ToListAsync(ct);
            var access = await dataContext.GetAccessLevelOf(doc, userId, ct);
            
            return ToModel(doc, lineage, access);
        }

        public TextId EncodeOwnerId(int id) => Encoder.EncodeTextId(id);
        public TextId EncodeSeadocId(int id) => Encoder.EncodeTextId(id);
        public TextId? EncodeParentId(int? id) => Encoder.EncodeTextId(id);
    }
}