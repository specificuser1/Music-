require('dotenv').config();

module.exports = {
    // 🎯 Prefix System (Multiple prefixes support)
    prefix: process.env.PREFIX?.split(',') || ['!', '?', '.'],
    
    // 🎨 Premium Embed Settings
    premiumColor: process.env.PREMIUM_COLOR || 0x5865F2,
    errorColor: 0xff0000,
    footer: process.env.BOT_FOOTER || '⚡ Powered by Mozi',
    
    // 😊 Custom Emojis
    emojis: {
        play: process.env.EMOJI_PLAY || '🎵',
        pause: process.env.EMOJI_PAUSE || '⏸️',
        skip: process.env.EMOJI_SKIP || '⏭️',
        stop: process.env.EMOJI_STOP || '⏹️',
        queue: process.env.EMOJI_QUEUE || '📋',
        volume: process.env.EMOJI_VOLUME || '🔊',
        error: process.env.EMOJI_ERROR || '⚠️',
        success: process.env.EMOJI_SUCCESS || '✅'
    },
    
    // 🎧 Music Settings
    maxQueueSize: 100,
    defaultVolume: 50
};
