var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res, next) =>{

    var body=req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) =>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if( !usuarioDB ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        if( !bcrypt.compareSync(body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: err
            });
        }

        if( usuarioDB.blacklist ){
            return res.status(401).json({
                ok:false,
                mensaje: 'Usuario desactivado',
                errors: { message: 'Su usuario ha sido desactivado' }
            });
        }

        usuarioDB.password='PRIVATE';

        //Crear un token
        var token = jwt.sign({ usuario: usuarioDB }, SEED,{ expiresIn: 28800 }); //8 horas


        res.status(200).json({
            ok:true,
            mensaje:'Login exitoso',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    });
    
});





module.exports = app;

