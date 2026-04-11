const config = require('../../config');
const { createEmbed } = require('../../utils/embeds');

module.exports = {
    name: 'ping',
    aliases: ['pong', 'latency'],
    description: '🏓 Check bot latency',
    
    async execute(message) {
        const start = Date.now();
        const msg = await message.reply({ content: '🔄 Pinging...' });
        const latency = Date.now() - start;
        const apiLatency = Math.round(message.client.ws.ping);

        await msg.edit({ 
            embeds: [createEmbed(
                `${config.emojis.success} Pong!`, 
                `📡 Bot Latency: \`${latency}ms\`\n🌐 API Latency: \`${apiLatency}ms\``, 
                config.premiumColor
            )] 
        });
    }
};
