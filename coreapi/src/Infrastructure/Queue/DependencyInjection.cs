using RabbitMQ.Client;

namespace Seadox.CoreApi.Infrastructure.Queue;

public static class DependencyInjection
{
    public static IServiceCollection AddMessageQueue(this IServiceCollection services)
    {
        services.AddSingleton<ConnectionFactory>(sp => new ConnectionFactory
        {
            Uri = new Uri(sp.GetRequiredService<IConfiguration>().GetConnectionString("RabbitMQ")!)
        });
        services.AddSingleton<MessageQueue>();
        services.AddOptions<RabbitMqOptions>()
            .BindConfiguration(RabbitMqOptions.Section)
            .ValidateDataAnnotations()
            .ValidateOnStart();
        return services;
    }
}

public record RabbitMqOptions
{
    public const string Section = "RabbitMQ";
}