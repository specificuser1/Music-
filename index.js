require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

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
client.aliases = new Collection();
client.config = config;

// 🛡️ Global Error Handling
process.on('unhandledRejection', (err) => console.error('🔻 Unhandled Promise:', err));
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    client.destroy();
});

// 📂 Load Commands (Prefix Style)
const loadCommands = (dir) => {
    const categories = fs.readdirSync(`./commands/${dir}`);
    for (const category of categories) {
        const cmdFiles = fs.readdirSync(`./commands/${dir}/${category}`)
            .filter(f => f.endsWith('.js'));
        
        for (const file of cmdFiles) {
            const cmd = require(`../commands/${dir}/${category}/${file}`);
            if (cmd.name && cmd.execute) {
                client.commands.set(cmd.name, cmd);
                if (cmd.aliases?.length) {
                    cmd.aliases.forEach(alias => client.aliases.set(alias, cmd.name));
                }
                console.log(`✅ Loaded: ${dir}/${category}/${file}`);
            }
        }
    }
};

loadCommands('music');
loadCommands('system');

// 📂 Load Events
const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

client.login(process.env.TOKEN);
