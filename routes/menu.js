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
        .populate('usuario', 'nombre role')
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
                       
            let menuFinal = validarMenuVsDefaultMenu(menu[0].menu, menu[0].usuario.role);
            menu[0].menu = menuFinal.slice();
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

//Funciones
function validarMenuVsDefaultMenu(menuAnterior,userRole){
    
    let menuEstandar = menuDefault.slice();
    let xMenuEstandar = 0;
    let iMenuAnterior = 0;
    let nombreMenuAnterior;
    let nombreMenuEstandar;

   //Validando menus
    while( xMenuEstandar < menuEstandar.length ){
        nombreMenuEstandar = menuEstandar[xMenuEstandar].modulo;
        iMenuAnterior=0;
        while (iMenuAnterior < menuAnterior.length){
            nombreMenuAnterior = menuAnterior[iMenuAnterior].modulo;
            
            if(nombreMenuAnterior==nombreMenuEstandar){
                menuEstandar[xMenuEstandar].show = menuAnterior[iMenuAnterior].show;
                iMenuAnterior= menuAnterior.length;
                
            }else{
                iMenuAnterior+=1;
            }
        }

        xMenuEstandar+=1;

    }

    //Validando submenus
    let yMenuEstandar = 0;
    let jMenuAnterior = 0;
    let nombreSubmenuEstandar;
    let nombreSubmenuAnterior;
    let match = false;
    xMenuEstandar = 0;
    iMenuAnterior = 0;

    while( xMenuEstandar < menuEstandar.length){
        
        
        
        //Verificamos si hay submenus
        if( menuEstandar[xMenuEstandar].submenu){
            yMenuEstandar=0;
            while( yMenuEstandar < menuEstandar[xMenuEstandar].submenu.length){
                
                nombreSubmenuEstandar = menuEstandar[xMenuEstandar].submenu[yMenuEstandar].titulo;
                
                iMenuAnterior=0;
                match=false;
                //Corremos loop en menu anterior
                while( iMenuAnterior < menuAnterior.length ){
                    
                    //Verificamos si hay submenus
                    if( menuAnterior[iMenuAnterior].submenu.length>0 ){
                        jMenuAnterior=0;
                        while( jMenuAnterior < menuAnterior[iMenuAnterior].submenu.length ){
                            
                            nombreSubmenuAnterior = menuAnterior[iMenuAnterior].submenu[jMenuAnterior].titulo;
                            
                            if( nombreSubmenuAnterior == nombreSubmenuEstandar){
                                menuEstandar[xMenuEstandar].submenu[yMenuEstandar].show = menuAnterior[iMenuAnterior].submenu[jMenuAnterior].show;
                                jMenuAnterior = menuAnterior[iMenuAnterior].submenu.length;
                                match = true;
                            }else{
                                jMenuAnterior+=1;
                            }

                        }
                        
                    }
                    if (match) {
                        iMenuAnterior=menuAnterior.length;
                    }else{
                        iMenuAnterior+=1;
                    }
                }
                
                if (!match && menuEstandar[xMenuEstandar].submenu.length > 0){
                    
                    menuEstandar[xMenuEstandar].submenu[yMenuEstandar].show = false;
                }

                if (userRole == 'ADMIN_ROLE'){
                    menuEstandar[xMenuEstandar].submenu[yMenuEstandar].show = true;
                }

                yMenuEstandar+=1;

            }
            
        }
        xMenuEstandar+=1;
        
    }


    return menuEstandar;

}


module.exports = app;