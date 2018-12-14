var express=require('express');
var mdAutenticacion = require("../middlewares/autenticacion");

var app=express();


var Cliente = require('../models/cliente');
var Producto = require('../models/producto');


app.get('/coleccion/:tabla/:busqueda', mdAutenticacion.verificarToken,(req,res)=>{
   
    var busqueda= req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch( tabla ){

        case 'cliente':
            promesa = buscarCliente(busqueda, regex);
            break;

        case 'proyecto':
            promesa = buscarProyecto(busqueda, regex);
            break;

        case 'producto':
            promesa = buscarProducto(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'La colección solicitada, no existe',
                error: { message: 'La colección no existe' }
            });  
            
    }

    promesa
        .then( data =>{
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })
        .catch( (err) =>{
            res.status(500).json({
                ok:false,
                mensaje:'Error al ejecutar busqueda',
                error: { message: err }
            });
        });


});

function buscarCliente( busqueda, regex ){

    return new Promise( (resolve, reject)=>{
        
        Cliente.find({nombre: regex}, (err, clientes)=>{
            if(err){
                reject('Error al buscar cliente', err);
            }else{
                resolve(clientes); 
            }
        });

    });

}

function buscarProducto( buqueda, regex){

    return new Promise((resolve, reject)=>{

        Producto.find({nombre: regex}, (err, productos)=>{
            if(err){
                reject('Error a buscar cliente',err);
            }else{
                resolve(productos);
            }
        });

    });
}

module.exports = app;