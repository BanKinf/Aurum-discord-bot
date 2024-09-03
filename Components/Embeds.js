const {EmbedBuilder} = require("discord.js");
const capitalizeWord = require("../Functions/capitalizeWord");

const embedColor = {
    Aurum: "E4D028",
    Error: "EE192D",
    Successful: "21CA19"
};

const timestamp = new Date();
const baseEmbed = (color, title, description, guild) => {
    return new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .setFooter({ text: guild.name })
        .setTimestamp(timestamp);
};

const createCoordEmbed = (guild, nameOption, coordX, coordY, coordZ, dimensionOption) => {
    const embedVerify = baseEmbed(
        embedColor.Aurum, 
        `Verificación`,
        `¿Seguro que quieres añadir **${nameOption}** a la base de datos?\n**X:** ${coordX}\n**Y:** ${coordY}\n**Z:** ${coordZ}\nDimensión: **${capitalizeWord(dimensionOption)}**`,
        guild
    );

    const embedYes = baseEmbed(
        embedColor.Successful,
        `¡Éxito!`,
        `Se agregó **${nameOption}** a la base de datos!`,
        guild
    );

    const embedNo = baseEmbed(
        embedColor.Error,
        `¡No se agregó!`,
        `**${nameOption}** no se agregará a la base de datos!`,
        guild
    );

    const embedError = baseEmbed(
        embedColor.Error,
        `¡Ocurrió un Error!`,
        `No se pudo agregar **${nameOption}** a la base de datos!`,
        guild
    );

    return { embedVerify, embedYes, embedNo, embedError };
};

const deleteCoordEmbed = (guild, nameOption) => {
    const embedVerify = baseEmbed(
        embedColor.Aurum, 
        `Verificación`,
        `¿Seguro que quieres eliminar **${nameOption}** de la base de datos?`,
        guild
    );

    const embedYes = baseEmbed(
        embedColor.Successful,
        `¡Éxito!`,
        `Se elimino **${nameOption}** de la base de datos!`,
        guild
    );

    const embedNo = baseEmbed(
        embedColor.Error,
        `¡No se elimino!`,
        `**${nameOption}** no se eliminará de la base de datos!`,
        guild
    );

    const embedError = baseEmbed(
        embedColor.Error,
        `¡Ocurrió un Error!`,
        `No se pudo eliminar **${nameOption}** de la base de datos!`,
        guild
    );

    return { embedVerify, embedYes, embedNo, embedError };
};

module.exports = { 
    createCoordEmbed,
    deleteCoordEmbed,
    embedColor,
    baseEmbed
};
