var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// Tipos de mensajes válidos
var tiposValidos = {
    values: ["texto", "audio", "imagen"],
    message: "{VALUE} no es un estatus válido"
};

var productoSchema = new Schema({

    codigo: { type: String, required: [true, 'El código del producto es requerido'] },
    nombre: { type: String, required: [true, 'El nombre de producto es requerido'], enum: tiposValidos },
    familia: { type: String, required: true },
    img: { type: String, required: true},
    tCarpinteria: { type: Number, required: false},
    tPulido1: { type: Number, required: false },
    tFondo: { type: Number, required: false },
    tPulido2: { type: Number, required: false },
    tTerminado: { type: Number, required: false },
    tEmpaque: { type: Number, required: false }

});

module.exports = mongoose.model('Producto', productoSchema);