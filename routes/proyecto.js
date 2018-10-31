var express=require('express');
var mdAutenticacion=require('../middlewares/autenticacion');

var app=express();

var Proyecto=require('../models/proyecto');

//========================================================
// Obtener todos los proyectos de un cliente
//========================================================
app.get('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id=req.params.id;
    
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Proyecto.find({'clienteId':id})
    .skip(desde)
    .limit(10)
    .populate('usuarioCreador','nombre email')
    .populate('usuarioUltimaModificacion', 'nombre email')
    .exec((err,proyectosCliente)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar proyectos',
                errors:err
            });
        }

        if(!proyectosCliente){
            return res.status(400).json({
                ok: false,
                mensaje: 'No hay proyectos asociados al cliente id: ' + id,
                errors:{message:'No hay proyectos asociados a el cliente especificado'}
            });
        }

        Proyecto.count({ 'clienteId': id}, (err, conteoProyectos) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al contar los proyectos',
                    errors: err
                });
            }
            
            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de proyectos realizada correctamente',
                proyectos:proyectosCliente,
                totalProyectos: conteoProyectos
            });

        });

    });
});
//========================================================
// FIN de Obtener todos los proyectos de un cliente
//========================================================

//========================================================
// Guardar proyecto
//========================================================
app.post('/', mdAutenticacion.verificarToken, (req,res)=>{
    var body=req.body;

    var proyecto = new Proyecto({

        nombre: body.nombre,
        descripcion: body.descripcion,
        img: body.img,
        clienteId: body.clienteId,
        estatus: body.estatus,
        usuarioUltimaModificacion: body.usuarioUltimaModificacion,
        usuarioCreador: body.usuarioCreador,
        chatId: body.chatId

    });

    proyecto.save( (err, proyectoGuardado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar proyecto',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Proyecto guardado exitosamente',
            proyecto: proyectoGuardado
        });
    });
});
//========================================================
// FIN de Guardar proyecto
//========================================================

//========================================================
// Actualizar proyecto
//========================================================
app.put('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id=req.params.id;
    var body=req.body;

    Proyecto.findById( id )
    .exec((err, proyecto)=>{

        if(err){
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar proyecto',
                errors:err
            });
        }

        if(!proyecto){
            res.status(400).json({
                ok: false,
                mensaje: 'No existe el proyecto id: ' + id,
                errors: { message:'No existe un proyecto que coincida con el id: ' + id + ', en la base de datos' }
            });
        }

        proyecto.nombre=body.nombre;
        proyecto.descripcion=body.descripcion;
        proyecto.img=body.img;
        proyecto.estatus=body.estatus;
        proyecto.clienteId=body.clienteId;
        proyecto.usuarioUltimaModificacion = req.usuario._id;

        proyecto.save((err, proyectoActualizado)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al actualizar el proyecto id: ' + id,
                    errors:err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'El proyecto se actualizo exitosamente',
                proyecto: proyectoActualizado
            });
        });
    });

});
//========================================================
// FIN de Actualizar proyecto
//========================================================

//========================================================
// Eliminar un proyecto
//========================================================
app.delete('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id = req.params.id;

    Proyecto.findByIdAndDelete(id, (err, proyectoEliminado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar proyecto',
                errors: err
            });
        }

        if(!proyectoEliminado){
            return res.status(400).json({
                ok: false,
                mensaje: 'El proyecto id: ' + id + ', no existe',
                errors: { message: 'El proyecto que se desea eliminar no existe en la base de datos'}
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Proyecto eliminado exitosamente',
            proyecto: proyectoEliminado
        });
    });
});
//========================================================
// FIN de Eliminar un proyecto
//========================================================

module.exports = app;
