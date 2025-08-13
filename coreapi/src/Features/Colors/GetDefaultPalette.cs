using Immediate.Apis.Shared;
using Immediate.Handlers.Shared;
using Microsoft.AspNetCore.Http.HttpResults;

namespace CoreApi.Features.Colors;

[Handler, MapGet("/colors/palette")]
public partial class GetDefaultPalette
{
    public record Request;
    
    internal static void CustomizeEndpoint(IEndpointConventionBuilder endpoint) => endpoint
        .AllowAnonymous()
        .WithTags(nameof(Color))
        .WithDescription("Получение цветов пользователей по умолчанию");

    private static ValueTask<Ok<IReadOnlyDictionary<string, Color>>> HandleAsync(
        Request _,
        CancellationToken ct)
    {
        IReadOnlyDictionary<string, Color> result = new OrderedDictionary<string, Color>(collection: 
            Color.DefaultPalette.Dictionary
            .OrderBy(kvp => kvp.Value.ToRgbInt()));
        return ValueTask.FromResult(TypedResults.Ok(result));
    }
}