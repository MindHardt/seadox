using CoreApi.Features.Docs;
using CoreApi.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoreApi.Features.Workspaces;

public partial class Workspace
{
    public class Context(IReadOnlyCollection<Seadoc> docs, int userId)
    {
        private readonly OrderedDictionary<Seadoc, Workspace?>  _workspaces = new(docs.Select(x =>
            KeyValuePair.Create(x, x.Workspace)));
        public Seadoc TargetDoc { get; } = docs.Last();
        public int UserId { get; } = userId;

        public WorkspaceAccess GetGrantedAccess(Seadoc? doc = null)
        {
            doc ??= TargetDoc;
            return doc.OwnerId == UserId ? WorkspaceAccess.Write : _workspaces
                .TakeWhile(kvp => kvp.Key != doc)
                .Select(kvp => kvp.Value)
                .Append(_workspaces[doc])
                .OfType<Workspace>()
                .Select(x => x.Access)
                .DefaultIfEmpty(WorkspaceAccess.None)
                .Aggregate((l, r) => (WorkspaceAccess)sbyte.Max((sbyte)l, (sbyte)r));
        }

        public bool IsGranted(WorkspaceAccess access, Seadoc? doc = null) => GetGrantedAccess(doc) >= access;
        
        public static async Task<Context> FetchAsync(DataContext db, int docId, int userId, CancellationToken ct)
            => new(await db.Seadocs
                .GetLineageOf(docId)
                .Include(x => x.Workspace!)
                .ThenInclude(x => x.InviteCodes!.Where(ic => ic.Visits!.Any(iv => iv.UserId == userId)))
                .ToListAsync(ct), userId);
    }
}