const { EmbedBuilder } = require('discord.js');
const config = require('../../config');

module.exports = {
    name: 'help',
    aliases: ['h', 'commands'],
    description: '📋 Show all available commands',
    
    execute(message) {
        const embed = new EmbedBuilder()
            .setColor(config.premiumColor)
            .setTitle('🎵 Mozi Music Bot - Commands')
            .setDescription('Prefix: `' + config.prefix.join('`, `') + '`')
            .addFields(
                {
                    name: '🎧 Music Commands',
                    value: 
                        '`!play <query>` - Play a song\n' +
                        '`!queue` - Show current queue\n' +
                        '`!skip` - Skip current song\n' +
                        '`!stop` - Stop music & leave\n' +
                        '`!pause` - Pause the song\n' +
                        '`!resume` - Resume paused song\n' +
                        '`!volume <1-100>` - Set volume',
                    inline: false
                },
                {
                    name: '⚙️ System Commands',
                    value: 
                        '`!help` - Show this menu\n' +
                        '`!ping` - Check bot latency\n' +
                        '`!prefix` - Show current prefix',
                    inline: false
                }
            )
            .setFooter({ text: config.footer })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
