var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Venta = require('../models/venta');
var Cliente = require('../models/cliente');
var Cobro = require('../models/cobro');

//======================================================
// Obtener ventas paginadas de 10 en 10
//======================================================
app.get('/tablaVentas', mdAutenticacion.verificarToken, (req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var unidadDeNegocio = req.query.unidadDeNegocio;
    var year = Number(req.query.year);
    var fechaInicial = new Date(year, 0, 1, 0, 0, 0, 0);
    var fechaFinal = new Date(year, 11, 31, 0, 0, 0, 0);
    var query={};

    if(unidadDeNegocio.length>1){
        query={
            unidadDeNegocio: unidadDeNegocio,
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            },
        };
    }else{
        query={
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            },
        }
    }
     

    Venta.find(query)
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

        Venta.count(query, (err, conteoVentas) => {
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
// FIN Obtener ventas paginadas de 10 en 10
//======================================================

//========================================================================================
// Obtener total de ventas pagadas y total de saldo pendiente de todos los tiempos
//========================================================================================
app.get('/saldoPendiente/todosLosTiempos', mdAutenticacion.verificarToken, (req,res)=>{
    var totalSaldoPendiente;
    var totalMontoPagado;

    Venta.aggregate([
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
// FIN de Obtener total de ventas pagadas y total de saldo pendiente de todos los tiempos
//========================================================================================

//====================================================================
// Obtener total de ventas pagadas y total de saldo pendiente por año
//====================================================================
app.get('/saldoPendiente/:year', mdAutenticacion.verificarToken,( req, res )=>{
    var year=Number(req.params.year);
    var fechaInicial = new Date(year, 0, 1, 0, 0, 0, 0);
    var fechaFinal = new Date(year, 11, 31, 0, 0, 0, 0);
    var totalSaldoPendiente;
    var totalMontoPagado;
    var unidadDeNegocio = req.query.unidadDeNegocio;

    if(unidadDeNegocio.length>1){

        Venta.aggregate([
            { $match: { 
            fecha: { $gte: fechaInicial, $lte: fechaFinal}
             }},
            {
                $match: {
                   unidadDeNegocio: { $eq: unidadDeNegocio}
                }},
                {$group: {
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

                if(!totales[0]){
                    totalSaldoPendiente=0;
                    totalMontoPagado=0;
                }else{
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

    }else{
        Venta.aggregate([
            { $match: { 
            fecha: { $gte: fechaInicial, $lte: fechaFinal}
             }},
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

                if(totales[0]){
                    totalSaldoPendiente = totales[0].totalSaldoPendiente;
                    totalMontoPagado = totales[0].totalMontoPagado;
                }else{
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
// FIN deObtener total de ventas pagadas y total de saldo pendiente por año
//===========================================================================

//======================================================
// Obtener total de ventas mensuales en un año
//======================================================
app.get('/ventasMensuales/:year', mdAutenticacion.verificarToken, (req, res)=>{
    var year=Number(req.params.year);
    var fechaInicial = new Date(year, 0, 1, 0, 0, 0, 0);
    var fechaFinal = new Date( year, 11, 31, 0, 0 ,0 , 0 );
    
    var unidadDeNegocio = req.query.unidadDeNegocio;
    var query = {};

    if (unidadDeNegocio.length > 1) {

        query = {
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            },
            'unidadDeNegocio': unidadDeNegocio
        };

    }else{

        query={
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            }
        }
    }

    Venta.find(query)
    .sort('fecha')
    .exec( (err,ventasYear)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar ventas del año: ' + year,
                errors: err
            });
        }

        if(!ventasYear){
            return res.status(400).json({
                ok: false,
                mensaje: 'No hay ventas registradas en el año: ' + year,
                errors: {message: 'No hay ventas registradas en el año de busqueda seleccionado'}
            });
        }

        var ventasMensuales = calcularVentasMensuales(ventasYear);

        res.status(200).json({
            ok: true,
            mensaje: 'Consulta de ventas realizada exitosamente',
            ventasMensuales: ventasMensuales,
        });



        
    })

});
//======================================================
// FIN Obtener total de ventas por mes, de un año
//======================================================

//======================================================
// Obtener ventas de un mes
//======================================================
app.get('/ventasDiarias/:year/:mes', mdAutenticacion.verificarToken, (req ,res)=>{
    var mes=Number(req.params.mes);
    var year=Number(req.params.year);
    var fechaInicial = new Date(year, mes, 1);
    var fechaFinal = new Date(year, mes + 1, 0 );

    var unidadDeNegocio=req.query.unidadDeNegocio;
    var query={};

    if(unidadDeNegocio.length>1){
        query={
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            },
            unidadDeNegocio: unidadDeNegocio
        };
    }else{
        query={
            'fecha': {
                $gte: fechaInicial,
                $lte: fechaFinal
            }
        };
    }
    
    Venta.find(query)
    .sort('fecha')
    .exec( (err, ventasMes)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar ventas del mes: ' + mes,
                errors: err
            });
        }

        if (!ventasMes) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No hay ventas registradas en el mes: ' + mes,
                errors: { message: 'No hay ventas registradas en el mes de busqueda seleccionado' }
            });
        }

        var dias= fechaFinal.getDate();
        
        var ventasDiarias = calcularVentasDiarias(ventasMes, dias);

        res.status(200).json({
            ok: true,
            mensaje: 'Consulta de ventas realizada exitosamente',
            ventasDiarias: ventasDiarias,
        });



    });



});
//======================================================
// FIN de Obtener ventas de un mes
//======================================================

//=========================================================
// Obtener ventas de un cliente con saldo pendiente
//=========================================================
app.get('/ventasConSaldo/:clienteId', mdAutenticacion.verificarToken, ( req, res )=>{
    var clienteId = req.params.clienteId;

    Venta.find({ 'cliente': clienteId, 'saldoPendiente': {$gt: 0 }})
        .populate( 'vendedor', 'nombre' )
        .populate( 'cliente', 'nombre' )
        .exec(
        (err, ventasConSaldoPendiente) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar ventas con saldo pendiente del cliente id: ' + clienteId,
                    errors: err
                });
            }

            if (!ventasConSaldoPendiente) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay ventas con saldo pendiente del cliente id: ' + clienteId,
                    errors: { message: 'No hay ventas con saldo pendiente asociadas al cliente id: ' + clienteId }
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de ventas con saldo pendiente exitosa',
                ventasConSaldo: ventasConSaldoPendiente
            });
        });
    
});
//=========================================================
// FIN de Obtener ventas de un cliente con saldo pendiente
//=========================================================

