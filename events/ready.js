module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`💡🤖 ${client.user.tag} online! - Programmed by WarriorTeam`);
        client.user.setActivity('/play | Mia Music', { type: 2 });
    }
};
