```
music-bot/
├── index.js              # Main bot + event/command loader
├── deploy-commands.js    # Slash commands register karne ke liye
├── config.js             # Emojis, colors, settings
├── .env                  # Tokens & sensitive data
├── utils/
│   └── embeds.js         # Premium embed builder
├── events/
│   ├── ready.js
│   └── interactionCreate.js
├── commands/
│   ├── music/
│   │   ├── play.js
│   │   ├── queue.js
│   │   ├── skip.js
│   │   ├── stop.js
│   │   └── volume.js
│   └── system/
│       └── emojis.js
├── package.json
└── railway.toml          # Railway config
```
