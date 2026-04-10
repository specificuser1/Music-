require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

client.commands = new Collection();

// 🛡️ Global Error Handling
process.on('unhandledRejection', (err) => console.error('🔻 Unhandled Promise:', err));
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    client.destroy();
});

// 📂 Load Commands
const cmdFolders = fs.readdirSync('./commands');
for (const folder of cmdFolders) {
    const cmdFiles = fs.readdirSync(`./commands/${folder}`).filter(f => f.endsWith('.js'));
    for (const file of cmdFiles) {
        const cmd = require(`./commands/${folder}/${file}`);
        if (cmd.data?.name && cmd.execute) client.commands.set(cmd.data.name, cmd);
    }
}

// 📂 Load Events
const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
}

client.login(process.env.TOKEN);
