require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
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
    console.error('💥 Uncaught Exception:', err.message);
    // Bot ko crash hone se bachane ke liye destroy nahi karenge
});

// 📂 Load Commands (Fixed: Flat Folder Structure Support)
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const folderPath = path.join('./commands', folder);
    if (fs.statSync(folderPath).isDirectory()) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            try {
                const command = require(path.join(folderPath, file));
                if (command.name && command.execute) {
                    client.commands.set(command.name, command);
                    if (Array.isArray(command.aliases)) {
                        command.aliases.forEach(alias => client.aliases.set(alias, command.name));
                    }
                    console.log(`✅ Loaded: ${folder}/${file}`);
                }
            } catch (err) {
                console.error(`❌ Failed to load ${folder}/${file}:`, err.message);
            }
        }
    }
}

// 📂 Load Events
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    // v14 Deprecation Fix: 'ready' → 'clientReady'
    const eventName = event.name === 'ready' ? 'clientReady' : event.name;
    
    if (event.once) {
        client.once(eventName, (...args) => event.execute(...args, client));
    } else {
        client.on(eventName, (...args) => event.execute(...args, client));
    }
}

// 🔑 Login
client.login(process.env.TOKEN).catch(err => {
    console.error('❌ Login Failed:', err.message);
    process.exit(1);
});
