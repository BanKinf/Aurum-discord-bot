const { loadCommands } = require("../../Handlers/commandHandler");
const ActivityType = require('discord.js')

module.exports = {
    name: "ready",
    once: true,
    execute(client) {
        console.log("El cliente se ha iniciado");
        client.user.setActivity({
            name: "By BanKing",
            type: ActivityType.Playing
        })
        
        loadCommands(client);
    },
};