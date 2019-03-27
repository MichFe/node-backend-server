var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Compra = require('../models/compra');
var Proveedor = require('../models/proveedor');
var Pago = require('../models/pago');
var Requisicion = require('../models/requisicion');

//========================================================================================
// Obtener total de compras pagadas y total de saldo pendiente de todos los tiempos
//========================================================================================
app.get('/saldoPendiente/todosLosTiempos', mdAutenticacion.verificarToken, (req, res) => {
    var totalSaldoPendiente;
    var totalMontoPagado;

    Compra.aggregate([
        // {
        //     $match: {
        //         fecha: { $gte: fechaInicial, $lte: fechaFinal }
        //     }
        // },
        {
            $group: {
                _id: null,
                totalMontoPagado: { $sum: '$montoPagado' },
                totalSaldoPendiente: { $sum: '$saldoPendiente' }
            }
        }], (err, totales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al sumar saldoPendiente y montoPagado',
                    errors: err
                });
            }

            if (totales[0]) {
                totalSaldoPendiente = totales[0].totalSaldoPendiente;
                totalMontoPagado = totales[0].totalMontoPagado;
            } else {
                totalSaldoPendiente = 0;
                totalMontoPagado = 0;
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de totales realizada exitosamente',
                totalSaldoPendiente: totalSaldoPendiente,
                totalMontoPagado: totalMontoPagado
            });
        });

});
//========================================================================================
// FIN de Obtener total de compras pagadas y total de saldo pendiente de todos los tiempos
//========================================================================================

//==========================================================
// Obtener lista de proveedores con saldo pendiente
//==========================================================
app.get('/proveedoresConSaldo', mdAutenticacion.verificarToken, (req, res) => {
    Compra.aggregate([
        { $match: { saldoPendiente: { $gt: 0 } } },
        {
            $group: {
                _id: { proveedor: '$proveedor' },
                proveedor: { $max: '$proveedor' },
                saldoPendiente: { $sum: '$saldoPendiente' },
                fechaMasAntigua: { $min: '$fechaCompra' }
            }
        },
        { $sort: { fechaMasAntigua: 1 } }
    ], (err, proveedoresConSaldo) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar proveedores con saldo pendiente',
                errors: err
            });
        }

        Proveedor.populate(proveedoresConSaldo, { path: 'proveedor', select: '_id nombre' }, (err, proveedoresConSaldoPopulated) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al popular campo proveedores',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de proveedores con saldo pendiente exitosa',
                proveedores: proveedoresConSaldoPopulated
            });

        });


    });
});
//==========================================================
// FIN de Obtener lista de proveedores con saldo pendiente
//==========================================================


//===========================================================
// Obtener compras con saldo pendiente de un proveedor
//===========================================================
app.get('/comprasConSaldo/:proveedorId', mdAutenticacion.verificarToken, (req, res) => {
    var proveedorId = req.params.proveedorId;

    Compra.find({ 'proveedor': proveedorId, 'saldoPendiente': { $gt: 0 } })
        .populate('usuarioCreador', 'nombre')
        .populate('proveedor', 'nombre')
        .populate('requisicion', 'descripcion')
        .exec(
            (err, comprasConSaldoPendiente) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar compras con saldo pendiente del proveedor id: ' + proveedorId,
                        errors: err
                    });
                }

                if (!comprasConSaldoPendiente) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'No hay compras con saldo pendiente del proveedor id: ' + proveedorId,
                        errors: { message: 'No hay compras con saldo pendiente asociadas al proveedor id: ' + proveedorId }
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Consulta de compras con saldo pendiente exitosa',
                    comprasConSaldo: comprasConSaldoPendiente
                });
            });

});
//===========================================================
// Obtener compras con saldo pendiente de un proveedor
//===========================================================

//===============================================
// Obtener compra por id de requisición
//===============================================
app.get('/buscarPorRequisicion/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id = req.params.id;
    var query = {
        requisicion: id
    }; 

    Compra.find(query)
        .exec((err, compras)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar compras',
                    errors: err
                });
            }

            if (!compras) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay compras registradas',
                    errors: { message: 'No existen compras registradas en la base de datos' }
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de compras exitosa',
                compras: compras
            });

        });
});
//===============================================
// FIN de Obtener compra por id de requisición
//===============================================

