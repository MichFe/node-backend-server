var express = require('express');
var UPLOADS_PATH = require("../config/config").UPLOADS_PATH;

var fileUpload =  require('express-fileupload');
var fs = require('fs');
var jimp = require('jimp');

//Importación de modelos
var Usuario = require('../models/usuario');
var Cliente = require("../models/cliente");
var Proyecto = require("../models/proyecto");
var Producto = require("../models/producto");
var Chat = require("../models/chat");

var app = express();

//default options
app.use(fileUpload()); //Middleware fileupload

app.put('/imagen/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    //Colecciones válidas
    var coleccionesValidas = ['usuario', 'cliente', 'proyecto', 'producto', 'chat'];
    
    //Validando coleccion
    if( coleccionesValidas.indexOf(tipo) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'La petición no coincide con una colección valida',
            errors: { message: 'La petición debe coincidir con una colección válida: ' + coleccionesValidas.join(', ') }
        });
    }


    //validando que la petición cuente con archivos adjuntos
    if(!req.files){
        return res.status(400).json({
               ok: false,
               mensaje: 'No hay archivos seleccionados',
               errors: { message: 'Es necesario seleccionar un archivo' }
        });
    }

    //Obtener el nombre del archivo
    var archivo = req.files.imagen;

    //Obteniendo extensión del archivo
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones aceptadas
    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'JPG', 'PNG' ];

    //Validamos que la extensión del archivo sea válida
    if( extensionesValidas.indexOf(extension) < 0){

        return res.status(400).json({
               ok: false,
               mensaje: 'La extensión del archivo no es valida',
               errors: { message: 'El archivo debe ser una imágen: ' + extensionesValidas.join(', ') }
        });
    }

    //Nombre de archivo personalizado
    // Id-random el random ayuda a prevenir el cache del navegador
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    //Mover el archivo del temporal a un path
    var path = UPLOADS_PATH + `${tipo}/${nombreArchivo}`;
    
    archivo.mv( path, (err)=>{  

        if(err){
            return res.status(500).json({
                   ok: false,
                   mensaje: 'error al mover archivo',
                   errors: err
            });
        }

        //Resize de imagen con jimp para que sea mas pequeña
        resizeImage( path, 200 );

        asignarImagen( tipo, id, nombreArchivo, res);

        // return res.status(200).json({
        //        ok: true,
        //        mensaje: 'Archivo movido',
        //        extesion: extension
        // });
    });

    function resizeImage( path, width ){
        jimp.read(path)
            .then(
                (image) => {
                    image
                        .resize( width, jimp.AUTO)
                        .write(path);
                }
            )
            .catch(
                (err) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al cambiar tamaño de la imagen',
                            errors: err
                        });
                    }
                }
            );
    }

    function asignarImagen( coleccion, id, nombreArchivo, res){

        if (coleccion === 'usuario'){
            Usuario.findById(id, (err, usuario)=>{
        
                if(err){
                    return res.status(400).json({
                           ok: false,
                           mensaje: 'El usuario no existe',
                           errors: err
                    });
                }

                var oldPath = UPLOADS_PATH + `${ tipo }/` + usuario.img;

                //Validamos si existe una imagen anterior y la eliminamos
                if( fs.existsSync(oldPath) ){

                    fs.unlink(oldPath, (err)=>{
                        
                        if(err){
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior',
                                errors: err
                            });
                        }
                    });

                }

                usuario.img = nombreArchivo;

                usuario.save( (err, usuarioActualizado)=>{
                    //Manejamos el error al guardar usuario
                    if(err){
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar usuario',
                            errors: err
                        });
                    }

                    usuarioActualizado.password='PRIVATE';

                    return res.status(200).json({
                           ok: true,
                           mensaje: 'Imagen guardada exitosamente',
                           usuario: usuarioActualizado
                    });

                });

            });
        }

        if (coleccion === 'chat') {

            Chat.findById(id, (err, chat) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'El chat no existe',
                        errors: err
                    });
                }

                var oldPath = UPLOADS_PATH + `${tipo}/` + chat.img;

                if (fs.existsSync(oldPath)) {

                    fs.unlink(oldPath, (err) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior',
                                errors: err
                            });
                        }

                    });

                }

                chat.img = nombreArchivo;

                chat.save((err, chatActualizado) => {

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar chat',
                            errors: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Chat actualizado exitosamente',
                        cliente: chatActualizado
                    });
                });

            });

        }

        if (coleccion === 'cliente') {

            Cliente.findById(id, (err, cliente)=>{
                
                if(err){
                    return res.status(500).json({
                        ok:false,
                        mensaje: 'No cliente no existe',
                        errors: err
                    });
                }

                var oldPath = UPLOADS_PATH + `${ tipo }/` + cliente.img;

                if( fs.existsSync(oldPath) ){

                    fs.unlink( oldPath, (err)=>{

                        if(err){
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior',
                                errors: err
                            });
                        }

                    });

                }

                cliente.img = nombreArchivo;

                cliente.save( (err, clienteActualizado)=>{

                    if(err){
                        return res.status(500).json({
                               ok: false,
                               mensaje: 'Error al actualizar cliente',
                               errors: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Cliente actualizado exitosamente',
                        cliente: clienteActualizado
                    });
                });

            });

        }

        if (coleccion === 'proyecto') {

            Proyecto.findById( id, (err, proyecto)=>{
                if(err){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El proyecto no existe',
                        errors: err
                    });
                }

                var oldPath= UPLOADS_PATH + `${ tipo }/` + proyecto.img;

                if(fs.existsSync(oldPath)){

                    fs.unlink( oldPath, (err)=>{
                        if(err){
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior',
                                errors: err
                            });
                        }
                        
                    });

                }

                proyecto.img = nombreArchivo;

                proyecto.save( (err, proyectoActualizaco)=>{

                    if(err){
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al guardar proyecto',
                            errors: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Proyecto actualizado correctamente',
                        proyecto: proyectoActualizaco
                    });

                });


            });

        }

        if (coleccion === 'producto') {

            Producto.findById(id, 'codigo nombre familia img precio', (err, producto)=>{

                if(err){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El producto no existe',
                        errors: err
                    });
                }

                var oldPath = UPLOADS_PATH + `${ tipo }/` + producto.img;

                if( fs.existsSync(oldPath) ){

                    fs.unlink( oldPath, (err)=>{
                        if(err){
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior',
                                errors: err
                            });
                        }
                    });

                }

                producto.img = nombreArchivo;

                producto.save( (err, productoActualizado)=>{

                    if(err){
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al guardar producto',
                            errors: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Producto actualizado exitosamente',
                        producto: productoActualizado
                    });
                });

            });

        }
    }




    

});

module.exports = app;