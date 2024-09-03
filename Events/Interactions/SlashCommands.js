const { ChatInputCommandInteraction } = require("discord.js");
require('dotenv').config();

module.exports = {
    name: "interactionCreate",
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {Discord.Client} client 
     */
    execute(interaction, client) {
        if (!interaction.isCommand()) return;

        const roles = interaction.member.roles.cache.map(role => role.id);
        const moderatorRoles = [process.env.MODERATOR_ID, process.env.ADMINISTRATOR_ID];
        const streamerRole = process.env.STREAMER_ID;

        const command = client.commands.get(interaction.commandName);

        if (!command)
            return interaction.reply({
                content: "Este comando está desactualizado.",
                ephemeral: true,
            });

        //Si Developer:true y User -> id = [banking id]
        if (command.developer && interaction.user.id !== '497155556889591819'){
            return interaction.reply({
                content: "Este comando solo puede ser usado por el desarrollador.",
                ephemeral: true,
            });
        }
            
        //Si Moderator:true y User -> role moderator || administrador
        if (command.moderation && !roles.some(role => moderatorRoles.includes(role))){
            return interaction.reply({
                content: "Este comando solo puede ser usado por el staff del servidor.",
                ephemeral: true,
            });
        }

        //Si Streamer:true y User -> role streamer
        if (command.streamer && !roles.includes(streamerRole)){
            return interaction.reply({
                content: "Este comando solo puede ser usado por los que tengan el rol de streamer.",
                ephemeral: true,
            });
        }

        command.execute(interaction, client);
    }
}
