namespace Seadox.CoreApi.Features.Users;

public static class RoleNames
{
    public const string Admin = "Admin";
    
    public static bool IsAdmin(this CallerContext.State? state) => state?.Roles.Contains(Admin) is true;
}