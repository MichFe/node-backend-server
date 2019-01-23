var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var chatSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'El usuario que envía el mensaje es requerido'] },
    registroLecturaClientes: [],
    registroLecturaProyectos: []
});

module.exports = mongoose.model('Lectura', chatSchema);