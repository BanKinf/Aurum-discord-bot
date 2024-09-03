const { createCoordEmbed } = require("../../Functions/createCoordEmbed.js");

module.exports = {
    name: "coordupdated",
    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    execute(client) {
        createCoordEmbed(client)
    }
}