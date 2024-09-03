const { SlashCommandBuilder } = require("discord.js");
const { createCoordEmbed } = require('../../../Components/Embeds.js');
const { responseButtons } = require('../../../Components/Buttons.js');
const Place = require("../../../models/Place.js");

module.exports = {
    moderation: true,
    data: new SlashCommandBuilder()
        .setName("newcoord")
        .setDescription("Agrega una coordenada nueva al embed.")
        .addStringOption(option => option.setName(`nombre`).setDescription(`nombre para la nueva ubicación`).setRequired(true))
        .addNumberOption(option => option.setName(`x`).setDescription(`Coordenada en X`).setRequired(true))
        .addNumberOption(option => option.setName(`y`).setDescription(`Coordenada en Y`).setRequired(true))
        .addNumberOption(option => option.setName(`z`).setDescription(`Coordenada en Z`).setRequired(true))
        .addStringOption(option => 
            option
                .setName(`dimensión`)
                .setDescription(`dimension donde se encuentra la ubicación`)
                .setChoices({name: "Overworld", value: "overworld"}, {name: "Nether", value: "nether"}, {name: "End", value: "end"})
                .setRequired(true)
        ),
    async execute(interaction, client) {
        const { guild } = interaction;
        const collector = interaction.channel.createMessageComponentCollector();
        const nameOption = interaction.options.getString(`nombre`);
        const coordX = interaction.options.getNumber(`x`);
        const coordY = interaction.options.getNumber(`y`);
        const coordZ = interaction.options.getNumber(`z`);
        const dimensionOption = interaction.options.getString(`dimensión`);
        const { embedVerify, embedYes, embedNo, embedError } = createCoordEmbed(guild, nameOption, coordX, coordY, coordZ, dimensionOption);
    
        await interaction.reply({embeds: [embedVerify], components: [responseButtons()]});

        collector.on('collect', async (i) => {
            if (i.user.id !== interaction.user.id) return i.reply({ content: "Solo la persona que ejecutó el comando puede interactuar con los botones", ephemeral: true });

            const responseEmbed = i.customId === 'YesButton' ? embedYes : embedNo;
            const responseComponents = [];

            try {
                if (i.customId === 'YesButton') {
                    const newPlace = new Place({ name: nameOption, coords: [coordX, coordY, coordZ], dimension: dimensionOption });
                    await newPlace.save();
                    interaction.client.emit('coordupdated', client);
                }
                await i.update({ embeds: [responseEmbed], components: responseComponents });
            } catch (error) {
                console.log(error)
                await i.update({ embeds: [embedError], components: responseComponents });
            } finally {
                setTimeout(async () => {
                    await interaction.deleteReply();
                }, 7000);
            }
            collector.stop();
        });
    }
};