var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");
var menuDefault = require("../data/menuDefault").MENU_DEFAULT;
var menuDefaultAdmin = require("../data/menuDefault").MENU_DEFAULT_ADMIN;

var app = express();

var Menu = require("../models/menu");
var Usuario = require("../models/usuario");

//===============================================
// Obtener menu de usuario por id
//===============================================
app.get('/:userId', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.userId;

    Menu.find({ usuario: id })
        .populate('usuario', 'nombre')
        .exec((err, menu) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar menu',
                    errors: err
                });
            }

            if (!menu || menu.length == 0) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay menu registrados',
                    errors: { message: 'No existen menu registrados en la base de datos para ese usuario' }
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de menu exitosa',
                menu: menu[0],
            });
        });
});
//===============================================
// FIN de Obtener menu de usuario por id
//===============================================

//===============================================
// Crear nuevos menu 
//===============================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;

    var menu = new Menu({
        usuario: body.usuario,
        menu: menuDefault,
    });

    Usuario.findById(body.usuario)
        .exec((err, usuario)=>{
            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }

            if (usuario.role === "ADMIN_ROLE"){
                menu.menu = menuDefaultAdmin;
            }

            menu.save((err, menuGuardado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al guardar menu',
                        errors: err
                    });
                }

                Usuario.populate(menuGuardado, { path: 'usuario', select: 'nombre' }, (err, menuGuardadoPopulated) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al obtener nombre de usuario',
                            errors: err
                        });
                    }

                    res.status(201).json({
                        ok: true,
                        mensaje: 'Menu guardado exitosamente',
                        menu: menuGuardadoPopulated
                    });

                });



            });

        });

    
});
//===============================================
// FIN de Crear nuevos menu 
//===============================================

//===============================================
// Actualizar menu de usuario
//===============================================
app.put('/:userId', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.userId;
    var body = req.body;    

    Menu.find({ usuario: id })
        .exec((err, menu) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar menu",
                    errors: err
                });
            }

            if (!menu || menu.length === 0) {
                return res.status(400).json({
                    ok: false,
                    mensaje: "No existen menu para el usuario: " + id,
                    errors: { message: 'No existen menu para el usuario: ' + id + ', en la base de datos' }
                });
            }

            menu = menu[0];

            //Propiedades a actualizar
            (body.menu) ? menu.menu = body.menu : null;

            menu.save((err, menuActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al actualizar menu",
                        errors: err
                    });
                }

                Menu.populate(menuActualizado, { path: 'usuario', select: 'nombre' }, (err, menuActualizadoPopulated) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error al buscar el nombre del usuario",
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        mensaje: "El menu se actualizó exitosamente",
                        menu: menuActualizadoPopulated
                    });
                });
            });
        });
});
//===============================================
// FIN de Actualizar menu de usuario
//===============================================


module.exports = app;