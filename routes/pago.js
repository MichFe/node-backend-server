var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Pago = require('../models/pago');
var Compra = require('../models/compra');

//======================================================================
// Obtener historial de pagos por id de compra
//======================================================================
app.get('/:idCompra', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var idCompra = req.params.idCompra;

    Pago.find({ compra: idCompra })
        .exec((err, pagosCompra) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar historial de pagos',
                    errors: err
                });
            }

            if (!pagosCompra) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay historial de pagos asociado a esa compra',
                    errors: { message: 'No hay historial de pagos para la compra id: ' + idCompra }
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de historial de pagos exitosa',
                pagos: pagosCompra
            });

        });


});
//======================================================================
// FIN de Obtener historial de pagos por id de compra
//======================================================================

//======================================================================
// Registrar pago
//======================================================================
app.post('/', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var body = req.body;

    var pago = new Pago({
        compra: body.compra,
        proveedor: body.proveedor,
        monto: body.monto,
        tipoDePago: body.tipoDePago,
        fecha: body.fecha
    });

    pago.save((err, pagoGuardado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar pago',
                errors: err
            });
        }

        //Actualizamos pago en la compra
        Compra.findById(pago.compra)
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
                        mensaje: 'No existe la compra a la cual se desea registrar el pago',
                        errors: { message: 'La compra no existe en la base de datos' }
                    });
                }

                //Propiedades a actualizar
                (compra.montoPagado + pagoGuardado.monto >= compra.costoTotal) ? compra.montoPagado = compra.costoTotal : compra.montoPagado += pagoGuardado.monto;
                (compra.saldoPendiente <= pagoGuardado.monto) ? compra.saldoPendiente = 0 : compra.saldoPendiente -= pagoGuardado.monto;
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
                            mensaje: 'No existe la compra a la cual se desea registrar el pago',
                            errors: { message: 'La compra no existe en la base de datos' }
                        });
                    }

                    res.status(201).json({
                        ok: true,
                        mensaje: 'Pago registrado exitosamente',
                        pago: pagoGuardado
                    });

                });

            });



    });

});
//======================================================================
// FIN de Registrar pago
//======================================================================

//======================================================================
// Actualizar pago por id
//======================================================================
app.put('/:pagoId', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.pagoId;
    var body = req.params.body;

    Pago.findById(id)
        .exec((err, pago) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar pago',
                    errors: err
                });
            }

            if (!pago) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El pago id: ' + id + ', no existe en la base de datos',
                    errors: { message: 'El pago no existe en la base de datos' }
                });
            }

            //Valores a actualizar
            (body.compra != null) ? pago.compra = body.compra : null;
            (body.proveedor != null) ? pago.proveedor = body.proveedor : null;
            (body.monto != null) ? pago.monto = body.monto : null;
            (body.tipoDePago != null) ? pago.tipoDePago = body.tipoDePago : null;
            (body.fecha != null) ? pago.fecha = body.fecha : null;

            pago.save((err, pagoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar pago',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'El pago se actualizó correctamente',
                    pago: pagoActualizado
                });
            });
        });
});
//======================================================================
// FIN de Actualizar pago por id
//======================================================================

//======================================================================
// Eliminar pago por id
//======================================================================
app.delete('/:pagoId', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var id = req.params.pagoId;

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
                            mensaje: 'Pago eliminado exitosamente',
                            pago: pagoEliminado
                        });

                    });

                });



        });
});
//======================================================================
// FIN de Eliminar pago por id
//======================================================================


module.exports = app;