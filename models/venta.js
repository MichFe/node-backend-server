var mongoose = require('mongoose');
var Producto = require('./producto');

var Schema = mongoose.Schema;

var ventaSchema = new Schema({
    subtotal: { type: Number, required:true },
    iva: { type: Number, required: true },
    total: { type: Number, required: true },
    vendedor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: Date, required: true },
    carrito: [{}],
    tipoDePago: { type: String, required: true },
    cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: false },
    efectivoRecibido: { type: Number, required: false }
});


module.exports = mongoose.model('Venta', ventaSchema); 