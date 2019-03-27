var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var unidadesDeNegocio = {
    values: [
        'Fabrica',
        'Tienda León',
        'Tienda Guadalajara'
    ],
    message: '{VALUE} no es una unidad de negocio válida'
};

var estatusPago = {
    values: [
        'Liquidada',
        'Saldo Pendiente'
    ],
    message: '{VALUE} no es un estatus válido'
};

var estatusPedido = {
    values: [
        'Pedido',
        'Recibido'
    ],
    message: '{VALUE} no es un estatus válido'
}

var compraSchema = new Schema({
    requisicion: { type: Schema.Types.ObjectId, ref: 'Requisicion', unique: true, required: true },
    fechaCompra: { type: Date, required: true },
    fechaCompromisoEntrega: { type: Date, required: true },
    fechaReciboMercancia: { type: Date, required: false },
    proveedor: { type: Schema.Types.ObjectId, ref:"Proveedor", required: true },
    costoTotal: { type: Number, required: true }, 
    montoPagado: { type: Number, required: true },
    saldoPendiente: { type: Number, required: true },
    estatusPago: { type: String, required: true, enum: estatusPago, default: 'Saldo Pendiente' },
    comentarioCompras: { type: String, required: false },
    usuarioCreador: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    estatusPedido: { type: String, required: true, enum:estatusPedido, default: 'Pedido' }
});

module.exports = mongoose.model('Compra', compraSchema);