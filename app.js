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
var validarTokenRoutes = require('./routes/validarToken');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var chatRoutes = require('./routes/chat');
var imagenesRoutes = require('./routes/imagenes');
var productoRoutes = require('./routes/producto');
var ventaRoutes = require('./routes/venta');
var requisicionRoutes = require('./routes/requisicion');

//Conexion a base de datos
mongoose.set("useCreateIndex", true);
mongoose.connection.openUri('mongodb://localhost:27017/moblaDB',{ useNewUrlParser:true },(err, res)=>{

if( err ) throw err;

    console.log('Base de datos: \x1b[32m %s\x1b[0m', 'online');
     
});


//Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/cliente', clienteRoutes);
app.use('/proyecto', proyectoRoutes);
app.use('/calendario', calendarioRoutes);
app.use('/validarToken', validarTokenRoutes);
app.use('/chat', chatRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/producto', productoRoutes);
app.use('/venta', ventaRoutes);
app.use('/requisicion', requisicionRoutes);
app.use('/', appRoutes);


//Escuchar peticiones
app.listen( 3000, () => {
    console.log('Express server corriendo en el puerto 3000: \x1b[32m%s\x1b[0m', 'online');
    
});
