module.exports = {
    emojis: {
        play: process.env.EMOJI_PLAY || '🎵',
        pause: process.env.EMOJI_PAUSE || '⏸️',
        skip: process.env.EMOJI_SKIP || '⏭️',
        stop: process.env.EMOJI_STOP || '⏹️',
        queue: process.env.EMOJI_QUEUE || '📋',
        volume: process.env.EMOJI_VOLUME || '🔊',
        error: process.env.EMOJI_ERROR || '⚠️'
    },
    premiumColor: process.env.PREMIUM_COLOR || 0x5865F2,
    footer: process.env.BOT_FOOTER || 'Mozi Music Bot'
};
