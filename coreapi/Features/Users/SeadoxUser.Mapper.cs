using CoreApi.Infrastructure.TextIds;
using Riok.Mapperly.Abstractions;

namespace CoreApi.Features.Users;

public partial record SeadoxUser
{
    [Mapper, RegisterSingleton]
    public partial class Mapper(TextIdEncoders encoders)
    {
        [MapperIgnoreSource(nameof(EqualityContract))]
        [MapperIgnoreSource(nameof(StorageUsed))]
        [MapProperty(nameof(Id), nameof(Id), Use = nameof(EncodeUserId))]
        public partial Model ToModel(SeadoxUser user);
        
        public partial IQueryable<Model> ProjectToModel(IQueryable<SeadoxUser> query);

        private TextId EncodeUserId(int id) => encoders.Seadocs.EncodeTextId(id);
    }
}