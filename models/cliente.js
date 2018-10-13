var mongoose = require('mongoose');
// var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

//Roles de usuarios
var estatusValidos = {
    values: [
        'Activo',
        'Inactivo'
    ],
    message: '{VALUE} no es un estatus válido'
};

var clienteSchema = new Schema({
    nombre: { type: String, required: [ true, 'El nombre del cliente es requerido'] },
    telefono: { type: String, required:[ true, 'El teléfono del cliente es requerido'] },
    direccion: { type:String, required: [true, 'El domicilio del cliente es requerido'] },
    email: { type: String, required:false },
    img: { type:String, required:false },
    estatus: { type: String, required: true, default: 'Activo', enum: estatusValidos }
});

module.exports = mongoose.model( 'Cliente', clienteSchema );