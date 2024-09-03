const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BotSchema = new Schema({
    name: { type:String, require:true },
    uuid: { type:String, require:true },
    coords:{ type:Array, require:true },
    action: {type:String, require:true},
    player_executor: {type:String, require:true},
    dimension: {type:String, require:true},
    botNearFarm: {type:Boolean, require:true},
    farmName: {type:String},
}, {
    timestamps: true
});

module.exports = Bot = mongoose.model('Bot', BotSchema);