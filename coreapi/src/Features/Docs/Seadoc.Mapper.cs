using Microsoft.EntityFrameworkCore;
using Riok.Mapperly.Abstractions;
using Seadox.CoreApi.Features.Access;
using Seadox.CoreApi.Features.Users;
using Seadox.CoreApi.Infrastructure;
using Seadox.CoreApi.Infrastructure.Data;
using Seadox.CoreApi.Infrastructure.TextIds;
using Sqids;

namespace Seadox.CoreApi.Features.Docs;

public partial class Seadoc
{
    [Mapper, RegisterSingleton]
    public partial class Mapper(TextIdEncoders encoders)
    {
        public SqidsEncoder<int> Encoder { get; } = encoders.Seadocs;
        
        [MapProperty(nameof(Id), nameof(Id), Use = nameof(EncodeSeadocId))]
        [MapProperty(nameof(OwnerId), nameof(OwnerId), Use = nameof(EncodeOwnerId))]
        [MapProperty(nameof(ParentId), nameof(ParentId), Use = nameof(EncodeParentId))]
        [MapperIgnoreSource(nameof(Share))]
        // ReSharper disable once UnusedMember.Global
        public partial Info ToInfo(Seadoc doc);
        
        public partial IQueryable<Info> ProjectToInfo(IQueryable<Seadoc> query);
        
        public partial Model ToModel(Seadoc doc, IReadOnlyCollection<Info> lineage, IReadOnlyCollection<Info> children, AccessLevel accessLevel);

        public async Task<Model> ToModelAsync(
            Seadoc doc, 
            DataContext dataContext, 
            CallerContext.State? state, 
            CancellationToken ct)
        {
            var lineage = await dataContext.GetLineageOf(doc.Id)
                .Project(ProjectToInfo)
                .ToListAsync(ct);
            var children = await dataContext.DocsVisibleTo(state?.UserId)
                .Where(x => x.ParentId == doc.Id)
                .OrderBy(x => x.Id)
                .Project(ProjectToInfo)
                .ToListAsync(ct);
            var access = state.IsAdmin()
                ? AccessLevel.Write
                : await dataContext.GetAccessLevelOf(doc, state?.UserId, ct);
            
            return ToModel(doc, lineage, children, access);
        }

        public TextId EncodeOwnerId(int id) => Encoder.EncodeTextId(id);
        public TextId EncodeSeadocId(int id) => Encoder.EncodeTextId(id);
        public TextId? EncodeParentId(int? id) => Encoder.EncodeTextId(id);
    }
}