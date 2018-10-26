// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

//Config variables
var CORS_OPTIONS = require("./config/config").CORS_OPTIONS;

//Inicializar variables
var app=express();

//controlando CORS (Desde que dominios vamos a aceptar peticiones)
app.use(cors(CORS_OPTIONS));


//Body Parser
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
//parse application/json
app.use(bodyParser.json());

//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var clienteRoutes = require('./routes/cliente');
var proyectoRoutes =  require('./routes/proyecto');
var calendarioRoutes =  require('./routes/calendario');

//Conexion a base de datos
mongoose.connection.openUri('mongodb://localhost:27017/moblaDB', (err, res)=>{
     
if( err ) throw err;

    console.log('Base de datos: \x1b[32m %s\x1b[0m', 'online');
     
});

//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/cliente', clienteRoutes);
app.use('/proyecto', proyectoRoutes);
app.use('/calendario', calendarioRoutes);
app.use('/', appRoutes);


//Escuchar peticiones
app.listen( 3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
    
});
