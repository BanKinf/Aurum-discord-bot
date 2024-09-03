require('dotenv').config();
const { createServer } = require('net');
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
    EmbedBuilder
} = require('discord.js');
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

// Models
const Bot = require('./models/Bot.js');
const Place = require('./models/Place.js');

// Import Functions
const capitalizeWord = require('./Functions/capitalizeWord.js');
const formatCoordinates = require('./Functions/formatCoordinates.js');
const shortString = require('./Functions/shortString.js');

// Import Files
const { loadEvents } = require("./Handlers/eventHandler.js");
require('./db.js')();

// Const
const channelId = process.env.BOT_CHANNEL;
const port = process.env.PORT || 30004;

// Create Discord Client
const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages],
    partials: [User, Message, GuildMember, ThreadMember]
});

// Load Discord Events && Commands
client.events = new Collection();
client.commands = new Collection();
loadEvents(client);

// Connect Discord Server
client.login(process.env.TOKEN);

// Ensure the client is ready before starting the TCP server
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    // Create TCP Server
    const server = createServer((socket) => {
        console.log('Cliente conectado.');
        socket.on('data', async (data) => {
            try {
                const playerInfo = JSON.parse(data.toString());
                console.log('Datos recibidos del mod de Minecraft:', playerInfo);
                await handlePlayerData(playerInfo);
            } catch (e) {
                console.log("No fue posible recuperar el JSON data", e);
            }
        });

        // Socket Off
        socket.on('end', () => console.log('Cliente desconectado.'));

        // Socket Error
        socket.on('error', (err) => console.error('Error de conexión:', err.message));
    });

    // Listen Port
    server.listen(port, '0.0.0.0', () => {
        console.log(`Servidor escuchando en pvs.cranky.do:${port}`);
    });
});

// Manage Bot Data Function
async function handlePlayerData(playerInfo) {
    const { action, name, dimension, coords, uuid, name_player_executor } = playerInfo;

    try {
        if (action === "joined") {
            // Verifica si el bot ya está en la base de datos
            const existingBot = await Bot.findOne({ uuid: uuid });
            if (existingBot) {
                console.log(`El bot ${name} ya está en la base de datos.`);
                return; // Si ya está, no hacer nada
            }

            const botDimension = shortString(dimension);
            const coordinates = coords.map(valor => Math.floor(valor));
            const { botNearFarm, farmName } = await findFarmProximity(botDimension, coordinates);
            console.log(botNearFarm)
            console.log(farmName)

            const newBot = new Bot({
                name: name,
                uuid: uuid,
                action: action,
                dimension: botDimension,
                player_executor: name_player_executor,
                coords: coordinates,
                botNearFarm: botNearFarm,
                farmName: botNearFarm ? farmName : null
            });

            await newBot.save();

            await sendDiscordMessage(`Se ha conectado el bot ${name}`, botNearFarm ?
                `El bot ${name} está en: **${farmName}** (${capitalizeWord(botDimension)})` :
                `El bot ${name} está en: \n${formatCoordinates(coordinates)}\nen el **${capitalizeWord(botDimension)}**`, true);
        } else {
            const deletedBot = await Bot.findOneAndDelete({ uuid: uuid });
            if (deletedBot) {
                const { name, dimension, coords, botNearFarm, farmName } = deletedBot;
                await sendDiscordMessage(`Se ha desconectado el bot ${name}`, botNearFarm ?
                    `El bot ${name} estaba en: **${farmName}** (${capitalizeWord(dimension)})` :
                    `El bot ${name} estaba en: \n${formatCoordinates(coords)}\nen el **${capitalizeWord(dimension)}**`, false);
            }
        }
    } catch (e) {
        console.log("No se pudo enviar el bot a la base de datos", e);
    }
}

// Calculate Distance Function
function calculateDistance(coordFarm, coordBot) {
    const dx = coordFarm[0] - coordBot[0];
    const dy = coordFarm[1] - coordBot[1];
    const dz = coordFarm[2] - coordBot[2];

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Verify Block Distance Function
function verifyBlockDistance(coordFarm, coordBot, blockDistance = 100) {
    const distance = calculateDistance(coordFarm, coordBot);
    return distance <= blockDistance;
}

// Find Farm Proximity Function
async function findFarmProximity(botCoord, coordinates) {
    try {
        const placesList = await Place.find({});
        let closestFarm = null;
        let minDistance = Infinity;

        for (const farm of placesList) {
            if (farm.dimension === botCoord && verifyBlockDistance(farm.coords, coordinates)) {
                const distance = calculateDistance(farm.coords, coordinates);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestFarm = farm;
                }
            }
        }

        if (closestFarm) {
            return { botNearFarm: true, farmName: closestFarm.name };
        } else {
            return { botNearFarm: false, farmName: "" };
        }
    } catch (error) {
        console.error("Error al recuperar las places:", error);
        return { botNearFarm: false, farmName: "" };
    }
}

// Create Embed Function
async function sendDiscordMessage(title, description, success) {
    try {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(success ? '21CA19' : 'EE192D');
        const channel = client.channels.cache.get(channelId);
        if (channel) {
            await channel.send({ embeds: [embed] });
        } else {
            console.error('El canal no se encontró en el caché del cliente.');
        }
    } catch (err) {
        console.error('Error al enviar el embed a Discord:', err);
    }
}