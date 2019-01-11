var mongoose = require("mongoose");
// var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var cotizacionSchema = new Schema({
    proyecto: { type: Schema.Types.ObjectId, ref: 'Proyecto', required: [true, 'El id del proyecto es requerido'] },
    cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: [true, 'El id del cliente es requerido'] },
    fecha: { type: Date, required: [true, 'La fecha de la cotizacion es requerida'] },
    carrito: [{}],
    subtotal: { type: Number, required: [true, 'El subtotal es requerido'] },
    descuento: { type: Number, required: [true, 'El descuento es requerido. Si es cero, favor de indicarlo'] },
    total: { type: Number, required: [true, 'El total es requerido'] },
});

module.exports = mongoose.model('Cotizacion', cotizacionSchema);