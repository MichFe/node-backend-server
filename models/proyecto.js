var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var estatusValidos = {
    values:[
        'Concepto',
        'Produccción',
        'Disponible para entregar',
        'Entregado',
        'Cerrado'
    ],
    message:'{VALUE} no es un estatus válido'
}

var proyectoSchema = new Schema({
    nombre: { type:String, required:[ true, 'El nombre del proyecto es requerido'] },
    descripcion:{ type:String, required:[true, 'La descripción del proyecto es requerida'] },
    img: {type:String, required:false },
    cliente:{ type:Schema.Types.ObjectId, ref:'Cliente', required:[true, 'El proyecto debe ser asociado a un cliente'] },
    estatus:{ type:String, required:true, default:'Concepto', enum:estatusValidos }

});

module.exports = mongoose.model('Proyecto', proyectoSchema);