using CoreApi.Infrastructure;
using CoreApi.Infrastructure.Data;
using CoreApi.Infrastructure.TextIds;
using Microsoft.EntityFrameworkCore;
using Riok.Mapperly.Abstractions;

namespace CoreApi.Features.Docs;

public partial class Seadoc
{
    [Mapper, RegisterSingleton]
    public partial class Mapper(TextIdEncoders encoders)
    {
        [MapProperty(nameof(Id), nameof(Id), Use = nameof(EncodeSeadocId))]
        [MapProperty(nameof(OwnerId), nameof(OwnerId), Use = nameof(EncodeOwnerId))]
        [MapProperty(nameof(ParentId), nameof(ParentId), Use = nameof(EncodeParentId))]
        // ReSharper disable once UnusedMember.Global
        public partial Info ToInfo(Seadoc doc);
        
        public partial IQueryable<Info> ProjectToInfo(IQueryable<Seadoc> query);
        
        public partial Model ToModel(Seadoc doc, IReadOnlyCollection<Info> lineage);

        public async Task<Model> ToModelAsync(Seadoc doc, DataContext dataContext, CancellationToken ct)
        {
            var lineage = await dataContext.GetLineageOf(doc.Id)
                .Project(ProjectToInfo)
                .ToListAsync(ct);
            
            return ToModel(doc, lineage);
        }

        public TextId EncodeOwnerId(int id) => encoders.User.EncodeTextId(id);
        public TextId EncodeSeadocId(int id) => encoders.Seadocs.EncodeTextId(id);
        public TextId? EncodeParentId(int? id) => encoders.Seadocs.EncodeTextId(id);
    }
}