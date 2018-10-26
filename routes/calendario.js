var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app=express();

var Calendario = require('../models/calendario');

//============================================================
// Obtener calendario del usuario para mes y año requeridos
//============================================================
app.get('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id = req.params.id;
    var year = req.query.year;
    var month = req.query.month;

    Calendario.find({ 'usuario': id, 'year':year, 'month': month }, (err,calendario)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar calendario',
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            mensjae: 'Consulta de calendario exitosa',
            calendario: calendario
        });
    });

});
//=================================================================
// FIN de Obtener calendario del usuario para mes y año requeridos
//=================================================================

//============================================================
// Guardar calendario de usuario (mes y año definidos)
//============================================================
app.post('/:id',mdAutenticacion.verificarToken, (req,res)=>{

    var id=req.params.id;

    var body=req.body;

    var calendario = new Calendario({
        usuario: id,
        year:body.year,
        month:body.month,
        eventos:body.eventos
    });

    calendario.save( (err, calendarioGuardado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar el calendario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje:'Calendario creado exitosamente',
            calendario: calendarioGuardado
        });
    });



});
//============================================================
// FIN de Guardar calendario de usuario (mes y año definidos)
//============================================================

//============================================================
// Actualizar calendario de usuario (mes y año definidos)
//============================================================
app.put('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id=req.params.id;
    
    var body=req.body;

    var month=req.query.month;
    var year=req.query.year;

    Calendario.findById( id, (err, calendario)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar calendario',
                errors: err
            });
        }

        if(!calendario){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el calendario que se desea actualizar',
                errors: {message: 'No existe un calendario que coincida con la petición'}
            });
        }

        calendario.eventos=body.eventos;

        calendario.save((err, calendarioActualizado)=>{

            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al guardar calendario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                menaje: 'Actualización de calendario exitosa',
                calendario: calendarioActualizado
            });
        });

    });
});
//============================================================
// FIN de Actualizar calendario de usuario (mes y año definidos)
//============================================================

//============================================================
// Eliminar calendario de usuario (mes y año definidos)
//============================================================
app.delete('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id=req.params.id;

    Calendario.findByIdAndDelete( id, (err, calendarioEliminado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar calendario',
                errors: err
            });
        }

        if(!calendarioEliminado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el calendario que se desea eliminar',
                errors: {message: 'El calendario que se desea eliminar no existe'}
            });
        }

        res.status(200).json({
            ok: false,
            mensaje:'El calendario se ha eliminado exitosamente',
            calendario: calendarioEliminado
        });
    });
});
//============================================================
// FIN de Eliminar calendario de usuario (mes y año definidos)
//============================================================


module.exports = app;