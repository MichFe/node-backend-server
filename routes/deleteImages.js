var express = require('express');
var UPLOADS_PATH = require("../config/config").UPLOADS_PATH;

var fs = require('fs');

//Importación de modelos
var Usuario = require('../models/usuario');
var Cliente = require("../models/cliente");
var Proyecto = require("../models/proyecto");
var Producto = require("../models/producto");
var Chat = require("../models/chat");
var Cotizacion = require("../models/cotizacion");

var app = express();

app.delete('/:tipo/:id',(req,res)=>{
    var tipo = req.params.tipo;
    var id = req.params.id;
    var indexCotizacion = Number(req.query.indexCotizacion);

    var coleccionesValidas = ['usuario', 'cliente', 'proyecto', 'producto', 'chat', 'cotizacion'];

    if (coleccionesValidas.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La petición no coincide con una colección valida',
            errors: { message: 'La petición debe coincidir con una colección válida: ' + coleccionesValidas.join(', ') }
        });
    }

    eliminarImagen(id, tipo, indexCotizacion);


function eliminarImagen(id, tipo, indexCotizacion=null){

    if(tipo==='cotizacion'){
        Cotizacion.findById(id, (err, cotizacion) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar la cotizacion',
                    errors: err
                });
            }

            if (!cotizacion) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe la cotización',
                    errors: { message: 'La cotización no existe en la base de datos' }
                })
            }

            //validamos si la imagen anterior era una imagen de cotizacion
            if (cotizacion.productos[indexCotizacion].img.includes('cotizacion')) {
                var oldPath = UPLOADS_PATH + `${tipo}/` + cotizacion.productos[indexCotizacion].img;

                //Validamos si existe una imagen anterior y la eliminamos
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar imagen anterior',
                                errors: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            mensaje: 'Imagen eliminada exitozamente',
                            imagen: cotizacion.productos[indexCotizacion].img
                        });
                    });
                }
            }      
        });
    }
}

});

module.exports = app;