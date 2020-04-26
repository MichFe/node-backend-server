var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Gasto = require('../models/gasto');
var Pago = require('../models/pago');
var Compra = require('../models/compra');



//======================================================
// Obtener total de gastos operativos anuales
//======================================================
app.get('/gastosOperativosAnuales/:year', mdAutenticacion.verificarToken, (req,res)=>{
    var year = Number(req.params.year);
    var fechaInicial = new Date(year, 0, 1, 0, 0, 0, 0);
    var fechaFinal = new Date(year, 11, 31, 0, 0, 0, 0);
    var totalGastoOperativo;

    Gasto.aggregate([
      {
        $match: {
          fecha: { $gte: fechaInicial, $lte: fechaFinal },
          gastoOperativo: { $eq: true }
        }
      },
      {
        $group: {
            _id: null,
            totalGastoOperativo: { $sum: '$monto'}
        }
      }      
    ], (err, totales)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al sumar gastos operativos del año: ' + year,
                    errors: err
                });
            }

            ( totales[0] )? totalGastoOperativo = totales[0]: totalGastoOperativo = 0;
            

            res.status(200).json({
              ok: true,
              mensaje: "Consulta del total de gasto operativo exitosa",
              totalGastoOperativo: totalGastoOperativo.totalGastoOperativo,
            });
    });
});
//======================================================
// FIN de Obtener total de gastos operativos anuales
//======================================================

//======================================================
// Obtener total de gastos mensuales en un año
//======================================================
app.get('/gastosMensuales/:year', mdAutenticacion.verificarToken,  (req, res) => {
    var year = Number(req.params.year);
    var fechaInicial = new Date(year, 0, 1, 0, 0, 0, 0);
    var fechaFinal = new Date(year, 11, 31, 0, 0, 0, 0);

    var categoria = req.query.categoria;
    var query = {};

    if (categoria.length > 1) {

        query = {
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            },
            'categoria': categoria
        };

    } else {

        query = {
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            }
        }
    }

    Gasto.find(query)
        .sort('fecha')
        .exec((err, gastosYear) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar gastos del año: ' + year,
                    errors: err
                });
            }

            if (!gastosYear) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay gastos registrados en el año: ' + year,
                    errors: { message: 'No hay gastos registrados en el año de busqueda seleccionado' }
                });
            }

            var gastosMensuales = calcularGastosMensuales(gastosYear);

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de gastos realizada exitosamente',
                gastosMensuales: gastosMensuales,
            });




        });

});
//======================================================
// FIN Obtener total de gastos por mes, de un año
//======================================================

//======================================================
// Obtener total diario de gastos en un mes
//======================================================
app.get('/gastosDiarios/:year/:mes', mdAutenticacion.verificarToken,  (req, res) => {
    var mes = Number(req.params.mes);
    var year = Number(req.params.year);
    var fechaInicial = new Date(year, mes, 1);
    var fechaFinal = new Date(year, mes + 1, 0);

    var categoria = req.query.categoria;
    var query = {};

    if (categoria.length > 1) {
        query = {
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            },
            categoria: categoria
        };
    } else {
        query = {
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            }
        };
    }

    Gasto.find(query)
        .sort('fecha')
        .exec((err, gastosMes) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar gastos del mes: ' + mes,
                    errors: err
                });
            }

            if (!gastosMes) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay gastos registrados en el mes: ' + mes,
                    errors: { message: 'No hay gastos registrados en el mes de busqueda seleccionado' }
                });
            }

            var dias = fechaFinal.getDate();

            var gastosDiarios = calcularGastosDiarios(gastosMes, dias);

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de gastos realizada exitosamente',
                gastosDiarios: gastosDiarios,
            });



        });



});
//======================================================
// FIN de Obtener total diario de gastos en un mes
//======================================================

