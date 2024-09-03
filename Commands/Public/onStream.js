const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");
require('dotenv').config();

module.exports = {
    streamer: true,
    data: new SlashCommandBuilder()
        .setName("onstream")
        .setDescription("Puedes crear un anuncio cuando estés en stream.")
        .addStringOption(option => option.setName(`user`).setDescription(`Tu usuario de la plataforma donde hagas streams.`).setRequired(true))
        .addStringOption(option => option.setName(`link`).setDescription(`El link de tu stream.`).setRequired(true))
        .addStringOption(option => 
            option
                .setName(`plataforma`)
                .setDescription(`Selecciona la plataforma donde haces stream.`)
                .setChoices(
                    { name: "Twitch", value: "twitch" },
                    { name: "Kick", value: "kick" },
                    { name: "YouTube", value: "youtube" },
                    { name: "Facebook", value: "facebook" }
                )
                .setRequired(false)
        )
        .addAttachmentOption(option => option.setName(`file`).setDescription(`Colocar una imagen.`)),
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const userOption = interaction.options.getString(`user`);
        const linkOption = interaction.options.getString(`link`);
        const plataformOption = interaction.options.getString(`plataforma`);
        const attachment = interaction.options.getAttachment(`file`);

        const channelID = process.env.STREAMING_CHANNEL;
        const { guild } = interaction;
        const channel = guild.channels.cache.get(channelID);

        let url;
        try {
            url = new URL(linkOption);
        } catch (e) {
            return interaction.reply({ content: 'El link proporcionado no es válido. Por favor, proporciona un enlace válido.', ephemeral: true });
        }

        if (interaction.channel.id !== channelID) {
            return interaction.reply({ content: `Este comando solo puede ser usado en el canal <#${channelID}>.`, ephemeral: true });
        }

        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (attachment && !validImageTypes.includes(attachment.contentType)) {
            return interaction.reply({ content: 'El archivo adjunto debe ser una imagen (JPEG, PNG, GIF).', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor(`E4D028`)
            .setTitle(`¡${userOption} está en directo ahora${plataformOption ? ` en ${plataformOption}` : ' mismo'}!`)
            .setDescription(`[¡Únete al stream aquí!](${linkOption})`)
            .setFooter({
                text: `${guild.name}`,
                iconURL: 'https://cdn.discordapp.com/attachments/1044078726553546852/1237291324634435625/4f4514e835d19dd0338e78d550a1d5f5.jpg?ex=66b90417&is=66b7b297&hm=3d9838cc954c1f44032dae8ccb475827b59bfe1cb39580688173830fa8b0e714&'
            })
            .setTimestamp();

        if (attachment) {
            embed.setImage(attachment.url);
        }

        await channel.send({ content: '@everyone', embeds: [embed] });

        return interaction.reply({ content: 'Tu anuncio ha sido publicado con éxito.', ephemeral: true });
    }
};
