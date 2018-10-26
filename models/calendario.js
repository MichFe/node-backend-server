var mongoose =  require('mongoose');

var Schema = mongoose.Schema;

var calendarioSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    year: { type: String, required: true },
    month: { type: String, required:true },
    eventos: { type: Array }
});


module.exports = mongoose.model('Calendario',calendarioSchema); 