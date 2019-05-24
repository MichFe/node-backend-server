var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var subMenuSchema = new Schema({
    titulo: { type:String, required:true },
    url: { type: String, required: true },
    show: { type: Boolean, required:true }
});

var menuSchema = new Schema({
    modulo: { type: String, required: true },
    icono: { type: String, required: true },
    url: { type: String, required: true },
    show: { type: Boolean, required: true, default: false },
    submenu: [subMenuSchema]
});

var menuUsuarioSchema = new Schema({
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    menu: [menuSchema]

});

module.exports = mongoose.model("Menu", menuUsuarioSchema); 