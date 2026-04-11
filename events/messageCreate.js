const { createEmbed } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        // ❌ Ignore bots & DMs
        if (message.author.bot || !message.guild) return;

        // 🔍 Check Prefix
        const prefixUsed = config.prefix.find(p => message.content.startsWith(p));
        if (!prefixUsed) return;

        // 📝 Parse Command
        const args = message.content.slice(prefixUsed.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        
        // 🔎 Find Command
        const command = client.commands.get(cmdName) || client.aliases.get(cmdName);
        if (!command) return;

        // ⚙️ Permission Checks
        if (command.permissions && !message.member.permissions.has(command.permissions)) {
            return message.reply({ 
                embeds: [createEmbed(`${config.emojis.error} Permission Denied`, 'Aapke paas yeh command use karne ki permission nahi hai.', config.errorColor)] 
            });
        }

        if (command.botPermissions && !message.guild.members.me.permissions.has(command.botPermissions)) {
            return message.reply({ 
                embeds: [createEmbed(`${config.emojis.error} Bot Missing Permissions`, 'Mujhe kuch permissions chahiye yeh command run karne ke liye.', config.errorColor)] 
            });
        }

        // 🎯 Voice Channel Check (Music Commands)
        if (command.voiceChannel && !message.member.voice.channel) {
            return message.reply({ 
                embeds: [createEmbed(`${config.emojis.error} Voice Required`, 'Pehle kisi voice channel join karein!', config.errorColor)] 
            });
        }

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(`❌ [${cmdName}]`, error);
            message.reply({ 
                embeds: [createEmbed(`${config.emojis.error} Command Error`, 'Kuch galat ho gaya. Baad mein try karein.', config.errorColor)] 
            });
        }
    }
};
