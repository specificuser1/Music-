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
process.on('uncaughtException', (err) => console.error('💥 Uncaught Exception:', err.message));

// 📂 Load Commands (Fixed: __dirname + Absolute Paths)
const commandsDir = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsDir);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsDir, folder);
    if (fs.statSync(folderPath).isDirectory()) {
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            try {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);
                
                if (command.name && typeof command.execute === 'function') {
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
const eventsDir = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(path.join(eventsDir, file));
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
