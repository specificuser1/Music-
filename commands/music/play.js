const { EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const playdl = require('play-dl');
const config = require('../../config');
const ffmpeg = require('ffmpeg-static');

module.exports = {
    name: 'play',
    aliases: ['p', 'playyt'],
    description: '🎵 Play a song from YouTube or URL',
    usage: '<song_name_or_URL>',
    voiceChannel: true,
    
    async execute(message, args, client) {
        const query = args.join(' ');
        if (!query) {
            return message.reply({ 
                embeds: [createEmbed(`${config.emojis.error} Missing Query`, 'Usage: `!play <song name or URL>`', config.errorColor)] 
            });
        }

        try {
            // 🔍 Search or Validate URL
            const video = query.startsWith('http') 
                ? (await playdl.video_info(query)).video_details 
                : (await playdl.search(query, { limit: 1 }))[0];
            
            if (!video) {
                return message.reply({ 
                    embeds: [createEmbed(`${config.emojis.error} No Results`, 'Koi song nahi mila. Query check karein.', config.errorColor)] 
                });
            }

            // 🎧 Stream Setup
            const stream = await playdl.stream(video.url, {
                quality: 0,
                ffmpegArgs: ['-b:a', '128k']
            });

            // 🔊 Voice Connection
            const connection = joinVoiceChannel({
                channelId: message.member.voice.channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
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

            // 💾 Queue System (Future)
            if (!client.music) client.music = {};
            client.music[message.guild.id] = { player, connection, queue: [] };

            // ✅ Success Embed
            await message.reply({ 
                embeds: [createEmbed(
                    `${config.emojis.play} Now Playing`, 
                    `**${video.title}**\n🔗 [Watch](${video.url})\n👤 ${video.author?.name || 'Unknown'}`, 
                    config.premiumColor,
                    video.thumbnails?.[0]?.url
                )] 
            });

            // 🎧 Player Error Handler
            player.on('error', err => {
                console.error('Player Error:', err);
                message.channel.send({ 
                    embeds: [createEmbed(`${config.emojis.error} Playback Error`, 'Audio play karte waqt error aaya.', config.errorColor)] 
                });
            });

        } catch (err) {
            console.error('Play Error:', err);
            message.reply({ 
                embeds: [createEmbed(`${config.emojis.error} Command Failed`, `Error: ${err.message.slice(0, 150)}`, config.errorColor)] 
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
