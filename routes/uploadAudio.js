var express = require('express');
var UPLOADS_PATH = require("../config/config").UPLOADS_PATH;

var fileUpload = require('express-fileupload');
var fs = require('fs');

//Importación de modelos
var Chat = require("../models/chat");

var app = express();

//default options
app.use(fileUpload()); //Middleware fileupload

app.put( '/:coleccion/:id', (req, res)=>{
    var coleccion = req.params.coleccion;
    var id = req.params.id;

    var coleccionesValidas = ['chat'];

    //Validamos la colección
    if( coleccionesValidas.indexOf(coleccion)<0 ){
        return res.status(400).json({
            ok: false,
            mensaje: "La colección " + coleccion + " no permite guardar audios",
            errors: { message: 'La petición debe coincidir con una colección válida: ' + coleccionesValidas.join(', ')}
        });
    }

    //Validamos que la petición cuente con archivos adjuntos
    if(!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: "No hay archivos para subir",
            errors: { message: 'Es necesario seleccionar un archivo' }
        });
    }

    //Obtener el nombre del archivo
    var archivo = req.files.audio;

    //Obteniendo extensión del archivo
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    //Aqui irá la validación de extensiones

    //Nombre de archivo personalizado
    // Id-random el random ayuda a prevenir el cache del navegador
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    //Mover el archivo del temporal a un path
    var path = UPLOADS_PATH + `chatAudio/${nombreArchivo}`;

    archivo.mv( path, (err)=>{  

        if(err){
            return res.status(500).json({
                   ok: false,
                   mensaje: 'error al mover archivo',
                   errors: err
            });
        }

        asignarAudio( coleccion, id, nombreArchivo, res);

        // return res.status(200).json({
        //        ok: true,
        //        mensaje: 'Archivo movido',
        //        extesion: extension
        // });
    });

    function asignarAudio(coleccion, id, nombreArchivo, res){

        if(coleccion==='chat'){
            Chat.findById( id, (err, chat)=>{
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al buscar chat en BD",
                        errors: err
                    });
                }

                chat.audio=nombreArchivo;

                chat.save( (err,chatActualizado)=>{
                    if(err){
                        return res.status(500).json({
                            ok: false,
                            mensaje: "Error al guardar nombre del audio en objeto chat",
                            errors:err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: "Chatde audio guardado exitosamente",
                        chat: chatActualizado
                    });

                });

            });
        }

    }


});

module.exports = app;