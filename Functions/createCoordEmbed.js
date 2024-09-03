require('dotenv').config();
const { EmbedBuilder } = require("discord.js");
const formatCoordinates = require("./formatCoordinates.js");
const capitalizeWord = require("./capitalizeWord.js");
const Place = require("../models/Place.js");
const { createCoordButtons } = require('../Components/Buttons.js');

/**
 * 
 * @param {import("discord.js").Client} client 
 */
const createCoordEmbed = async (client) => {
    const channel = client.channels.cache.get(process.env.COORD_CHANNEL);

    if (!channel) {
        console.error("No se encontró el canal con el ID proporcionado.");
        return;
    }

    const updateMessage = async () => {
        let Places = await Place.find({}).sort({ dimension: 1 });

        const overworldPlaces = Places.filter(place => place.dimension === 'overworld');
        const netherPlaces = Places.filter(place => place.dimension === 'nether');
        const endPlaces = Places.filter(place => place.dimension === 'end');

        Places = overworldPlaces.concat(netherPlaces, endPlaces);

        let embeds = [];
        let currentPage = 0;
        const pageSize = 6;

        for (let i = 0; i < Places.length; i += pageSize) {
            const currentPlaces = Places.slice(i, i + pageSize);
            const embed = new EmbedBuilder()
                .setColor('E4D028')
                .setTitle(`Aurum Places - Página ${Math.floor(i / pageSize) + 1}`)
                .setFooter({
                    text: `${channel.guild.name}`,
                    iconURL: 'https://goo.su/Hxmn'
                });

            currentPlaces.forEach((place, index) => {
                const globalIndex = i + index + 1;
                embed.addFields({
                    name: `${globalIndex}. ${place.name} (${capitalizeWord(place.dimension)})`,
                    value: `${formatCoordinates(place.coords)}`
                });
            });

            embeds.push(embed);
        }

        const helpEmbed = new EmbedBuilder()
            .setColor('E4D028')
            .setTitle("¿Como se utilizan los comandos?")
            .setDescription("Para agregar una nueva ubicación utiliza este comando:\n`/newCoord {nombre} {x} {y} {z} {dimension}`\n\nPara editar una ubicación utiliza este comando:\n`/editCoord {id} {field} {value}`\n\nPara eliminar una ubicación utiliza este comando:\n`/delCoord {id}`")
            .setFooter({
                text: `${channel.guild.name}`,
                iconURL: 'https://goo.su/Hxmn'
            });

        const existingMessages = await channel.messages.fetch();
        const existingMessage = existingMessages.first();

        if (existingMessage) {
            await existingMessage.delete();
        }

        const message = await channel.send({ embeds: [embeds[0]], components: [createCoordButtons()] });

        const collector = channel.createMessageComponentCollector({ message, time: 3600000 }); // 1 hour

        collector.on('collect', async (interaction) => {
            try {
                if (!interaction.isButton()) return;

                if (interaction.customId === 'HelpButton') {
                    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
                    return;
                }

                if (interaction.customId === 'AtrasButton') {
                    currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                } else if (interaction.customId === 'AdelanteButton') {
                    currentPage = (currentPage + 1) % embeds.length;
                }

                await interaction.update({ embeds: [embeds[currentPage]], components: [createCoordButtons()] });
            } catch (error) {
                console.error('Ocurrió un error al procesar la interacción:', error);
                await interaction.reply({ content: 'Ocurrió un error al procesar la interacción.', ephemeral: true });
            }
        });

        collector.on('end', async () => {
            try {
                if (message.deletable) {
                    await message.delete();
                }
            } catch (deleteError) {
                console.error('Error al eliminar el mensaje:', deleteError);
            }
        });
        
    };

    try {
        await updateMessage();
    } catch (e) {
        console.log('Error al devolver la lista de places:', e);
        await channel.send({ content: 'Ocurrió un error al obtener la lista de places.' });
    }
}

module.exports = { createCoordEmbed };
