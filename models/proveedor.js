var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var proveedorSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre del cliente es requerido'] },
    telefono: { type: String, required: [true, 'El teléfono del cliente es requerido'] },
    direccion: { type: String, required: false },
    email: { type: String, required: false },
});

module.exports = mongoose.model('Proveedor', proveedorSchema);