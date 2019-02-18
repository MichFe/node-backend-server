var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Meta = require('../models/meta');

app.get('/:year', mdAutenticacion.verificarToken ,(req, res, next) => {
    var year=req.params.year;
    var unidadDeNegocio = req.query.unidadDeNegocio;

    Meta.find({'year': year, unidadDeNegocio: unidadDeNegocio}, (err, metasYear)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar metas',
                errors:err
            });
        }

        if(!metasYear[0]){
            return res.status(400).json({
                ok: false,
                mensaje: 'No hay metas para el año: ' + year,
                errors: { message: 'No hay metas en la base de datos para el año especificado' }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Consulta de metas exitosa',
            metas: metasYear
        });

    });
    
    

});

app.post('/', mdAutenticacion.verificarToken, (req,res)=>{
    var body = req.body;

    var metas = new Meta({
        year: body.year,
        unidadDeNegocio: body.unidadDeNegocio,
        metas: body.metas
    });

    metas.save((err, metasGuardadas)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear meta',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Meta creada exitosamente',
            metaCreada: metasGuardadas
        });
    }); 

});

app.put('/:id', mdAutenticacion.verificarToken, (req,res)=>{
    var id=req.params.id;
    var body=req.body;

    Meta.findById(id)
     .exec((err, meta)=>{

        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar meta',
                errors: err
            });
        }

        if(!meta){
            return res.status(400).json({
                ok: false,
                mensaje: 'La meta id: ' + id + ', no existe en la base de datos',
                errors: { message: 'La meta que se desea actualizar no existe en la base de datos' }
            });
        }

        meta.metas=body.metas;

        meta.save((err,metaActualizada)=>{

            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje: 'Error al actualizar meta',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                mensaje: 'Meta actualizada exitosamente',
                meta: metaActualizada
            });

        });
    });
});

module.exports = app;