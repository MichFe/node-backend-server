var express = require('express');
var UPLOADS_PATH = require("../config/config").UPLOADS_PATH;
var mongoose = require("mongoose");

var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require("fs");

var app = express();

var Chat = require('../models/chat');
var Proyecto = require('../models/proyecto');

app.get('/:idProyecto', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var proyectoId=req.params.idProyecto;
    var chatsCargados= req.query.chatsCargados || 0;

    chatsCargados = Number(chatsCargados);

        Chat.find({ 'proyectoId': proyectoId })
                .populate( 'usuario', '-password' )
                .sort('-fecha')
                .limit(5)
                .skip(chatsCargados)
                .exec( (err,chats)=>{

                    if(err){
                        return res.status(400).json({
                            ok:false,
                            mensaje: 'Error al consultar chats del proyecto: '+ proyectoId,
                            errors: err
                        });
                    }

                    if(!chats){
                        return res.status(200).json({
                            ok:true,
                            mensaje:'No hay chats en el proyecto: ' + proyectoId,
                        });
                    }

                    Chat.count({ 'proyectoId': proyectoId }, (err, conteoChats) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al contar los chats del proyecto: ' + proyectoId,
                                errors: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            mensaje: 'Consulta de chats realizada correctamente',
                            chats: chats,
                            totalChats: conteoChats
                        });
                    
                });

        


    });

});

app.post('/', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req,res)=>{
    var body = req.body;

    var chat = new Chat({

        usuario:body.usuario ,
        tipo:body.tipo ,
        proyectoId:body.proyectoId ,
        fecha:body.fecha ,
        mensaje:body.mensaje ,
        audio:body.audio ,
        img:body.img 

    });

    chat.save( (err, chatGuardado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar chat',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Mensaje guardado correctamente',
            chat: chatGuardado
        });
    });


});

app.get('/conteoChats/cliente', mdAutenticacion.verificarToken,( req, res)=>{
    
    

    Chat
      .aggregate([
        { $lookup:{
            from: 'proyectos',
            localField: 'proyectoId',
            foreignField: '_id',
            as:'cliente'
        } },
        { $group: {
            _id: { $arrayElemAt: ['$cliente.clienteId', 0] },
            conteoMensajes: { $sum: 1 }
        }}
    ])
    .exec( (err, conteoMensajes)=>{

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'respuesta Rapida',
        //     conteoMensajes:conteoMensajes
        // });

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al contar el total de mensajes',
                errors: err
            });
        }

        if (!conteoMensajes) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No hay mensajes',
                errors: { message: 'No hay mensajes para ejecutar el conteo' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Conteo de mensajes exitoso',
            conteoDeMensajes: conteoMensajes
        });

        

        
    });

});

app.get("/conteoChats/proyectos/:id", mdAutenticacion.verificarToken, ( req, res )=>{
    var clienteId = req.params.id;

    Chat
      .aggregate([
          { $lookup:{
            from: 'proyectos',
            localField: 'proyectoId',
            foreignField: '_id',
            as:'proyecto'
        } },
        { $project:{
            _id: { $arrayElemAt: ['$proyecto.clienteId',0]},
            proyectoId: '$proyectoId'
        } },
          { $match: { _id: mongoose.Types.ObjectId(clienteId) }},
        { $group: {
            _id: '$proyectoId',
            conteoMensajes: { $sum: 1 }
        } }
        
      ])
      .exec( (err, consulta)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al realizar consulta',
                errors: err
            });
        }

        if(!consulta){
            return res.status(400).json({
                ok: false,
                mensaje: 'No hay resultados para la consulta realizada',
                errors: { message: 'No hay resulados para la consulta realizada' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Conteo de chats por proyecto realizada exitosamente',
            conteoMensajes: consulta
        });

      });
});

app.delete('/:id', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, ( req, res )=>{
    var id = req.params.id;

    Chat.findByIdAndDelete(id)
        .exec( (err, chatEliminado)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al eliminar mensaje',
                    errors: err
                });
            }

            if(!chatEliminado){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay mensajes que coincidan con el id: ' + id,
                    errors: { message: 'No hay ningun mensaje que coincida con el id: ' + id }
                });
            }

            if(chatEliminado.img){
                eliminarImagen(chatEliminado.img);
            }

            if (chatEliminado.audio){
                eliminarAudio(chatEliminado.audio);
            }

            res.status(200).json({
                ok: true,
                mensaje: 'El mensaje se ha eliminado exitosamente',
                chatEliminado: chatEliminado
            });

        });

});


function eliminarImagen(path){
    var oldPath = UPLOADS_PATH + `chat/` + path;

    if (fs.existsSync(oldPath)) {

        fs.unlink(oldPath, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al eliminar imagen',
                    errors: err
                });
            }
        });

    }
}

function eliminarAudio(path) {
    var oldPath = UPLOADS_PATH + `chatAudio/` + path;

    if (fs.existsSync(oldPath)) {

        fs.unlink(oldPath, (err) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al eliminar audio',
                    errors: err
                });
            }
        });

    }
}

   



module.exports = app;