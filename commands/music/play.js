const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const playdl = require('play-dl');
const config = require('../../config');
const ffmpeg = require('ffmpeg-static');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎵 Play a song from YouTube or URL')
        .addStringOption(opt => 
            opt.setName('query')
               .setDescription('Song name or YouTube URL')
               .setRequired(true)),
    
    async execute(interaction) {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const voiceChannel = interaction.member.voice.channel;

        // ❌ Voice Channel Check
        if (!voiceChannel) {
            return interaction.editReply({ 
                embeds: [createEmbed('❌ Voice Channel Required', 'Pehle kisi voice channel join karein!', 0xff0000)] 
            });
        }

        // ❌ Permission Check
        const perms = voiceChannel.permissionsFor(interaction.client.user);
        if (!perms.has('Connect') || !perms.has('Speak')) {
            return interaction.editReply({ 
                embeds: [createEmbed('❌ Permission Denied', 'Mujhe connect/speak ki permission chahiye!', 0xff0000)] 
            });
        }

        try {
            // 🔍 Search or Validate URL
            const video = query.startsWith('http') 
                ? (await playdl.video_info(query)).video_details 
                : (await playdl.search(query, { limit: 1 }))[0];
            
            if (!video) throw new Error('No results found ❌');

            // 🎧 Stream Setup
            const stream = await playdl.stream(video.url, {
                quality: 0,
                ffmpegArgs: ['-b:a', '128k']
            });

            // 🔊 Voice Connection
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(stream.stream, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true,
                ffmpegPath: ffmpeg
            });

            player.play(resource);
            connection.subscribe(player);

            // 💾 Queue System (Future Extension)
            if (!interaction.client.music) interaction.client.music = {};
            interaction.client.music[interaction.guild.id] = { player, connection, queue: [] };

            // ✅ Success Embed
            await interaction.editReply({ 
                embeds: [createEmbed(
                    `${config.emojis.play} Now Playing`, 
                    `**${video.title}**\n🔗 [Watch](${video.url})\n👤 ${video.author?.name || 'Unknown'}`, 
                    0x5865F2,
                    video.thumbnails?.[0]?.url
                )] 
            });

        } catch (err) {
            console.error('Play Error:', err);
            await interaction.editReply({ 
                embeds: [createEmbed(`${config.emojis.error} Playback Failed`, `Error: ${err.message.slice(0, 150)}`, 0xff0000)] 
            });
        }
    }
};

// 🎨 Premium Embed Helper
function createEmbed(title, description, color, thumbnail) {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setThumbnail(thumbnail)
        .setFooter({ text: config.footer })
        .setTimestamp();
}
