module.exports = {
    data: {
        name: 'ping',
        description: 'Replies with Pong and latency info!',
    },
    async execute(interaction) {
        const sent = await interaction.deferReply({ fetchReply: true }); // Defer the reply and fetch the message
        const latency = sent.createdTimestamp - interaction.createdTimestamp; // Calculate latency
        const apiLatency = Math.round(interaction.client.ws.ping); // Get the WebSocket ping

        await interaction.editReply(`🏓 Pong! Latency is ${latency}ms. Bot Latency is ${apiLatency}ms.`);
    },
};
