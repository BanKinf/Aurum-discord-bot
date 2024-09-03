const {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} = require("discord.js");
const Place = require("../../../models/Place.js");
const { responseButtons } = require('../../../Components/Buttons.js');
const { deleteCoordEmbed } = require('../../../Components/Embeds.js');

module.exports = {
    moderation: true,
    data: new SlashCommandBuilder()
        .setName("delcoord")
        .setDescription("Eliminar una coordenada del embed.")
        .addNumberOption(option => option.setName(`id`).setDescription(`Número de la lista de places.`).setRequired(true)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { guild } = interaction;
        const collector = interaction.channel.createMessageComponentCollector();
        try {
            const index = interaction.options.getNumber("id") - 1;

            let Places = await Place.find({}).sort({ dimension: 1 });
            
            const overworldPlaces = Places.filter(place => place.dimension === 'overworld');
            const netherPlaces = Places.filter(place => place.dimension === 'nether');
            const endPlaces = Places.filter(place => place.dimension === 'end');

            Places = overworldPlaces.concat(netherPlaces, endPlaces);

            const placeToDelete = Places[index];
            
            if (!placeToDelete) {
                return interaction.reply({ content: "No se encontró ningún lugar con el índice proporcionado.", ephemeral: true });
            }

            const { embedVerify, embedYes, embedNo, embedError } = deleteCoordEmbed(guild, placeToDelete.name);
            await interaction.reply({embeds: [embedVerify], components: [responseButtons()]});

            collector.on('collect', async (i) => {
                try {
                    if (i.user.id !== interaction.user.id) {
                        return i.reply({ content: "Solo la persona que ejecutó el comando puede interactuar con los botones", ephemeral: true });
                    }
            
                    const responseEmbed = i.customId === 'YesButton' ? embedYes : embedNo;
                    const responseComponents = [];
            
                    if (i.customId === 'YesButton') {
                        await Place.deleteOne({ _id: placeToDelete._id });
                        interaction.client.emit('coordupdated', client);
                    }

                    await i.update({ embeds: [responseEmbed], components: responseComponents });
            
                } catch (error) {
                    console.error(error);
                    await i.reply({ content: "Ocurrió un error al procesar la interacción.", ephemeral: true });
                } finally {
                    collector.stop();
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 7000);
                }
            });            
        } catch (error) {
            console.error("Error al eliminar el lugar:", error);
            return interaction.reply({ content: "Ocurrió un error al eliminar el lugar.", ephemeral: true });
        }
    }
}