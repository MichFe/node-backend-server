var express = require("express");
var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Nomina = require("../models/nomina");

//=============================================
// Obtener nomina por fecha inicial
//=============================================
app.get("/:dia/:mes/:year", mdAutenticacion.verificarToken, (req, res)=>{
    let dia = Number(req.params.dia);
    let mes = Number(req.params.mes);
    let year = Number(req.params.year);
    var fechaInicial = new Date(year, mes, dia);
    

    Nomina.find({ fechaInicial: fechaInicial })
        .exec((err, nominas)=>{

            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar nómina",
                errors: err
              });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de nomina exitosa',
                nominas: nominas,
            });

        });

});
//=============================================
// FIN de Obtener nomina por fecha inicial
//=============================================

//===============================================
// Obtener nomina por fecha entre rangos
//===============================================
app.get("/rango/:dia/:mes/:year", mdAutenticacion.verificarToken, (req, res) => {
    let dia = Number(req.params.dia);
    let mes = Number(req.params.mes);
    let year = Number(req.params.year);

    var fecha = new Date( year, mes, dia, 5);
    console.log(`Fecha de get rango: ${ fecha }`);
    
    Nomina.find({ 
        $and: [
            { 'fechaInicial': { '$lte': fecha } },
            { 'fechaFinal': { '$gte': fecha } }
        ]
    })
        .exec((err, nominas) => {   
                        

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar nómina",
                    errors: err
                });
            }

            

            if(nominas.length<=0){
                return res.status(400).json({
                    ok: false,
                    mensaje: "No hay una nómina correspondiente a la samena actual en la BD",
                    errors: {message: 'No hay una nómina para la semana actual en la BD'}
                });
            }

            let nomina = nominas[0];

            Nomina.populate(nomina, {
                path: 'nominaEmpleados.empleado',
                select: 'nombre'
            },
            (err, nominaPopulated)=>{
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al popular nómina",
                        errors: err
                    });  
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Consulta de nomina exitosa',
                    nomina: nominaPopulated,
                });
            });            
        });

});
//===============================================
// FIN de Obtener nomina por fecha entre rangos
//===============================================

//===============================================
// Crear una nueva nomina
//===============================================
app.post('/', mdAutenticacion.verificarToken, (req, res)=>{
    var body = req.body;
    
    var nomina = new Nomina({
        fechaInicial: body.fechaInicial,
        fechaFinal: body.fechaFinal,
        nominaEmpleados: body.nominaEmpleados,
        total: body.total
    });

    nomina.save( (err, nominaGuardada)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: "Error al guardar nómina",
                errors: err
            });
        }

        Nomina.populate(
          nominaGuardada,
          {
            path: 'nominaEmpleados.empleado',
            select: 'nombre'
            
          },
          (err, nominaPopulated) => {

            if (err) {
              return res.status(500).json({
                ok: false,
                mensaje: "Error al popular nómina",
                errors: err
              });
            }

            res.status(201).json({
              ok: true,
              mensaje: "Nomina guardada exitosamente",
              nomina: nominaPopulated
            });
          });
    });
});
//===============================================
// FIN de Crear una nueva nomina
//===============================================

//===============================================
// Actualizar una nómina
//===============================================
app.put('/:idNomina', mdAutenticacion.verificarToken, (req, res)=>{
    var idNomina = req.params.idNomina;
    var body = req.body;

    Nomina.findById(idNomina)
        .exec((err, nomina)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al buscar nómina",
                    errors: err
                });
            }

            if(!nomina){
                return res.status(400).json({
                    ok: false,
                    mensaje: `La noina id: ${ idNomina }, no existe en la base de datos`,
                    errors: err
                });
            }

            (body.fechaInicial) ? nomina.fechaInicial = body.fechaInicial : null;
            (body.fechaFinal) ? nomina.fechaFinal = body.fechaFinal : null;
            (body.nominaEmpleados) ? nomina.nominaEmpleados = body.nominaEmpleados : null;
            (body.total) ? nomina.total = body.total : null;
            (body.estatus) ? nomina.estatus = body.estatus : null;

            nomina.save((err, nominaGuardada)=>{
                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al actualizar nómina",
                        errors: err
                    });
                }

                Nomina.populate(nominaGuardada,
                    {
                        path: 'nominaEmpleados.empleado',
                        select: 'nombre'

                    },
                    (err, nominaGuardadaPopulada)=>{
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: "Error al popular nómina",
                                errors: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            mensaje: "Nómina actualizada exitosamente",
                            nomina: nominaGuardadaPopulada
                        });
                    });

                
            });
        });
});
//===============================================
// FIN de Actualizar una nómina
//===============================================

//===============================================
// Eliminar una nómina
//===============================================
app.delete('/:idNomina', mdAutenticacion.verificarToken, (req, res)=>{
    var idNomina = req.params.idNomina;

    Nomina.findByIdAndDelete(idNomina)
        .exec((err, nominaEliminada)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: "Error al eliminar nómina",
                    errors: err
                });
            }

            if(!nominaEliminada){
                return res.status(400).json({
                  ok: false,
                  mensaje: `La nomina id: ${idNomina}, no existe en la base de datos`,
                  errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Nomina eliminada exitosamente',
                nomina: nominaEliminada
            });
        });
});
//===============================================
// FIN de Eliminar una nómina
//===============================================

module.exports = app;