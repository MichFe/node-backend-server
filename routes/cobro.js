var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Cobro = require('../models/cobro');
var Venta = require('../models/venta');

//======================================================================
// Obtener cobros de 10 en 10
//======================================================================
app.get('/', mdAutenticacion.verificarToken, (req, res) => {
    var idVenta = req.params.idVenta;
    var desde = Number(req.query.desde);

    Cobro.find({})
        .sort("-fecha")
        .skip(desde)
        .limit(10)
        .populate('cliente', 'nombre')
        .exec((err, cobros) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar historial de pagos',
                    errors: err
                });
            }

            if (!cobros) {
                return res.status.json({
                    ok: false,
                    mensaje: 'No hay historial de pagos asociado a esa venta',
                    errors: { message: 'No hay historial de pagos para la venta id: ' + idVenta }
                });
            }

            Cobro.countDocuments()
                .exec((err,conteoCobros)=>{

                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar historial de pagos',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        mensaje: 'Consulta de historial de pagos exitosa',
                        pagos: cobros,
                        conteo: conteoCobros
                    });

                });

            

        });


});
//======================================================================
// FIN de Obtener cobros de 10 en 10
//======================================================================

//======================================================================
// Obtener historial de cobros por id de venta
//======================================================================
app.get('/:idVenta', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var idVenta = req.params.idVenta;

    Cobro.find({ venta: idVenta })
        .sort("-fecha")
        .exec( (err, cobrosVenta)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar historial de pagos',
                    errors: err
                });
            }

            if(!cobrosVenta){
                return res.status.json({
                    ok: false,
                    mensaje: 'No hay historial de pagos asociado a esa venta',
                    errors: { message: 'No hay historial de pagos para la venta id: ' + idVenta }
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de historial de pagos exitosa',
                pagos: cobrosVenta
            });

        });
   

});
//======================================================================
// FIN de Obtener historial de cobros por id de venta
//======================================================================

//======================================================================
// Registrar cobro
//======================================================================
app.post('/', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res)=>{
    var body = req.body;

    var pago = new Cobro({
        venta: body.venta,
        cliente: body.cliente,
        monto: body.monto,
        tipoDePago: body.tipoDePago,
        fecha: body.fecha
    });

    pago.save((err,cobroGuardado)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar pago',
                errors: err
            });
        }

        //Actualizamos pago en la venta
        Venta.findById(pago.venta)
            .exec((err,venta)=>{
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar venta',
                        errors: err
                    });
                }

                if(!venta){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe la venta a la cual se desea registrar el pago',
                        errors: { message: 'La venta no existe en la base de datos' }
                    });
                }

                //Propiedades a actualizar
                (venta.montoPagado + cobroGuardado.monto >= venta.total)?venta.montoPagado=venta.total:venta.montoPagado += cobroGuardado.monto;
                (venta.saldoPendiente<=cobroGuardado.monto)?venta.saldoPendiente=0:venta.saldoPendiente -= cobroGuardado.monto;
                (venta.saldoPendiente <= 0) ? venta.estatus ='Liquidada':venta.estatus='Saldo Pendiente';

                
                venta.save((err,ventaActualizada)=>{
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar venta',
                            errors: err
                        });
                    }

                    if (!ventaActualizada) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'No existe la venta a la cual se desea registrar el pago',
                            errors: { message: 'La venta no existe en la base de datos' }
                        });
                    }

                    res.status(201).json({
                        ok: true,
                        mensaje: 'Pago registrado exitosamente',
                        pago: cobroGuardado
                    });

                });

            });

        

    });

});
//======================================================================
// FIN de Registrar cobro
//======================================================================

//======================================================================
// Actualizar cobro por id
//======================================================================
app.put('/:pagoId', mdAutenticacion.verificarToken, (req,res)=>{
    var id = req.params.pagoId;
    var body = req.params.body;

    Cobro.findById(id)
        .exec((err, cobro)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar pago',
                    errors: err
                });
            }

            if(!cobro){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El pago id: ' + id + ', no existe en la base de datos',
                    errors: { message: 'El pago no existe en la base de datos' }
                });
            }

            //Valores a actualizar
            (body.venta != null) ? cobro.venta = body.venta : null;
            (body.cliente != null) ? cobro.cliente = body.cliente : null;
            (body.monto != null) ? cobro.monto = body.monto : null;
            (body.tipoDePago != null) ? cobro.tipoDePago = body.tipoDePago : null;
            (body.fecha != null) ? cobro.fecha = body.fecha : null;

            cobro.save((err,cobroActualizado)=>{
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
                    pago: cobroActualizado
                });
            });
        });
});
//======================================================================
// FIN de Actualizar cobro por id
//======================================================================

//======================================================================
// Eliminar cobro por id
//======================================================================
app.delete('/:cobroId', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req,res)=>{
    var id = req.params.cobroId;

    Cobro.findByIdAndDelete(id)
        .exec((err, cobroEliminado)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al eliminar pago',
                    errors: err
                });
            }

            if(!cobroEliminado){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un pago con el id especificado',
                    errors: { message: 'No existe un pago en la base de datos con el id especificado' }
                });
            }

            //Actualizamos pago en la venta
            Venta.findById(cobroEliminado.venta)
                .exec((err, venta) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al buscar venta',
                            errors: err
                        });
                    }

                    if (!venta) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'No existe la venta a la cual se desea eliminar el pago',
                            errors: { message: 'La venta no existe en la base de datos' }
                        });
                    }

            //Actualizando Totales en venta
            venta.montoPagado -= cobroEliminado.monto;
            venta.saldoPendiente+=cobroEliminado.monto;
            (venta.saldoPendiente <= 0) ? venta.estatus = 'Liquidada' : venta.estatus = 'Saldo Pendiente';


            venta.save((err, ventaActualizada) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar venta',
                        errors: err
                    });
                }

                if (!ventaActualizada) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No existe la venta a la cual se desea eliminar el pago',
                        errors: { message: 'La venta no existe en la base de datos' }
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Pago eliminado exitosamente',
                    pago: cobroEliminado
                });

            });

        });

            

    });
});
//======================================================================
// FIN de Eliminar pago por id
//======================================================================


module.exports = app;