//====================================================================
// Obtener total de ventas pagadas y total de saldo pendiente por año
//====================================================================
app.get('/saldoPendiente/:year', mdAutenticacion.verificarToken, (req, res) => {
    var year = Number(req.params.year);
    var fechaInicial = new Date(year, 0, 1, 0, 0, 0, 0);
    var fechaFinal = new Date(year, 11, 31, 0, 0, 0, 0);
    var totalSaldoPendiente;
    var totalMontoPagado;
    var categoria = req.query.categoria;

    if (categoria.length > 1) {

        Compra.aggregate([
            {
                $match: {
                    fechaCompra: { $gte: fechaInicial, $lte: fechaFinal }
                }
            },
            {
                $match: {
                    tipoDeProveedor: { $eq: categoria }
                }
            },
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

                if (!totales[0]) {
                    totalSaldoPendiente = 0;
                    totalMontoPagado = 0;
                } else {
                    totalSaldoPendiente = totales[0].totalSaldoPendiente;
                    totalMontoPagado = totales[0].totalMontoPagado;
                }


                res.status(200).json({
                    ok: true,
                    mensaje: 'Consulta de totales realizada exitosamente',
                    totalSaldoPendiente: totalSaldoPendiente,
                    totalMontoPagado: totalMontoPagado
                });
            });

    } else {
        Compra.aggregate([
            {
                $match: {
                    fechaCompra: { $gte: fechaInicial, $lte: fechaFinal }
                }
            },
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
    }



});
//===========================================================================
// FIN de Obtener total de ventas pagadas y total de saldo pendiente por año
//===========================================================================

//====================================================================================
// Obtener gastos paginadas de 10 en 10 para la tabla del reporte de gastos
//====================================================================================
app.get('/tablaGastos', mdAutenticacion.verificarToken, (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var categoria = req.query.categoria;
    var year = Number(req.query.year);
    var mes = Number(req.query.mes);
    var fechaInicial = new Date(year, mes, 1, 0, 0, 0, 0);
    var fechaFinal = new Date(year, mes, 31, 0, 0, 0, 0);
    var query = {};

    if (categoria.length > 1) {
        query = {
            'categoria': categoria,
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            },
        };
    } else {
        query = {
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            },
        }
    }


    Gasto.find(query)
      .skip(desde)
      .limit(10)
      .populate("usuarioCreador", "nombre email")
      .populate("proveedor", "id nombre")
      .sort("-fecha")
      .exec((err, gastos) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error cargando gastos",
            errors: err
          });
        }

        Gasto.count(query, (err, conteoGastos) => {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: "Error al contar gastos",
              errors: err
            });
          }

          res.status(200).json({
            ok: true,
            mensaje: "Consulta de gastos realizada exitosamente",
            gastos: gastos,
            totalGastos: conteoGastos
          });
        });
      });
});
//====================================================================================
// FIN de Obtener gastos paginadas de 10 en 10 para la tabla del reporte de gastos
//====================================================================================

//=============================================================
// Obtener gastos registrados por un usuario
//=============================================================
app.get('/gastosPorUsuario/:idUsuario', mdAutenticacion.verificarToken, (req,res)=>{
    let idUsuario = req.params.idUsuario;
    let query = {
      usuarioCreador: idUsuario
    };

    Gasto.find(query)
        .sort('-fecha')
        .populate("usuarioCreador", "nombre")
        .populate("proveedor", "nombre")
        .exec((err,gastos)=>{

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

        res.status(200).json({
                ok: true,
                mensaje: "Consulta de gastos exitosa",
                gastosUsuario: gastos,
            });
        });
});
//=============================================================
// Fin de Obtener gastos registrados por un usuario
//=============================================================

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
      pagoCompra: body.pagoCompra,
      pagoNomina: body.pagoNomina,
    gastoOperativo: body.gastoOperativo
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
            (body.pagoNomina != null) ? gasto.pagoNomina = body.pagoNomina : null;
            (body.gastoOperativo != null) ? gasto.gastoOperativo = body.gastoOperativo : null;

            //Condicional para eliminar proveedor desde edición de gasto
            (body.proveedor == 'ninguno') ? gasto.proveedor = null : null;

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
                Pago.findByIdAndDelete(gastoEliminado.pagoCompra)
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


//==================================================
// Funciones
//==================================================
function calcularGastosMensuales(gastos) {
    var gastosMensuales = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    gastos.forEach(gasto => {
        var mes = gasto.fecha.getMonth();
        var totalGasto = gasto.monto;

        gastosMensuales[mes] += totalGasto;

    });

    return gastosMensuales;
}

function calcularGastosDiarios(gastos, numDias) {
    var gastosDiarios = [];
    var dias = numDias;

    for (i = 0; i <= dias; i++) {
        gastosDiarios.push(0);
    }

    gastos.forEach(gasto => {
        var dia = gasto.fecha.getDate();
        var totalGasto = gasto.monto;

        gastosDiarios[dia] += totalGasto;
    });

    return gastosDiarios;
}
//==================================================
// FIN de Funciones
//==================================================

module.exports = app;