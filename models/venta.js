var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var estatusVenta = {
    values: [
        'Liquidada',
        'Saldo Pendiente'
    ],
    message: '{VALUE} no es un estatus válido'
};

var unidadesDeNegocio = {
    values: [
        'Fabrica',
        'Tienda León',
        'Tienda Guadalajara',
        'Expo GDL',
        'Expo CDMX',
        'Imbra'
    ],
    message: '{VALUE} no es una unidad de negocio válida'
};

var ventaSchema = new Schema({
    cliente: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },
    proyecto: { type: Schema.Types.ObjectId, ref: 'Proyecto', required: false },
    tipoDePago: { type: String, required: true },
    iva: { type: Number, required: true },
    carrito: [{}],
    subtotal: { type: Number, required:true },
    total: { type: Number, required: true },
    vendedor: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: Date, required: true },
    montoPagado: { type: Number, required: true },
    saldoPendiente: { type: Number, required: true },
    estatus: { type: String, required: true, enum: estatusVenta },
    unidadDeNegocio: { type: String, required: true, enum: unidadesDeNegocio }
});


module.exports = mongoose.model('Venta', ventaSchema); 