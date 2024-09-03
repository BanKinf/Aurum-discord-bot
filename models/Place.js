const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaceSchema = new Schema({
    name: { type:String, require:true },
    coords:{ type:Array, require:true },
    dimension: { type:String, require:true }
}, {
    timestamps: true
});

module.exports = Place = mongoose.model('Place', PlaceSchema);