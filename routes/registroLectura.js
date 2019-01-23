var express = require('express');
var mdAutenticacion = require("../middlewares/autenticacion");

var app = express();

var Lectura = require("../models/registroLectura");

app.get('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var usuarioId=req.params.id;

    Lectura.findOne({ usuario: usuarioId})
        .exec( (err, registroLectura)=>{
            
            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al consutar registro de ledtura',
                    errors: err
                });
            }

            if(!registroLectura){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'No hay registro de lectura para ese usuario',
                    errors: { message:'No hay un registro de lectura para ese usuario' }
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Consulta de registro de lectura exitosa',
                registroLectura: registroLectura
            });
        });

});

app.post('/', mdAutenticacion.verificarToken, (req, res)=>{
    var body = req.body;

    var registroLectura = new Lectura({
        usuario: body.usuario,
        // registroLecturaClientes: body.registroLecturaClientes,
        registroLecturaProyectos: body.registroLecturaProyectos
    });

    registroLectura.save( (err, registroLecturaGuardado)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guarar registro de lectura',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Registro de lectura creado exitosamente',
            registroLectura: registroLecturaGuardado
        });

    });
});


app.put('/:id', mdAutenticacion.verificarToken, (req, res)=>{
    var id = req.params.id;
    var body = req.body;

    Lectura.findById(id)
        .exec( (err,registroLectura)=>{

            if(err){
                return res.status.json({
                    ok: false,
                    mensaje: 'Error al buscar registro de Lectura',
                    errors: err
                });
            }

            if(!registroLectura){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un registro de lectura con ese id',
                    errors: { message: 'No existe un registro de lectura con el id especificado en la base de datos' }
                });
            }

            (body.registroLecturaClientes && body.registroLecturaClientes != '') ? registroLectura.registroLecturaClientes = body.registroLecturaClientes : null;
            (body.registroLecturaProyectos && body.registroLecturaProyectos != '') ? registroLectura.registroLecturaProyectos = body.registroLecturaProyectos : null;

            registroLectura.save( (err, registroLecturaActualizado)=>{

                if(err){
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar registro de lectura',
                        errors: err
                    }); 
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Registro de lectura actualizado correctamente',
                    registroLectura: registroLecturaActualizado
                });

            });


        });
});


module.exports = app;