//===============================================
// Obtener compras de 10 en 10
//===============================================
app.get('/', mdAutenticacion.verificarToken, (req, res) => {
    var desde = Number(req.query.desde) || 0;
    var soloPedidos = (req.query.soloPedidos=='true') ? true :false;
    var query = {};

    if(soloPedidos){
        query = {
            estatusPedido: "Pedido"
        };
    }

    Compra.find(query)
        .skip(desde)
        .limit(10)
        .sort("fechaCompra")
        .populate("proveedor", "nombre")
        .populate("requisicion", "descripcion cantidad solicitante")
        .populate({
            path: "requisicion",
            select: "descripcion cantidad solicitante",
            populate: {
                path: 'solicitante',
                select: "nombre"
            }
        })
        .exec((err, compras) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar compras',
                    errors: err
                });
            }

            if (!compras) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay compras registradas',
                    errors: { message: 'No existen compras registradas en la base de datos' }
                });
            }
            
            Compra.countDocuments(query,(err, comprasCount) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al contar compras',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Consulta de compras exitosa',
                    compras: compras,
                    totalCompras: comprasCount
                });

            });



        });

});
//===============================================
// FIN de Obtener compras de 10 en 10
//===============================================

//===============================================
// Crear una nueva compra 
//===============================================
app.post('/', mdAutenticacion.verificarToken, (req, res) => {
    var body = req.body;

    var compra = new Compra({

        requisicion: body.requisicion,
        fechaCompra: body.fechaCompra,
        fechaCompromisoEntrega: body.fechaCompromisoEntrega,
        fechaReciboMercancia: body.fechaReciboMercancia,
        proveedor: body.proveedor,
        costoTotal: body.costoTotal,
        montoPagado: body.montoPagado,
        saldoPendiente: body.saldoPendiente,
        estatus: body.estatus,
        comentarioCompras: body.comentarioCompras,
        usuarioCreador: body.usuarioCreador

    });

    compra.save((err, compraGuardada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar compra',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Compra guardada exitosamente',
            compra: compraGuardada
        });
    });
});
//===============================================
// FIN de Crear una nueva compra 
//===============================================

//===============================================
// Actualizar compra por Id 
//===============================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Compra.findById(id, (err, compra) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar compra",
                errors: err
            });
        }

        if (!compra) {
            return res.status(400).json({
                ok: false,
                mensaje: "No existe la compra id: " + id,
                errors: { message: 'No existe una compra que coincida con el id: ' + id + ', en la base de datos' }
            });
        }

        //Propiedades a actualizar
        (body.requisicion) ? compra.requisicion = body.requisicion : null;
        (body.fechaCompra) ? compra.fechaCompra = body.fechaCompra : null;
        (body.fechaCompromisoEntrega) ? compra.fechaCompromisoEntrega = body.fechaCompromisoEntrega : null;
        (body.fechaReciboMercancia) ? compra.fechaReciboMercancia = body.fechaReciboMercancia : null;
        (body.proveedor) ? compra.proveedor = body.proveedor : null;
        (body.costoTotal) ? compra.costoTotal = body.costoTotal : null;
        (body.montoPagado) ? compra.montoPagado = body.montoPagado : null;
        (body.saldoPendiente) ? compra.saldoPendiente = body.saldoPendiente : null;
        (body.estatusPago) ? compra.estatusPago = body.estatusPago : null;
        (body.comentarioCompras) ? compra.comentarioCompras = body.comentarioCompras : null;
        (body.usuarioCreador) ? compra.usuarioCreador = body.usuarioCreador : null;
        (body.estatusPedido) ? compra.estatusPedido = body.estatusPedido : null;

        compra.save((err, compraActualizada) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al actualizar compra",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: "El compra se actualizó exitosamente",
                compra: compraActualizada
            });
        });
    });
});
//===============================================
// FIN de Actualizar compra por Id 
//===============================================

//===============================================
// Eliminar compra por Id 
//===============================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;

    Compra.findByIdAndDelete(id, (err, compraEliminada) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al eliminar compra",
                errors: err
            });
        }

        if (!compraEliminada) {
            return res.status(400).json({
                ok: false,
                mensaje: 'La compra id: ' + id + ', no existe',
                errors: { message: 'La compra que se desea eliminar no existe en la base de datos' }
            });
        }

        //Agregamos metodo para eliminar pagos de la compra
        Pago.deleteMany({ compra: compraEliminada._id })
            .exec((err,pagosEliminados)=>{

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al eliminar pagos de esta compra',
                        errors: err
                    });
                }

                //Agregamos metodo para eliminar requisicion de la compra
                Requisicion.deleteMany({ _id: compraEliminada.requisicion })
                    .exec((err, requisicionesEliminadas)=>{

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar requisición de esta compra',
                                errors: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            mensaje: "Compra eliminada exitosamente",
                            compra: compraEliminada
                        });
                    });
            });
    });
});
//===============================================
// FIN de Eliminar compra por Id 
//===============================================

module.exports = app;