const { ButtonStyle, ButtonBuilder, ActionRowBuilder } = require("discord.js");

const createCoordButtons = () => {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('AtrasButton')
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('AdelanteButton')
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId('HelpButton')
            .setEmoji('❓')
            .setStyle(ButtonStyle.Secondary)
    );
};

const responseButtons = () => {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('NoButton')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId('YesButton')
            .setLabel('Yes')
            .setStyle(ButtonStyle.Success)
    );
};

module.exports = {
    createCoordButtons,
    responseButtons
};
