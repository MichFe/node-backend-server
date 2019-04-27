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

var estatusRequisicion = {
    values: [
        'Por aprobar',
        'Aprobada',
        'Rechazada',
        'Pedido',
        'Recibido'
    ],
    message: '{VALUE} no es un estatus válido'
};

var requisicionSchema = new Schema({
  descripcion: { type: String, required: true },
  cantidad: { type: String, required: true },
  solicitante: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  unidadDeNegocio: { type: String, required: true, enum: unidadesDeNegocio },
  estatus: { type: String, required: true, enum: estatusRequisicion },
  fechaSolicitud: { type: Date, required: true },
  fechaAprobacionRechazo: { type: Date, required: false },
  fechaCompromisoProveedor: { type: Date, required: false },
  aprobador: { type: Schema.Types.ObjectId, ref: "Usuario", required: false },
  compraCreada: { type:Boolean, default: false, required: false },
  productoRecibido: { type: Boolean, default: false, required: false },
  compra:{ type: Schema.Types.ObjectId, ref: "Compra", required: false }
});


module.exports = mongoose.model('Requisicion', requisicionSchema); 