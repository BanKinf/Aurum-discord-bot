const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    moderation: true,
    data: new SlashCommandBuilder()
        .setName("createcoords")
        .setDescription("Crear el embed de coordenadas."),

    execute(interaction, client) {
        interaction.reply({ content: "Creando el embed de places...", ephemeral: true });
        interaction.client.emit('coordupdated', client);
    },
};

