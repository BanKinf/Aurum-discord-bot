const { SlashCommandBuilder, PollLayoutType } = require("discord.js");

module.exports = {
    moderation: true,
    data: new SlashCommandBuilder()
        .setName("votemember")
        .setDescription("Crear la encuesta de votacion de nuevo miembro.")
        .addStringOption(option => 
            option
                .setName(`user`)
                .setDescription(`Nombre del usuario a votar.`)
                .setRequired(true)
        ),

    execute(interaction, client) {
        const user = interaction.options.getString("user");
        const channel = client.channels.cache.get('1280358068760346635');
        channel.send({
            poll: {
                question: { text:`Votación para Miembro: ${user} `},
                answers: [
                    { text: "Si", emoji: "✅" },
                    { text: "No se", emoji: "🤷‍♂️" },
                    { text: "No", emoji: "❌" },
                ],
                allowMultiselect: false,
                duration: 120,
                layoutType: PollLayoutType.Default
            }
        })
    },
};

