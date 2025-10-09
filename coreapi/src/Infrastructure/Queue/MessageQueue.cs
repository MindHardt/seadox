using RabbitMQ.Client;
using Seadox.Shared.Protos;

namespace Seadox.CoreApi.Infrastructure.Queue;

public class MessageQueue(ConnectionFactory connections, ILogger<MessageQueue> logger) : IAsyncDisposable
{
    public readonly record struct RabbitInterface(IConnection Connection, IChannel Channel);
    private Lazy<Task<RabbitInterface>>? _connectionTask;

    public async ValueTask<RabbitInterface> GetConnectionAsync(CancellationToken ct = default)
    {
        _connectionTask ??= new Lazy<Task<RabbitInterface>>(async () =>
        {
            var conn = await connections.CreateConnectionAsync(ct);
            var channel = await conn.CreateChannelAsync(cancellationToken: ct);
            return new RabbitInterface(conn, channel);
        });
        return await _connectionTask.Value;
    }

    public async ValueTask InitializeAsync()
    {
        var (_, channel) = await GetConnectionAsync();
        await channel.ExchangeDeclareAsync(nameof(ImportRequest), ExchangeType.Direct, durable: true, autoDelete: false);
        await channel.QueueDeclareAsync(nameof(ImportRequest), durable: true, exclusive: false);
        await channel.QueueBindAsync(nameof(ImportRequest), nameof(ImportRequest), "*");

        logger.LogInformation("MessageQueue initialized");
    }

    public async ValueTask DisposeAsync()
    {
        if (_connectionTask is not { IsValueCreated: true })
        {
            return;
        }
        var (conn, channel) = await _connectionTask.Value;
        await channel.CloseAsync();
        await conn.CloseAsync();
        await channel.DisposeAsync();
        await conn.DisposeAsync();
    }
}