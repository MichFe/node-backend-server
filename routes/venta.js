var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Venta = require('../models/venta');

//======================================================
// Obtener ventas paginadas de 10 en 10
//======================================================
app.get('/', mdAutenticacion.verificarToken, (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Venta.find({})
      .skip(desde)
      .limit(10)
      .populate("vendedor", "nombre email")
      .populate("cliente", "id nombre")
      .populate("proyecto", "id nombre")
      .sort("-fecha")
      .exec((err, ventas) => {
        if (err) {
          return res
            .status(500)
            .json({
              ok: false,
              mensaje: "Error cargando ventas",
              errors: err
            });
        }

        Venta.count({}, (err, conteoVentas) => {
          if (err) {
            return res
              .status(500)
              .json({
                ok: false,
                mensaje: "Error al contar ventas",
                errors: err
              });
          }

          res
            .status(200)
            .json({
              ok: true,
              mensaje: "Consulta de ventas realizada exitosamente",
              ventas: ventas,
              totalVentas: conteoVentas
            });
        });
      });
});
//======================================================
// Obtener ventas paginadas de 10 en 10
//======================================================

//==================================
// Crear venta
//==================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    // var body = req.body;

    var venta = new Venta({
      subtotal: req.body.subtotal,
      iva: req.body.iva,
      total: req.body.total,
      vendedor: req.usuario._id,
      fecha: req.body.fecha,
      carrito: req.body.carrito,
      tipoDePago: req.body.tipoDePago,
      cliente: req.body.cliente,
      montoPagado: req.body.montoPagado,
      saldoPendiente: req.body.saldoPendiente,
      estatus: req.body.estatus,
      proyecto: req.body.proyecto,
      unidadDeNegocio: req.body.unidadDeNegocio

    });

    venta.save((err, ventaGuardada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar venta',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensjae: 'Venta guardada exitosamente',
            venta: ventaGuardada
        });
    });

});
//==================================
// FIN de Crear venta
//==================================

//==================================
// Actualizar un venta
//==================================
// app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
//     var id = req.params.id;
//     var body = req.body;

//     Venta.findById(id)
//         .exec((err, venta) => {
//             if (err) {
//                 return res
//                     .status(500)
//                     .json({
//                         ok: false,
//                         mensaje: "Error al buscar venta",
//                         errors: err
//                     });
//             }

//             if (!venta) {
//                 return res
//                     .status(400)
//                     .json({
//                         ok: false,
//                         mensaje: "La venta con el id: " + id + ", no existe",
//                         errors: { message: "No existe un venta con ese ID" }
//                     });
//             }

//             venta.estatus = body.estatus;
//             venta.nombre = body.nombre;
//             venta.telefono = body.telefono;
//             venta.direccion = body.direccion;
//             venta.email = body.email;
//             venta.img = body.img;
//             venta.usuarioUltimaModificacion = req.usuario._id;

//             venta.save((err, clienteActualizado) => {
//                 if (err) {
//                     return res
//                         .status(400)
//                         .json({
//                             ok: false,
//                             mensaje: "Error al actualizar venta",
//                             errors: err
//                         });
//                 }

//                 res
//                     .status(200)
//                     .json({
//                         ok: true,
//                         mensaje: "Venta actualizado exitosamente",
//                         venta: clienteActualizado
//                     });
//             });
//         });
// });
//==================================
// FIN de Actualizar un venta
//==================================

//==================================
// Eliminar venta
//==================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    Venta.findByIdAndDelete(id, (err, ventaEliminada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar venta',
                errors: err
            });
        }

        if (!ventaEliminada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un venta con ese ID',
                errors: { message: 'No existe un venta con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Venta eliminada exitosamente',
            venta: ventaEliminada
        });
    });
});
//==================================
// FIN de Eliminar venta
//==================================


module.exports = app;