import amqplib from 'amqplib';

let connection = null;
let channel = null;

async function getChannel() {
  if (channel) return channel;
  connection = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
  channel = await connection.createChannel();
  connection.on('error', (err) => {
    console.error('[RabbitMQ] Connection error:', err.message);
    channel = null;
    connection = null;
  });
  return channel;
}

export function createEventBus() {
  return {
    async publish(exchange, routingKey, data) {
      const ch = await getChannel();
      await ch.assertExchange(exchange, 'topic', { durable: true });
      ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      });
    },

    async subscribe(exchange, routingKey, queue, handler) {
      const ch = await getChannel();
      await ch.assertExchange(exchange, 'topic', { durable: true });
      await ch.assertQueue(queue, { durable: true });
      await ch.bindQueue(queue, exchange, routingKey);
      await ch.prefetch(1);
      ch.consume(queue, async (msg) => {
        if (!msg) return;
        try {
          const data = JSON.parse(msg.content.toString());
          await handler(data);
          ch.ack(msg);
        } catch (err) {
          console.error(`[RabbitMQ] Handler error on ${queue}:`, err.message);
          ch.nack(msg, false, false); // dead-letter
        }
      });
    },

    async close() {
      if (channel) await channel.close();
      if (connection) await connection.close();
    },
  };
}
