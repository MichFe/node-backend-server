var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Venta = require('../models/venta');
var Cliente= require('../models/cliente');

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
// FIN Obtener ventas paginadas de 10 en 10
//======================================================

//====================================================================
// Obtener total de ventas pagadas y total de saldo pendiente
//====================================================================
app.get('/saldoPendiente', mdAutenticacion.verificarToken,( req, res )=>{
    // var year=Number(req.params.year);
    // var fechaInicial = new Date(year, 0, 1);
    // var fechaFinal = new Date(year, 11, 21);
    var totalSaldoPendiente;
    var totalMontoPagado;

    Venta.aggregate([
        // { $match: { 
            // fecha: { $gte: fechaInicial, $lte: fechaFinal}
        //  }},
        { $group: {
             _id: null,
             totalMontoPagado: { $sum: '$montoPagado' },
             totalSaldoPendiente: { $sum: '$saldoPendiente' }
         } 
        }], (err, totales)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al sumar saldoPendiente y montoPagado',
                errors: err
            });
        }
        
        totalSaldoPendiente = totales[0].totalSaldoPendiente;
        totalMontoPagado = totales[0].totalMontoPagado;

        res.status(200).json({
            ok: true,
            mensaje: 'Consulta de totales realizada exitosamente',
            totalSaldoPendiente: totalSaldoPendiente,
            totalMontoPagado: totalMontoPagado
        });
    });

});
//====================================================================
// FIN deObtener total de ventas pagadas y total de saldo pendiente
//====================================================================

//======================================================
// Obtener total de ventas mensuales en un año
//======================================================
app.get('/ventasMensuales/:year', mdAutenticacion.verificarToken, (req, res)=>{
    var year=Number(req.params.year);
    var fechaInicial = new Date(year, 0, 1, 0, 0, 0, 0);
    var fechaFinal = new Date( year, 11, 31, 0, 0 ,0 , 0 );    

    Venta.find({ 
        'fecha': { 
            $gte: fechaInicial,
            $lte: fechaFinal
        }
    })
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
    
    Venta.find({
        'fecha':{
            $gte:fechaInicial,
            $lte: fechaFinal
        }
    })
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