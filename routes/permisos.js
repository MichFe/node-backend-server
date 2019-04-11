var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");
var permisosDefault = require("../data/permisosDefault").PERMISOS_DEFAULT;

var app = express();

var Permisos = require("../models/permisos");
var Usuario = require("../models/usuario");

//===============================================
// Obtener permisos de usuario por id
//===============================================
app.get('/:userId', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var id=req.params.userId;

    Permisos.find({ usuario: id })
        .populate('usuario', 'nombre')
        .exec((err, permisos) => {            
            
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar permisos',
                    errors: err
                });
            }
            
            if (!permisos || permisos.length==0) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay permisos registrados',
                    errors: { message: 'No existen permisos registrados en la base de datos para ese usuario' }
                });
            }            

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de permisos exitosa',
                permisos: permisos[0],
            });
        });
});
//===============================================
// FIN de Obtener permisos de usuario por id
//===============================================

//===============================================
// Crear nuevos permisos 
//===============================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;
    var usuarioCreador=req.usuario;

    var permisos = new Permisos({
        usuario: body.usuario,
        permisos: permisosDefault,
        fechaUltimaModificacion: new Date(),
        usuarioUltimaModificacion: usuarioCreador._id
    });    

    permisos.save((err, permisosGuardados) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar permisos',
                errors: err
            });
        }

        Usuario.populate(permisosGuardados, { path:'usuario', select: 'nombre' }, (err, permisosGuardadosPopulated)=>{
            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener nombre de usuario',
                    errors: err
                });
            }
            
            res.status(201).json({
            ok: true,
            mensaje: 'Permisos guardados exitosamente',
            permisos: permisosGuardadosPopulated
        });

        });
        

        
    });
});
//===============================================
// FIN de Crear nuevos permisos 
//===============================================

//===============================================
// Actualizar permisos de usuario
//===============================================
app.put('/:userId', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var id = req.params.userId;
    var body = req.body;

    Permisos.find({ usuario: id })
            .exec((err, permisos)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar permisos",
                errors: err
            });
        }

        if ( !permisos || permisos.length === 0 ) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existen permisos para el usuario: " + id,
                errors: { message: 'No existen permisos para el usuario: ' + id + ', en la base de datos' }
            });
        }
        permisos = permisos[0];
        //Propiedades a actualizar
        (body.usuario) ? permisos.usuario = body.usuario : null;
        (body.permisos) ? permisos.permisos = body.permisos : null;
        permisos.fechaUltimaModificacion = new Date();
        permisos.usuarioUltimaModificacion = req.usuario._id;

        permisos.save((err, permisosActualizados) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al actualizar permisos",
                    errors: err
                });
            }

            Permisos.populate( permisosActualizados, { path: 'usuario', select: 'nombre' }, (err, permisosActualizadosPopulated)=>{
                
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al buscar el nombre del usuario",
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: "Los permisos se actualizaron exitosamente",
                    permisos: permisosActualizadosPopulated
                });
            });
        });
    });
});
//===============================================
// FIN de Actualizar permisos de usuario
//===============================================


module.exports = app;
