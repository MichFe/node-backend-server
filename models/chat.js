var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// Tipos de mensajes válidos
var tiposValidos = {
  values: ["texto", "audio", "imagen"],
  message: "{VALUE} no es un estatus válido"
};

var chatSchema = new Schema({
  usuario: { type: Schema.Types.Mixed, required: [true, 'El usuario que envía el mensaje es requerido'] },
    tipo: { type: String, required: [true, 'El tipo de chat es requerido'], enum:tiposValidos },
    proyectoId: { type: Schema.Types.ObjectId, ref:'Proyecto',required: true },
    fecha: { type: Date, required: [true, 'La fecha es requerida'] },
    mensaje: { type: String, required: false },
    audio: { type: String, required: false },
    img: { type: String, required: false }

});

module.exports = mongoose.model('Chat', chatSchema);