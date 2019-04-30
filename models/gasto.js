var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var categoriasDeGasto = {
    values: [
        "Proveedores Productos",
        "Proveedores Materia Prima",
        "Proveedores Maquila",
        "Nómina",
        "Otros",
        "Fletes",
        "Publicidad",
        "Gastos no Operativos",
        "Comisiones por Ventas",
        "Impuestos",
        "Transporte",
        "Maquinaria/Equipo",
        "Mantenimiento",
        "Renta/Servicios"
    ],
    message: '{VALUE} no es una categoría válida'
};

var gastoSchema = new Schema({
    usuarioCreador: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: Date, required: true },
    monto: { type: Number, required: true },
    descripcion: { type: String, required: true },
    categoria: { type: String, required: true, enum: categoriasDeGasto },
    proveedor: { type: Schema.Types.ObjectId, ref: 'Proveedor', required: false },
    pagoCompra: { type: Schema.Types.ObjectId, ref: 'Pago', required: false },
    gastoOperativo: { type: Boolean, required: true }
});


module.exports = mongoose.model("Gasto", gastoSchema); 