//=========================================================
// Obtener lista de clientes con saldo pendiente
//=========================================================
app.get('/clientesConSaldo', mdAutenticacion.verificarToken, ( req, res )=>{
    Venta.aggregate([
        { $match: { saldoPendiente: {$gt: 0}}},
        { $group:{
            _id: { cliente: '$cliente'},
            cliente: { $max: '$cliente'},
            saldoPendiente: { $sum: '$saldoPendiente' },
            fechaMasAntigua: { $min: '$fecha' }
        }},
        { $sort: { fechaMasAntigua: 1 }}
    ], (err, clientesConSaldo)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar clientes con saldo pendiente',
                errors: err
            });
        }

        Cliente.populate(clientesConSaldo, { path:'cliente', select:'_id nombre img'}, (err, clientesConSaldoPopulated)=>{
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al popular campo clientes',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de clientes con saldo pendiente exitosa',
                clientes: clientesConSaldoPopulated
            });

        });

        
    });
});
//=========================================================
// FIN de Obtener lista de clientes con saldo pendiente
//=========================================================

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
            mensajae: 'Venta guardada exitosamente',
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
app.put('/:id', mdAutenticacion.verificarToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    var devolucion = req.query.devolucion;
    var devolucion=Number(devolucion);     

    Venta.findById(id)
        .exec((err, venta) => {
            if (err) {
                return res
                    .status(500)
                    .json({
                        ok: false,
                        mensaje: "Error al buscar venta",
                        errors: err
                    });
            }

            if (!venta) {
                return res
                    .status(400)
                    .json({
                        ok: false,
                        mensaje: "La venta con el id: " + id + ", no existe",
                        errors: { message: "No existe un venta con ese ID" }
                    });
            }

            venta.cliente = body.cliente;
            venta.proyecto = body.proyecto;
            venta.tipoDePago = body.tipoDePago;
            venta.iva = body.iva;
            venta.carrito = body.carrito;
            venta.subtotal = body.subtotal;
            venta.total = body.total;
            (body.saldoPendiente!=null)?venta.saldoPendiente=body.saldoPendiente:null;
            (body.montoPagado != null) ? venta.montoPagado = body.montoPagado : null;
            (body.estatus != null) ? venta.estatus = body.estatus : null;


            venta.save((err, ventaActualizada) => {

                if (err) {
                    return res
                        .status(400)
                        .json({
                            ok: false,
                            mensaje: "Error al actualizar venta",
                            errors: err
                        });
                }

                //Posteamos un cobro negativo para dejar constancia de la cantidad devuelta al cliente
                if(devolucion>0){
                    var pago = new Cobro({
                        venta: ventaActualizada._id,
                        cliente: ventaActualizada.cliente,
                        monto: -devolucion,
                        tipoDePago: ventaActualizada.tipoDePago,
                        fecha: new Date()
                    });

                    pago.save((err, cobroGuardado) => {

                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error al guardar pago',
                                errors: err
                            });
                        }

                        res.status(200)
                            .json({
                                ok: true,
                                mensaje: "Venta actualizado exitosamente",
                                venta: ventaActualizada
                            });


                    });          
                }else{
                    res.status(200)
                        .json({
                            ok: true,
                            mensaje: "Venta actualizado exitosamente",
                            venta: ventaActualizada
                        });
                }
            });
        });
    });    
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

        //Eliminamos los pagos del cliente asociados a esa venta
        Cobro.deleteMany({ venta: ventaEliminada._id })
              .exec((err, cobrosEliminados)=>{

                  if (err) {
                      return res.status(500).json({
                          ok: false,
                          mensaje: 'Error al eliminar pagos de esta venta',
                          errors: err
                      });
                  }

                  res.status(200).json({
                      ok: true,
                      mensaje: 'Venta eliminada exitosamente',
                      venta: ventaEliminada
                  });

              });

        
    });
});
//==================================
// FIN de Eliminar venta
//==================================

//==================================================
// Funciones
//==================================================
function calcularVentasMensuales(ventas){
    var ventasMensuales = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
    ];

    ventas.forEach(venta => {
        var mes = venta.fecha.getMonth();
        var totalVenta = venta.total;

        ventasMensuales[mes]+=totalVenta;

    });

    return ventasMensuales;
}

function calcularVentasDiarias(ventas,numDias){
    var ventasDiarias = [];
    var dias=numDias;

    for ( i=0; i<=dias; i++){
        ventasDiarias.push(0);
    }

    ventas.forEach(venta=>{
        var dia = venta.fecha.getDate();
        var totalVenta = venta.total;

        ventasDiarias[dia]+=totalVenta;
    });

    return ventasDiarias;
}
//==================================================
// FIN de Funciones
//==================================================


module.exports = app;