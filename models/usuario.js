var mongoose=require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

//Roles de usuarios
var rolesValidos = {
    values:[
        'ADMIN_ROLE',
        'USER_ROLE',
        'AGENTE_VENTAS_ROLE'
    ],
    message:'{VALUE} no es un rol válido'
};

var unidadesDeNegocio = {
    values: [
        'Fabrica',
        'Tienda León',
        'Tienda Guadalajara',
        'Expo GDL',
        'Expo CDMX'
    ],
    message: '{VALUE} no es una unidad de negocio válida'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required:[true, 'El nombre es necesario'] },
    email: { type: String, unique:true, required:[true, 'El email es necesario']},
    password: { type: String, required:[ true, "La contraseña es necesaria"]},
    img: { type:String, required:false },
    role: { type:String, required:true, default: 'USER_ROLE', enum: rolesValidos },
    unidadDeNegocio: { type: String, required: true, enum: unidadesDeNegocio },
    salario: { type: Number, required: false}
});

usuarioSchema.plugin( uniqueValidator, { message:'El {PATH} debe de ser único' } );

module.exports = mongoose.model( 'Usuario', usuarioSchema );