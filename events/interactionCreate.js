const { createEmbed } = require('../utils/embeds');
const config = require('../config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            return interaction.reply({ embeds: [createEmbed({ title: `${config.emojis.error} Unknown Command`, description: 'Yeh command exist nahi karti.', color: 0xff0000 })], ephemeral: true });
        }

        try {
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`❌ [${interaction.commandName}]`, error);
            const reply = { embeds: [createEmbed({ title: `${config.emojis.error} Command Error`, description: 'Kuch galat ho gaya. Baad mein try karein.', color: 0xff0000 })], ephemeral: true };
            if (interaction.replied || interaction.deferred) await interaction.editReply(reply);
            else await interaction.reply(reply);
        }
    }
};
