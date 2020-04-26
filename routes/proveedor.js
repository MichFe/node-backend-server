var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Proveedor = require('../models/proveedor');

//=========================================
// Obtener todos los proveedores
//=========================================
app.get('/todosLosProveedores',mdAutenticacion.verificarToken,(req,res)=>{

    Proveedor.find({})
        .sort('nombre')
        .exec((err, proveedores)=>{

            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar proveedores",
                errors: err
              });
            }

            if (!proveedores) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay proveedores registrados',
                    errors: { message: 'No existen proveedores registrados en la base de datos' }
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de proveedores exitosa',
                proveedores: proveedores
            });
        });

});
//=========================================
// FIN de Obtener todos los proveedores
//=========================================

//===============================================
// Obtener proveedores de 10 en 10
//===============================================
app.get('/', mdAutenticacion.verificarToken, (req,res)=>{
    var desde = Number(req.query.desde) || 0;

    Proveedor.find({})
        .skip(desde)
        .limit(10)
        .exec( (err, proveedores)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar proveedores',
                    errors: err
                });
            }

            if(!proveedores){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay proveedores registrados',
                    errors: { message: 'No existen proveedores registrados en la base de datos' }
                });
            }

            Proveedor.countDocuments((err,proveedoresCount)=>{

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al contar proveedores',
                        errors: err
                    });
                }

                if(!proveedoresCount){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al contar el número de proveedores',
                        errors: { message: 'Error al contar proveedores' }
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Consulta de proveedores exitosa',
                    proveedores: proveedores,
                    totalProveedores: proveedoresCount
                });

            });

            

        });

});
//===============================================
// FIN de Obtener proveedores de 10 en 10
//===============================================

//===============================================
// Crear un nuevo proveedor 
//===============================================
app.post('/', mdAutenticacion.verificarToken, (req, res)=>{
    var body = req.body;

    var proveedor = new Proveedor({
        nombre: body.nombre,
        telefono: body.telefono,
        direccion: body.direccion,
        email: body.email,
    });

    proveedor.save((err,proveedorGuardado)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar proveedor',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Proveedor guardado exitosamente',
            proveedor: proveedorGuardado
        });
    });
});
//===============================================
// FIN de Crear un nuevo proveedor 
//===============================================

//===============================================
// Actualizar proveedor por Id 
//===============================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res)=>{
    var id = req.params.id;
    var body = req.body;

    Proveedor.findById( id, (err,proveedor)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar proveedor",
                errors: err
            });
        }

        if (!proveedor) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe el proveedor id: " + id,
                errors: { message: 'No existe un proveedor que coincida con el id: ' + id + ', en la base de datos' }
            });
        }

        //Propiedades a actualizar
        ( body.nombre )?proveedor.nombre = body.nombre:null;
        ( body.telefono )?proveedor.telefono = body.telefono:null;
        ( body.direccion )?proveedor.direccion = body.direccion:null;
        ( body.email )?proveedor.email = body.email:null;

        proveedor.save((err,proveedorActualizado)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al actualizar proveedor",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: "El proveedor se actualizó exitosamente",
                proveedor: proveedorActualizado
            });
        });
    });
});
//===============================================
// FIN de Actualizar proveedor por Id 
//===============================================

//===============================================
// Eliminar proveedor por Id 
//===============================================
app.delete('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id=req.params.id;
    
    Proveedor.findByIdAndDelete(id, (err, proveedorEliminado)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al eliminar proveedor",
                errors: err
            });
        }

        if (!proveedorEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El proveedor id: ' + id + ', no existe',
                errors: { message: 'El proveedor que se desea eliminar no existe en la base de datos' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Proveedor eliminado exitosamente",
            proveedor: proveedorEliminado
        });
    });
});
//===============================================
// FIN de Eliminar proveedor por Id 
//===============================================

module.exports = app;