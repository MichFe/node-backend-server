var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var categoriasDeGasto = {
    values: [
        'Materiales e Insumos',
        'Servicios',
        'Transporte',
        'Mantenimiento y Reparaciones',
        'Viáticos',
        'Servicios Profesionales',
        'Nomina',
        'Pago a proveedores', // Opcion para registro de gasto al registrar un pago a proveedores
        'Otros'
    ],
    message: '{VALUE} no es una categoría válida'
};

var gastoSchema = new Schema({
    usuarioCreador: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: Date, required: true },
    monto: { type: Number, required: true },
    descripcion: { type: String, required: true },
    categoria: { type: String, required: true, enum: categoriasDeGasto },
    proveedor: { type: Schema.Types.ObjectId, ref: 'Proveedor', required: true },
    pagoCompra: { type: Schema.Types.ObjectId, ref: 'Pago', required: false }
});


module.exports = mongoose.model("Gasto", gastoSchema); 