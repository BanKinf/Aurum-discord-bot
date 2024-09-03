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
    `${formatCoordinates(botRes.coords)}\nen el ${capitalizeWord(botRes.dimension)}` :
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
                .setTitle(`Status del bot ${botRes.name}`)
                .setDescription(generateDescription(botRes))
                .setImage(`https://nmsr.nickac.dev/fullbody/${botRes.uuid}`)
                .setFooter({
                    text: `${guild.name}`,
                    iconURL: 'https://goo.su/Hxmn'
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






