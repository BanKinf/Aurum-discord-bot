require('dotenv').config();
require('./database/db.js')();
const { loadEvents } = require("./Handlers/eventHandler");
const {
    Client,
    GatewayIntentBits,
    Partials,
    Collection,
} = require('discord.js');
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember } = Partials;

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages],
    partials: [User, Message, GuildMember, ThreadMember]
})

client.events = new Collection();
client.commands = new Collection();

loadEvents(client);

client.login(process.env.TOKEN)