const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const Choices = require("../../consts/Choices");
const Bot = require("../../models/Bot");
const formatCoordinates = require("../../Functions/formatCoordinates")
const capitalizeWord = require("../../Functions/capitalizeWord")

function generateDescription(botRes) {
    const locationString = botRes.botNearFarm === false ?
    `${formatCoordinates(botRes.coords)}\nen el **${capitalizeWord(botRes.dimension)}**` :
    `**${botRes.farmName}** (${capitalizeWord(botRes.dimension)})`;
    
    return `El bot ${botRes.name} está en: \n${locationString} \nhace **${elapsedTimeCalculate(botRes.createdAt)}**`;
}

function elapsedTimeCalculate(createdAt) {
    const now = new Date();
    const joinedAt = createdAt;
    const elapsedTime = now - joinedAt;

    const elapsedHours = Math.floor(elapsedTime / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    const elapsedSeconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

    return `${elapsedHours} hrs, ${elapsedMinutes} mins, ${elapsedSeconds} segs`
}

module.exports = {
    data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Saber el estado de un bot")
    .addStringOption((option) => 
        option
            .setName(`bot`)
            .setDescription(`Seleccionar bot`)
            .setChoices(...Choices)
            .setRequired(true)
    ),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { guild } = interaction;
        const botChoice = interaction.options.getString(`bot`);

        try {
            const botRes = await Bot.findOne({ name: botChoice });
            if (botRes) {
                const embed = new EmbedBuilder()
                .setColor(`E4D028`)
                .setTitle(`Status: ${botRes.name}`)
                .setDescription(generateDescription(botRes))
                .addFields({ name: 'Spawneado por:', value: `${botRes.player_executor}`})
                .setThumbnail(`https://nmsr.nickac.dev/face/${botRes.uuid}`)
                .setFooter({
                    text: `${guild.name}`,
                    iconURL: 'https://media.discordapp.net/attachments/1044078726553546852/1237291324634435625/4f4514e835d19dd0338e78d550a1d5f5.jpg?ex=66d8a817&is=66d75697&hm=7db4239cc44e71c96d6bc2c5572bf6d3951ac6aff45e49a87fa43248a642fa00&=&format=webp&width=72&height=72'
                })
                .setTimestamp()
                return interaction.reply({embeds: [embed]});
            } else {
                return interaction.reply({content: "El bot seleccionado no se encuentra conectado.", ephemeral: true})
            }
        } catch (e) {
            console.log('Error al intentar recuperar el estado del bot', e);
        }

    }
}






