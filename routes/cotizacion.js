var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

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
app.get('/cotizacionProyecto/:id', mdAutenticacion.verificarToken, (req, res)=>{
    var idProyecto = req.params.id;

    Cotizacion.find({ proyecto: id })
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
              productos: cotizacionesProyecto,
          });

      });
    

});
//======================================================================
// FIN de Obtener cotizacion por id de proyecto
//======================================================================

//======================================================================
// Crear cotizacion de un proyecto
//======================================================================
app.post('/', mdAutenticacion.verificarToken, (req, res)=>{
    var body = req.body;

    var cotizacion = new Cotizacion({
        proyecto: body.proyecto,
        cliente: body.cliente,
        fecha: body.fecha,
        carrito: body.carrito,
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
            usuario: cotizacionCreada
        });
    });
});
//======================================================================
// FIN de Crear cotizacion de un proyecto
//======================================================================

//======================================================================
// Actualizar cotizacion por id
//======================================================================
app.put('/:id', mdAutenticacion.verificarToken, (req,res)=>{
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

            if (!producto) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'No existe la cotizacion id: ' + id,
                    errors: { message: 'No existe una cotizacion que coincida con el id: ' + id + ', en la base de datos' }
                });
            }

            //Valores a actualizar
            ( body.fecha && body.fecha != '' ) ? cotizacion.fecha = body.fecha : null;
            ( body.carrito && body.carrito.length > 0 ) ? cotizacion.carrito = body.carrito : null;
            ( body.subtotal && body.subtotal != '' ) ? cotizacion.subtotal = body.subtotal : null;
            ( body.descuento && body.descuento != '' ) ? cotizacion.descuento = body.descuento : null;
            ( body.total && body.total != '' ) ? cotizacion.total = body.total : null;

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
app.delete('/:id', mdAutenticacion.verificarToken, (req, res)=>{
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

        res.status(200).json({
            ok: true,
            mensaje: "Cotización eliminada correctamente",
            usuario: cotizacionEliminada
        });
    });
});
//======================================================================
// FIN de Eliminar cotización por id
//======================================================================


module.exports = app;