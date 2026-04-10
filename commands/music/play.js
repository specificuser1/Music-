const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioResource, StreamType, createAudioPlayer } = require('@discordjs/voice');
const playdl = require('play-dl');
const { createEmbed } = require('../../utils/embeds');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song or playlist')
        .addStringOption(opt => opt.setName('query').setDescription('Song name or URL').setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply({ embeds: [createEmbed({ title: `${config.emojis.error} Voice Channel Required`, description: 'Pehle kisi voice channel join karein!', color: 0xff0000 })] });
        }

        try {
            const search = await playdl.search(query, { limit: 1 });
            if (!search?.length) throw new Error('No results found');

            const video = search[0];
            const stream = await playdl.stream(video.url, { quality: 0 });

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(stream.stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
            player.play(resource);
            connection.subscribe(player);

            // Queue system ko future mein yahan extend kar sakte hain
            interaction.client.currentPlayer = player;

            await interaction.editReply({ embeds: [createEmbed({
                title: `${config.emojis.play} Now Playing`,
                description: `**${video.title}**\n🕒 ${video.durationFormatted || 'Unknown'}`,
                thumbnail: video.thumbnails[0]?.url
            })] });

        } catch (err) {
            console.error('Play Error:', err.message);
            await interaction.editReply({ embeds: [createEmbed({ title: `${config.emojis.error} Playback Failed`, description: 'Song play nahi ho saka. URL/Query check karein ya baad mein try karein.', color: 0xff0000 })] });
        }
    }
};
