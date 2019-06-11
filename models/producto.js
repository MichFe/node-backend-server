var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

// Tipos de mensajes válidos
var familiasValidas = {
  values: [
    "Credenzas",
    "Mesas",
    "Cómodas",
    "Sillas",
    "Sillones",
    "Bancas",
    "Bancos",
    "Libreros",
    "Lámparas",
    "Ocasionales",
    "Salas",
    "Cabeceras",
    "Bases de Cama",
    "Libreros",
    "Cuadros",
    "Tapetes",
    "Accesorios"
  ],
  message: "{VALUE} no es una familia de productos válida"
};

var productoSchema = new Schema({

    codigo: { type: String, required: [true, 'El código del producto es requerido'] },
    nombre: { type: String, required: [true, 'El nombre de producto es requerido'] },
    familia: { type: String, required: [true, 'La familia del producto es requerida'], enum: familiasValidas },
    precio: { type: Number, required: [true, "El precio del producto es requerido"] },
    img: { type: String, required: false },
    cantidad: { type: Number, default: false, required: false },
    tCarpinteria: { type: Number, required: false},
    tPulido1: { type: Number, required: false },
    tFondo: { type: Number, required: false },
    tPulido2: { type: Number, required: false },
    tTerminado: { type: Number, required: false },
    tEmpaque: { type: Number, required: false },
    usuarioUltimaModificacion: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    usuarioCreador: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }


});

module.exports = mongoose.model('Producto', productoSchema);