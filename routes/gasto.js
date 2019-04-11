var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Gasto = require('../models/gasto');
var Pago = require('../models/pago');

//======================================================================
// Obtener gastos paginados de 10 en 10
//======================================================================
app.get('/', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var desde = Number(req.query.desde) || 0;

    Gasto.find({})
      .skip(desde)
      .limit(10)
      .populate("usuarioCreador", "nombre")
      .populate("proveedor", "nombre")
      .sort("-fecha")
      .exec((err, gastos) => {

        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error al buscar gastos",
            errors: err
          });
        }

        if (!gastos) {
          return res.status.json({
            ok: false,
            mensaje: "No hay gastos registrados",
            errors: { 
                message:
                    "No hay gastos registrados"
            }
          });
        }

        Gasto.countDocuments((err, conteoGastos)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al contar gastos",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: "Consulta de gastos exitosa",
                gastos: gastos,
                conteoGastos: conteoGastos
            });

        });

        
      });


});
//======================================================================
// FIN de Obtener historial de pagos por id de compra
//======================================================================

//======================================================================
// Registrar gasto
//======================================================================
app.post('/', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var body = req.body;
    var usuario = req.usuario;

    var gasto = new Gasto({
      usuarioCreador: usuario._id,
      fecha: body.fecha,
      monto: body.monto,
      descripcion: body.descripcion,
      categoria: body.categoria,
      proveedor: body.proveedor,
      pagoCompra: body.pagoCompra
    });

    gasto.save((err, gastoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar gasto',
                errors: err
            });
        }

        res.status(201).json({
          ok: true,
          mensjae: "Gasto guardado exitosamente",
          gasto: gastoGuardado
        });
    });
});
//======================================================================
// FIN de Registrar gasto
//======================================================================

//======================================================================
// Actualizar gasto por id
//======================================================================
app.put('/:gastoId', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var id = req.params.gastoId;
    var body = req.body;

    Gasto.findById(id)
        .exec((err, gasto) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar gasto',
                    errors: err
                });
            }

            if (!gasto) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El gasto id: ' + id + ', no existe en la base de datos',
                    errors: { message: 'El gasto no existe en la base de datos' }
                });
            }
                        
            //Valores a actualizar
            (body.fecha != null) ? gasto.fecha = body.fecha : null;
            (body.monto != null) ? gasto.monto = body.monto : null;
            (body.descripcion != null) ? gasto.descripcion = body.descripcion : null;
            (body.categoria != null) ? gasto.categoria = body.categoria : null;
            (body.proveedor != null) ? gasto.proveedor = body.proveedor : null;
            (body.pagoCompra != null) ? gasto.pagoCompra = body.pagoCompra : null;

            gasto.save((err, gastoActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar gasto',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'El gasto se actualizó correctamente',
                    pago: gastoActualizado
                });
            });
        });
});
//======================================================================
// FIN de Actualizar gasto por id
//======================================================================

//======================================================================
// Eliminar gasto por id
//======================================================================
app.delete('/:gastoId', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var id = req.params.gastoId;

    Gasto.findByIdAndDelete(id)
        .exec((err, gastoEliminado) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al eliminar gasto',
                    errors: err
                });
            }

            if (!gastoEliminado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un gasto con el id especificado',
                    errors: { message: 'No existe un gasto en la base de datos con el id especificado' }
                });
            }

            //Validamos si el gasto era el pago de una compra
            if(gastoEliminado.pagoCompra){
                // Si era el pago de una compra, debemos eliminar el pago y 
                // actualizar la compra
                Pago.findByIdAndDelete(id)
                    .exec((err, pagoEliminado) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar pago',
                                errors: err
                            });
                        }

                        if (!pagoEliminado) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'No existe un pago con el id especificado',
                                errors: { message: 'No existe un pago en la base de datos con el id especificado' }
                            });
                        }

                        //Actualizamos pago en la compra
                        Compra.findById(pagoEliminado.compra)
                            .exec((err, compra) => {
                                if (err) {
                                    return res.status(500).json({
                                        ok: false,
                                        mensaje: 'Error al buscar compra',
                                        errors: err
                                    });
                                }

                                if (!compra) {
                                    return res.status(400).json({
                                        ok: false,
                                        mensaje: 'No existe la compra a la cual se desea eliminar el pago',
                                        errors: { message: 'La compra no existe en la base de datos' }
                                    });
                                }

                                //Actualizando Totales en compra
                                compra.montoPagado -= pagoEliminado.monto;
                                compra.saldoPendiente += pagoEliminado.monto;
                                (compra.saldoPendiente <= 0) ? compra.estatusPago = 'Liquidada' : compra.estatusPago = 'Saldo Pendiente';


                                compra.save((err, compraActualizada) => {
                                    if (err) {
                                        return res.status(500).json({
                                            ok: false,
                                            mensaje: 'Error al actualizar compra',
                                            errors: err
                                        });
                                    }

                                    if (!compraActualizada) {
                                        return res.status(400).json({
                                            ok: false,
                                            mensaje: 'No existe la compra a la cual se desea eliminar el pago',
                                            errors: { message: 'La compra no existe en la base de datos' }
                                        });
                                    }

                                    res.status(200).json({
                                        ok: true,
                                        mensaje: 'Gasto eliminado exitosamente y compra actualizada',
                                        gasto: gastoEliminado
                                    });

                                });

                            });



                    });

            }else{

                res.status(200).json({
                    ok: true,
                    mensaje: 'Gasto eliminado exitosamente',
                    gasto: gastoEliminado
                });
            }
        });
});
//======================================================================
// FIN de Eliminar gasto por id
//======================================================================


module.exports = app;