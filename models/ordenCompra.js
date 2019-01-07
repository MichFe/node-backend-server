var mongoose =  require('mongoose');

var Schema = mongoose.Schema;

var ordenCompraSchema = new Schema({
    requisicion: { type: Schema.Types.ObjectId, ref: 'Requisicion', required: true },
    descripcion: { type: String, required: true },
    cantidad: { type: String, required: true },
    solicitante: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    proveedor: {},
    costo: { type: Number, required: false },
    fechaEntrega: { type: Date, required: true },
    comentario: { type: String, required: false },
    estatus: {},
    montoPagado: { type: Number, required: false },
    saldoPendiente: { type: Number, required: false  },
    historialPagos:[]

});