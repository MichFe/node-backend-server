var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var metaSchema = new Schema({
    year: { type: Number, unique: true},
    metas: []
});

module.exports = mongoose.model('Meta', metaSchema); 