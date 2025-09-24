using Riok.Mapperly.Abstractions;
using Seadox.CoreApi.Infrastructure.TextIds;

namespace Seadox.CoreApi.Features.Users;

public partial class SeadoxUser
{
    [Mapper, RegisterSingleton]
    public partial class Mapper(TextIdEncoders encoders)
    {
        [MapperIgnoreSource(nameof(StorageUsed))]
        [MapProperty(nameof(Id), nameof(Id), Use = nameof(EncodeUserId))]
        public partial Model ToModel(SeadoxUser user);
        
        public partial IQueryable<Model> ProjectToModel(IQueryable<SeadoxUser> query);

        private TextId EncodeUserId(int id) => encoders.Seadocs.EncodeTextId(id);
    }
}