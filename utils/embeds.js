const { EmbedBuilder } = require('discord.js');
const config = require('../config');

function createEmbed({ title, description, color, thumbnail, fields = [] } = {}) {
    const embed = new EmbedBuilder()
        .setColor(color || config.premiumColor)
        .setFooter({ text: config.footer })
        .setTimestamp();

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (fields.length) embed.addFields(fields);

    return embed;
}

module.exports = { createEmbed };
