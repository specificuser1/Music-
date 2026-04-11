module.exports = {
    name: 'clientReady', // ✅ Changed from 'ready' to 'clientReady'
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} is online & ready! 🎧`);
        client.user.setActivity('!play | Mozi Music', { type: 2 });
    }
};
