var express = require('express');
var jwt = require("jsonwebtoken");
var SEED = require("../config/config").SEED;

var app = express();

app.post('/', (req, res) => {
    
    let token = req.body.token;

    jwt.verify( token, SEED, (err,decoded)=>{
        
        if(err){
            return res.status(401).json({
                ok:false,
                mensaje:'Token inválido',
                errors:err,
            });
        }

        return res.status(200).json({
            ok: true,
            mensaje: 'Token válido',
            usuario: decoded.usuario
        });

    }); 


});

module.exports = app;