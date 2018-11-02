var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Chat = require('../models/chat');

app.get('/:idProyecto', mdAutenticacion.verificarToken, (req, res) => {
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

app.post('/', mdAutenticacion.verificarToken, (req,res)=>{
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

   



module.exports = app;