var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var UPLOADS_PATH = require("../config/config").UPLOADS_PATH;
var fs = require('fs');

var app = express();

var Cotizacion = require('../models/cotizacion');

//======================================================================
// Obtener cotizaciones paginadas y conteo de cotizaciones
//======================================================================
app.get('/', mdAutenticacion.verificarToken, (req,res)=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Cotizacion.find({})
        .skip(desde)
        .limit(10)
        .populate('proyecto', '_id nombre')
        .populate('cliente', '_id nombre')
        .exec((err,cotizaciones)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar cotizaciones',
                    errors: err
                });
            }

            Cotizacion.countDocuments({}, (err, conteoCotizaciones)=>{

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al contar cotizaciones',
                        errors: err
                    });
                }  
                
                res.status(200).json({
                    ok: true,
                    mensaje: 'Consulta de cotizaciones realizada exitosamente',
                    clientes: cotizaciones,
                    totalClientes: conteoCotizaciones
                });
            });
        });

});
//======================================================================
// FIN de Obtener cotizaciones paginadas y conteo de cotizaciones
//======================================================================

//======================================================================
// Obtener cotizacion por id de proyecto
//======================================================================
app.get('/cotizacionProyecto/:id', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res)=>{
    var idProyecto = req.params.id;

    Cotizacion.find({ proyecto: idProyecto })
      .populate("proyecto", "_id nombre")
      .populate("cliente", "_id nombre")
      .exec((err,cotizacionesProyecto)=>{

          if (err) {
              return res.status(500).json({
                  ok: false,
                  mensaje: 'Error al buscar cotizaciones',
                  errors: err
              });
          }

          if (!cotizacionesProyecto) {
              return res.status(400).json({
                  ok: false,
                  mensaje: 'No hay cotizaciones asociadas al proyecto: ' + id,
                  errors: { message: 'No hay cotizaciones asociadas al proyecto especificado' }
              });
          }

          res.status(200).json({
              ok: true,
              mensaje: 'Consulta de cotizaciones realizada correctamente',
              cotizacion: cotizacionesProyecto,
          });

      });
    

});
//======================================================================
// FIN de Obtener cotizacion por id de proyecto
//======================================================================

//======================================================================
// Crear cotizacion de un proyecto
//======================================================================
app.post('/', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos,(req, res)=>{
    var body = req.body;

    var cotizacion = new Cotizacion({
        proyecto: body.proyecto,
        cliente: body.cliente,
        fecha: body.fecha,
        productos: body.productos,
        subtotal: body.subtotal,
        descuento: body.descuento,
        total: body.total
    });

    cotizacion.save( (err, cotizacionCreada)=>{

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al crear cotización',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Cotización creada correctamente',
            cotizacion: cotizacionCreada
        });
    });
});
//======================================================================
// FIN de Crear cotizacion de un proyecto
//======================================================================

//======================================================================
// Actualizar cotizacion por id
//======================================================================
app.put('/:id', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req,res)=>{
    var id = req.params.id;
    var body = req.body;

    Cotizacion.findById(id)
        .exec((err,cotizacion)=>{

            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar cotizacion',
                    errors: err
                });
            }

            if (!cotizacion) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'No existe la cotizacion id: ' + id,
                    errors: { message: 'No existe una cotizacion que coincida con el id: ' + id + ', en la base de datos' }
                });
            }

            //Valores a actualizar
            ( body.fecha != null ) ? cotizacion.fecha = body.fecha : null;
            ( body.productos != null ) ? cotizacion.productos = body.productos : null;
            ( body.subtotal != null ) ? cotizacion.subtotal = body.subtotal : null;
            ( body.descuento != null ) ? cotizacion.descuento = body.descuento : null;
            ( body.total != null ) ? cotizacion.total = body.total : null;

            cotizacion.save( (err, cotizacionactualizada)=>{

                if (err) {
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar cotizacion',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Cotización actualizada exitosamente',
                    cotizacion: cotizacionactualizada
                });
            });
        });
});
//======================================================================
// FIN de Actualizar cotizacion por id
//======================================================================

//======================================================================
// Eliminar cotización por id
//======================================================================
app.delete('/:id', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res)=>{
    var id = req.params.id;

    Cotizacion.findByIdAndDelete(id, (err, cotizacionEliminada)=>{
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al eliminar cotización",
                errors: err
            });
        }

        if (!cotizacionEliminada) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe una cotización con ese Id",
                errors: { message: "No existe una cotización con el id especificado" }
            });
        }

        //Eliminamos todas las imagenes custom, asociadas a esa cotizacion
        var productos=cotizacionEliminada.productos;

        productos.forEach(producto => {
            if(producto.img.includes('cotizacion')){
                var oldPath = UPLOADS_PATH + `cotizacion/` + producto.img;

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
                    });
                }
            }
        });


        res.status(200).json({
            ok: true,
            mensaje: "Cotización eliminada correctamente",
            cotizacion: cotizacionEliminada
        });
    });
});
//======================================================================
// FIN de Eliminar cotización por id
//======================================================================


module.exports = app;