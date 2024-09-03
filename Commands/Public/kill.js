const {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} = require("discord.js");
const { exec } = require('child_process');
const Choices = require("../../consts/Choices");
const rconPath = 'C:/Users/prote/Documents/Proyectos/bot_aurum/assets/mcrcon.exe';

module.exports = {
    data: new SlashCommandBuilder()
    .setName("kill")
    .setDescription("Desconectar a el bot que eligas")
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

    execute(interaction) {
        const Bot = interaction.options.getString(`bot`);
        const rconPassword = process.env.RCON_PASSWORD

        const params = `-p ${rconPassword} -w 5 "player ${Bot} kill"`
        exec(`${rconPath} ${params}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error al ejecutar el archivo: ${error}`);
                return interaction.reply({ content: "Se produjo un error al intentar desconectar al bot.", ephemeral: true });
            }
            if (stdout.length == 38) {
                interaction.reply({content: "El bot que intentas desconectar no esta en el servidor.", ephemeral: true})
            } 
            if (stdout.length == 0) {
                interaction.reply({content: `El bot ${Bot} ha sido desconectado correctamente!`, ephemeral: true})
            }
        })
    }
}