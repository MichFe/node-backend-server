var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
var Permisos=require('../models/permisos');

//==================================
// Verificar Token
//==================================
exports.verificarToken = function( req, res, next){
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token inválido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
    
        next();
    
    });
}
//==================================
// FIN de Verificar Token
//==================================

//==================================
// Validar Permisos de Usuario
//==================================
exports.validarPermisos = function (req, res, next) {
    var usuario = req.usuario;

    var baseUrl = req.baseUrl;
    var urlPath = req.route.path;

    var url = baseUrl + urlPath;
    var method = req.method;
    
    if (usuario.role ==='ADMIN_ROLE'){
        
        next();

    }else{
        
        Permisos.find({
            usuario: usuario._id,
        })
            .exec((err, permisos) => {                

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar permisos',
                        errors: err
                    });
                }

                if (!permisos || permisos.length===0) {
                    return res.status(401).json({
                        ok: false,
                        mensaje: 'Sus permisos aún no han sido definidos',
                        errors: { message: 'Contacte con un administrador para que configure sus permisos' }
                    });
                }   
                
                

                var permiso = permisos[0].permisos.filter((permisoOfPermisos) => {
                    return (permisoOfPermisos.url === url && permisoOfPermisos.method === method);
                });    
                            
                permiso=permiso[0];

                if(!permiso){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'La ruta no se encuentra definida en permisos',
                        errors: { message: 'Es necesario incluir la ruta en el arreglo de permisos' }
                    });
                }

                if(!permiso.enabled){
                    
                   return res.status(401).json({
                       ok: false,
                       mensaje: 'No cuenta con privilegios para realizar esta acción',
                       errors: { message: 'No esta autorizado para realizar esta acción'}
                   });
                }
                //Usuario con permisos para ejecutar la acción solicitada
                next();

            });
    }
}
//======================================
// FIN de Validar Permisos de Usuario
//======================================