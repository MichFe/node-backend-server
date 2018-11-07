var express = require('express');

var app = express();

const path =  require('path');
const fs = require('fs');

app.get('/:tipo/:img', (req, res, next) => {

    var tipo= req.params.tipo;
    var img = req.params.img;

    var pathImagen = path.resolve( __dirname, `../uploads/${ tipo }/${ img }` );

    //Validamos si la imagen existe
    if( fs.existsSync( pathImagen) ){
        return res.sendFile( pathImagen );
    }else{
        
        let pathDefault = path.resolve( __dirname, `../uploads/no-image.png`);

        switch(tipo){
            case 'usuario':
                pathDefault = path.resolve( __dirname, `../uploads/usuario/default.png`);
            break;

            default:
                pathdefault = path.resolve( __dirname, `../uploads/no-image.png`);

        }


       return res.sendFile( pathDefault );
       
    }

});

module.exports = app;