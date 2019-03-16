var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Requisicion = require("../models/requisicion");


//===================================================================
// Obtener requisiciones Aprobadas paginadas de 10 en 10
//===================================================================
app.get('/aprobadas', mdAutenticacion.verificarToken, (req,res)=>{
    var desde = Number(req.query.desde) || 0;
    var query={
        estatus: 'Aprobada'
    };

    Requisicion.find(query)
        .skip(desde)
        .limit(10)
        .populate("solicitante", "nombre email")
        .populate("aprobador", "nombre")
        .sort("-fechaSolicitud")
        .exec( (err,requisiciones)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al consultar requisiciones",
                    errors: err
                });
            }

            Requisicion.countDocuments(query, (err, conteoRequisiciones) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al contar requisiciones",
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: "Consulta de requisiciones realizada exitosamente",
                    requisiciones: requisiciones,
                    totalReqisiciones: conteoRequisiciones
                });
            });

        });
});
//===================================================================
// FIN de Obtener requisiciones Aprobadas paginadas de 10 en 10
//===================================================================

//==================================================================
// Obtener requisiciones por aprobar paginadas de 10 en 10
//==================================================================
app.get('/porAprobar', mdAutenticacion.verificarToken, (req, res)=>{
    var desde = Number(req.query.desde) || 0;
    var query={
        estatus: 'Por aprobar'
    };

    Requisicion.find(query)
        .skip(desde)
        .limit(10)
        .populate("solicitante", "nombre email")
        .sort("-fechaSolicitud")
        .exec( (err, requisiciones)=>{

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al consultar requisiciones",
                    errors: err
                });
            }

            Requisicion.countDocuments(query, (err, conteoRequisiciones) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al contar requisiciones",
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: "Consulta de requisiciones realizada exitosamente",
                    requisiciones: requisiciones,
                    totalReqisiciones: conteoRequisiciones
                });
            });


        });
});
//==================================================================
// FIN de Obtener requisiciones por aprobar paginadas de 10 en 10
//==================================================================

//=====================================================
// Obtener requisiciones paginadas de 10 en 10
//=====================================================
app.get('/', mdAutenticacion.verificarToken,(req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    var solicitanteId=req.query.id;
    var query={
        solicitante: solicitanteId
    };
    
    if(solicitanteId==null){
        query={};
    }

    Requisicion.find(query)
      .skip(desde)
      .limit(10)
      .populate("solicitante", "nombre email")
      .sort("-fechaSolicitud")
      .exec( (err,requisiciones)=>{

          if(err){
              return res.status(500).json({
                  ok: false,
                  mensaje: "Error al consultar requisiciones",
                  errors: err
              });
          }

          Requisicion.countDocuments({}, (err, conteoRequisiciones)=>{

              if( err ){
                  return res.status(500).json({
                      ok: false,
                      mensaje: "Error al contar requisiciones",
                      errors: err
                  });
              }

              res.status(200).json({
                  ok: true,
                  mensaje: "Consulta de requisiciones realizada exitosamente",
                  requisiciones: requisiciones,
                  totalReqisiciones: conteoRequisiciones
              });
          });
      });


});
//=====================================================
// FIN de Obtener requisiciones paginadas de 10 en 10
//=====================================================

//=====================================================
// Crear requisicion
//=====================================================
app.post('/', mdAutenticacion.verificarToken, (req, res)=>{
    var body=req.body;

    var requisicion = new Requisicion({
        descripcion: body.descripcion,
        cantidad: body.cantidad,
        solicitante: body.solicitante,
        unidadDeNegocio: body.unidadDeNegocio,
        estatus: "Por aprobar",
        fechaSolicitud: body.fechaSolicitud,
        fechaAprobacionRechazo: null
    });

    requisicion.save( (err, requisicionGuardada)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje:"Error al guardar requisición",
                errors:err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: "Requisición guardada exitosamente",
            requisicion: requisicionGuardada
        });
    });
});
//=====================================================
// FIN de Crear requisicion
//=====================================================

//=====================================================
// Actualizar requisicion
//=====================================================
app.put('/:id', mdAutenticacion.verificarToken, (req, res)=>{
    var id = req.params.id;
    var body = req.body;

    Requisicion.findById( id, (err, requisicion)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar requisición",
                errors: err
            });
        }

        if(!requisicion){
            return res.status(400).json({
                ok: false,
                mensaje: "No existe la requisición id: " + id,
                errors: { message: 'No existe una requisición que coincida con el id: ' + id + ', en la base de datos'}
            });
        }

        requisicion.estatus = body.estatus;
        requisicion.fechaAprobacionRechazo = Date.now();
        requisicion.aprobador = body.aprobador;
                        
        requisicion.save( (err, requisicionActualizada)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al actualizar requisición",
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: "La requisición se actualizó exitosamente",
                requisicion: requisicionActualizada
            });
        });
    });

});
//=====================================================
// FIN de Actualizar requisicion
//=====================================================

//=====================================================
// Eliminar requisicion
//=====================================================
app.delete('/:id',mdAutenticacion.verificarToken, (req, res)=>{
    var id = req.params.id;

    Requisicion.findByIdAndDelete(id, (err, requisicionEliminada)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: "Error al eliminar requisición",
                errors: err
            });
        }

        if(!requisicionEliminada){
            return res.status(400).json({
                ok: false,
                mensaje: 'La requisición id: ' + id + ', no existe',
                errors: { message: 'La requisición que se desea eliminar no existe en la base de datos' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: "Requisición eliminada exitosamente",
            requisicion: requisicionEliminada
        });
    });
});
//=====================================================
// FIN de Eliminar requisicion
//=====================================================

module.exports = app;