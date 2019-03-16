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

var estatusCompra = {
    values: [
        'Liquidada',
        'Saldo Pendiente'
    ],
    message: '{VALUE} no es un estatus válido'
};

var compraSchema = new Schema({
    descripcion: { type: String, required: true },
    cantidad: { type: String, required: true },
    solicitante: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    unidadDeNegocio: { type: String, required: true, enum: unidadesDeNegocio },
    fechaSolicitud: { type: Date, required: true },
    fechaAprobacionRechazo: { type: Date, required: false },
    aprobador: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    proveedor: { type: Schema.Types.ObjectId, ref:"Proveedor", required: true },
    costoTotal: { type: Number, required: true }, 
    fechaCompra: { type: Date, required: true },
    fechaCompromisoEntrega: { type: Date, required: true },
    montoPagado: { type: Number, required: true },
    saldoPendiente: { type: Number, required: true },
    estatus: { type: String, required: true, enum: estatusCompra },
    comentarioCompras: { type: String, required: false }
});

module.exports = mongoose.model('Compra', compraSchema);