const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
const Bot = require("../../models/Bot");
const capitalizeWord = require("../../Functions/capitalizeWord")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("botlist")
    .setDescription("Devuelve una lista con todos los bots online!"),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { guild } = interaction;
        try {
            const botList = await Bot.find({});
            const botsCounter = botList.length;
            
            const embed = new EmbedBuilder()
                .setColor(`E4D028`)
                .setTitle(`Bots Online (${botsCounter}):`)
                .setFooter({
                    text: `${guild.name}`,
                    iconURL: 'https://goo.su/Hxmn' 
                })
                .setTimestamp()

            if (botsCounter === 0) {
                return interaction.reply({ content: 'No hay ningun bot en linea en este momento.', ephemeral: true });
            }
            botList.forEach(bot => {
                const coordinates = bot.coords.map((coord, index) => {
                    const coordinateString = coord.toFixed(2); 
                    return `${String.fromCharCode(88 + index)}: ${parseFloat(coordinateString).toString()}`
                }).join(', ');
                embed.addFields({
                    name: bot.name,
                    value: bot.botNearFarm === false ?
                        `${coordinates} (${capitalizeWord(bot.dimension)})` :
                        `${bot.farmName} (${capitalizeWord(bot.dimension)})`
                });
            })
            return interaction.reply({embeds: [embed]});
        } catch (e) {
            console.log('Error al devolver la lista de bots:', e)
            return interaction.reply({ content: 'Ocurrió un error al obtener la lista de bots.', ephemeral: true });
        }
    }
}
