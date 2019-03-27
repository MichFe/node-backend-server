var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var cobroSchema = new Schema({
    venta: { type: Schema.Types.ObjectId, ref: 'Venta', required: [true, 'Es necesario asociar el pago a una venta'] },
    cliente: { type: Schema.Types.ObjectId, ref: 'Usuario', required: [true, 'Es necesario asociar el pago a un cliente'] },
    monto: { type: Number, required: true },
    tipoDePago: { type: String, required: true },
    fecha: { type: Date, required: true }
});

module.exports = mongoose.model('Cobro', cobroSchema); 