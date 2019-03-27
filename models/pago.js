var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var pagoSchema = new Schema({
    compra: { type: Schema.Types.ObjectId, ref: 'Compra', required: [true, 'Es necesario asociar el pago a una compra'] },
    proveedor: { type: Schema.Types.ObjectId, ref: 'Proveedor', required: [true, 'Es necesario asociar el pago a un proveedor'] },
    monto: { type: Number, required: true },
    tipoDePago: { type: String, required: true },
    fecha: { type: Date, required: true }
});

module.exports = mongoose.model('Pago', pagoSchema); 