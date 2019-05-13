var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var asistencia = {
  values: [
    "Asistencia",
    "Retardo",
    "Falta"
  ],
  message: "{VALUE} no es una categoría de asistencia válida"
};

var tipoAjuste = {
    values: [
        "Bono",
        "Deducción",
    ],
    message: "{VALUE} no es una categoría de asistencia válida"
};

var estatusNomina = {
  values: [
    "Por Pagar",
    "Pagada",
  ],
  message: "{VALUE} no es una estatus de nómina válido"
};

var ajusteSchema = new Schema({
    motivo: { type: String, required: true },
    monto: { type: Number, required: true },
    tipo:  { type: String, enum: tipoAjuste, required: true }
});

var nominaEmpleadoSchema = new Schema({
        empleado: { type: Schema.Types.ObjectId, ref: "Usuario" },
        lu: {type: String, enum: asistencia, required: true},
        ma: {type: String, enum: asistencia, required: true},
        mi: {type: String, enum: asistencia, required: true},
        ju: {type: String, enum: asistencia, required: true},
        vi: {type: String, enum: asistencia, required: true},
        sa: {type: String, enum: asistencia, required: true},
        do: {type: String, enum: asistencia, required: true},
        salarioBase:{ type: Number, required: true },
        ajustes: [ajusteSchema],
        totalAjustes: { type: Number, required: true },
        salarioFinal: { type: Number, required: true }
});

var nominaSchema = new Schema({
    fechaInicial: { type: Date, required: true, unique: true },
    fechaFinal: { type: Date, required: true, unique: true },
    nominaEmpleados: [nominaEmpleadoSchema],
    total: { type: Number, required: true },
    estatus: { type: String, required: true, default: 'Por Pagar', enum: estatusNomina }
});

module.exports = mongoose.model('Nomina', nominaSchema); 