const { SlashCommandBuilder } = require("discord.js");
const Place = require("../../../models/Place.js");
const { createCoordEmbed, baseEmbed, embedColor } = require('../../../Components/Embeds.js');
const { responseButtons } = require('../../../Components/Buttons.js');

module.exports = {
    moderation: true,
    data: new SlashCommandBuilder()
        .setName("editcoord")
        .setDescription("Editar una coordenada del embed.")
        .addNumberOption(option => option.setName("id").setDescription("Número de la lista de places.").setRequired(true))
        .addStringOption(option => 
            option
                .setName(`field`)
                .setDescription(`Opción a editar.`)
                .setChoices({name: "Name", value: "name"}, {name: "Coords", value: "coords"}, {name: "Dimension", value: "dimension"})
                .setRequired(true)
        )
        .addStringOption(option => option.setName("value").setDescription("Nuevo valor para el campo especificado").setRequired(true)),

    async execute(interaction, client) {
        try {
            const index = interaction.options.getNumber("id") - 1;
            const field = interaction.options.getString("field");
            const value = interaction.options.getString("value");

            let Places = await Place.find({}).sort({ dimension: 1 });
            
            const overworldPlaces = Places.filter(place => place.dimension === 'overworld');
            const netherPlaces = Places.filter(place => place.dimension === 'nether');
            const endPlaces = Places.filter(place => place.dimension === 'end');

            Places = overworldPlaces.concat(netherPlaces, endPlaces);

            const placeToEdit = Places[index];

            if (!placeToEdit) {
                return interaction.reply({ content: "No se encontró ningún lugar con el índice proporcionado.", ephemeral: true });
            }

            const oldValue = JSON.parse(JSON.stringify(placeToEdit));
            let newValue = { ...oldValue };

            switch (field) {
                case "name":
                    newValue.name = value;
                    break;
                case "coords":
                    const newCoords = value.split(" ").map(coord => parseFloat(coord));
                    if (newCoords.length !== 3 || newCoords.some(isNaN)) {
                        return interaction.reply({ content: "Debes ingresar tres valores numéricos para las coordenadas (x, y, z) separados por espacios.", ephemeral: true });
                    }
                    newValue.coords = newCoords;
                    break;
                case "dimension":
                    const lowercaseValue = value.toLowerCase();
                    if (!["overworld", "nether", "end"].includes(lowercaseValue)) {
                        return interaction.reply({ content: "La dimensión proporcionada debe ser 'overworld', 'nether' o 'end'.", ephemeral: true });
                    }
                    newValue.dimension = lowercaseValue;
                    break;
                default:
                    return interaction.reply({ content: "Campo de edición no válido. Use 'name', 'coords' o 'dimension'.", ephemeral: true });
            }

            const embedVerify = baseEmbed(
                embedColor.Aurum,
                `Verificación`,
                `**Antes de la edición**:\nNombre: ${oldValue.name}\nCoordenadas: **X**: ${oldValue.coords[0]}, **Y**: ${oldValue.coords[1]}, **Z**: ${oldValue.coords[2]}\nDimensión: ${oldValue.dimension}\n\n**Ahora**:\nNombre: ${newValue.name}\nCoordenadas: **X**: ${newValue.coords[0]}, **Y**: ${newValue.coords[1]}, **Z**: ${newValue.coords[2]}\nDimensión: ${newValue.dimension}`,
                interaction.guild
            );

            await interaction.reply({embeds: [embedVerify], components: [responseButtons()]});

            const collector = interaction.channel.createMessageComponentCollector();

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: "Solo la persona que ejecutó el comando puede interactuar con los botones", ephemeral: true });

                let embedResponse;

                if (i.customId === 'YesButton') {
                    Object.assign(placeToEdit, newValue);
                    await placeToEdit.save();
                    interaction.client.emit('coordupdated', client);

                    embedResponse = baseEmbed(
                        embedColor.Successful,
                        `¡Éxito!`,
                        `El lugar "${placeToEdit.name}" se ha editado correctamente.`,
                        interaction.guild
                    );
                } else {
                    embedResponse = baseEmbed(
                        embedColor.Error,
                        `¡Cancelado!`,
                        `La edición del lugar "${oldValue.name}" ha sido cancelada.`,
                        interaction.guild
                    );
                }

                await i.update({ embeds: [embedResponse], components: [] });

                setTimeout(() => {
                    i.deleteReply().catch(console.error);
                }, 7000);

                collector.stop();
            });

        } catch (error) {
            console.error("Error al editar el lugar:", error);
            return interaction.reply({ content: "Ocurrió un error al editar el lugar.", ephemeral: true });
        }
    }
};
