const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType, AudioPlayerStatus } = require('@discordjs/voice');
const playdl = require('play-dl');
const config = require('../../config');
const ffmpeg = require('ffmpeg-static');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube or URL')
        .addStringOption(opt => opt.setName('query').setDescription('Song name or URL').setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        // ✅ Voice channel validation
        if (!voiceChannel) {
            return interaction.editReply({ 
                embeds: [createErrorEmbed('Voice Channel Required', 'Pehle kisi voice channel join karein!')] 
            });
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            return interaction.editReply({ 
                embeds: [createErrorEmbed('Permission Denied', 'Mujhe connect/speak ki permission chahiye!')] 
            });
        }

        try {
            // ✅ Search/Validate URL
            const search = query.startsWith('http') 
                ? await playdl.video_info(query) 
                : await playdl.search(query, { limit: 1 });
            
            const video = query.startsWith('http') ? search : search[0];
            if (!video) throw new Error('No results found');

            // ✅ Stream setup with ffmpeg
            const stream = await playdl.stream(video.url || video, {
                quality: 0, // highest quality
                dl: false,
                ffmpegArgs: ['-b:a', '128k'] // optimize for Discord
            });

            // ✅ Voice connection
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true
            });

            const player = createAudioPlayer();
            
            // ✅ Create resource with ffmpeg path
            const resource = createAudioResource(stream.stream, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true,
                ffmpegPath: ffmpeg
            });

            player.play(resource);
            connection.subscribe(player);

            // ✅ Store for queue system (future)
            if (!interaction.client.music) interaction.client.music = {};
            interaction.client.music[interaction.guild.id] = { player, connection, queue: [] };

            // ✅ Premium Embed Response
            await interaction.editReply({ 
                embeds: [createSuccessEmbed('Now Playing', `🎵 **${video.title || video.video_details?.title}**\n🔗 [Watch](${video.url || video.video_details?.url})`, video.thumbnails?.[0]?.url || video.video_details?.thumbnails?.[0]?.url)] 
            });

            // ✅ Error handling for player
            player.on('error', err => {
                console.error('Player Error:', err);
                interaction.channel.send({ 
                    embeds: [createErrorEmbed('Playback Error', 'Audio play karte waqt error aaya.')] 
                });
            });

        } catch (err) {
            console.error('Play Command Error:', err.message);
            await interaction.editReply({ 
                embeds: [createErrorEmbed('Command Failed', `Error: ${err.message.slice(0, 100)}...`)] 
            });
        }
    }
};

// 🎨 Helper Functions for Premium Embeds
function createSuccessEmbed(title, description, thumbnail) {
    return new EmbedBuilder()
        .setColor(config.premiumColor)
        .setTitle(`${config.emojis.play} ${title}`)
        .setDescription(description)
        .setThumbnail(thumbnail)        .setFooter({ text: config.footer })
        .setTimestamp();
}

function createErrorEmbed(title, description) {
    return new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle(`${config.emojis.error} ${title}`)
        .setDescription(description)
        .setFooter({ text: config.footer })
        .setTimestamp();
}
