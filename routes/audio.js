var express = require('express');

var app = express();

const path =  require('path');
const fs = require('fs');

app.get('/:audio', (req, res, next) => {

    var audio = req.params.audio;

    var pathAudio = path.resolve( __dirname, `../uploads/chatAudio/${ audio }` );

    //Validamos si el audio existe
    if( fs.existsSync( pathAudio) ){
        return res.sendFile( pathAudio );
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