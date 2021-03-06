var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app=express();

var Cliente = require('../models/cliente');

//==================================
// Obtener todos los clientes
//==================================
app.get('/', mdAutenticacion.verificarToken , mdAutenticacion.validarPermisos, (req, res)=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Cliente.find({})
    .sort("-fechaUltimoMensaje")
    .skip(desde)
    .limit(10)
    .populate('usuarioUltimaModificacion', 'nombre email')
    .populate('usuarioCreador', 'nombre email')
    .exec((err, clientes)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando clientes',
                errors:err
            });
        }

        Cliente.count({}, ( err, conteoClientes ) => {
            
            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje:'Error al contar clientes',
                    errors: err
                });
            }

            res.status(200).json({
                ok:true,
                mensaje: 'Consulta de clientes realizada exitosamente',
                clientes: clientes,
                totalClientes: conteoClientes
            });

        });

    });
});
//==================================
// FIN de Obtener todos los clientes
//==================================

//==================================
// Crear cliente
//==================================
app.post('/', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res)=>{
    var body=req.body;

    var cliente = new Cliente({
        nombre: body.nombre,
        telefono: body.telefono,
        direccion: body.direccion,
        email: body.email,
        img: body.img,
        estatus: body.estatus,
        usuarioCreador: req.usuario._id,
        usuarioUltimaModificacion: req.usuario._id

    });

    cliente.save( (err, clienteGuardado)=>{

        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al guardar cliente',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensjae: 'Cliente guardado exitosamente',
            cliente: clienteGuardado
        });
    });

});
//==================================
// FIN de Crear cliente
//==================================

//==================================
// Actualizar un cliente
//==================================
app.put('/:id', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res)=>{
    var id = req.params.id;
    var body=req.body;

    Cliente.findById(id)
      .exec((err, cliente) => {
        if (err) {
          return res
            .status(500)
            .json({
              ok: false,
              mensaje: "Error al buscar cliente",
              errors: err
            });
        }

        if (!cliente) {
          return res
            .status(400)
            .json({
              ok: false,
              mensaje: "El cliente con el id: " + id + ", no existe",
              errors: { message: "No existe un cliente con ese ID" }
            });
        }

        cliente.estatus = body.estatus;
        cliente.nombre = body.nombre;
        cliente.telefono = body.telefono;
        cliente.direccion = body.direccion;
        cliente.email = body.email;
        cliente.img = body.img;
        cliente.usuarioUltimaModificacion = req.usuario._id;
        (body.fechaUltimoMensaje!=null && body.fechaUltimoMensaje != '') ? cliente.fechaUltimoMensaje = body.fechaUltimoMensaje : null;
        
        // if(!cliente.fechaUltimoMensaje){
        //     console.log('No hay fecha ultimo mensaje');
        //     cliente.fechaUltimoMensaje = new Date(2000, 1, 1);
        // }


        cliente.save((err, clienteActualizado) => {
          if (err) {
            return res
              .status(400)
              .json({
                ok: false,
                mensaje: "Error al actualizar cliente",
                errors: err
              });
          }

          res
            .status(200)
            .json({
              ok: true,
              mensaje: "Cliente actualizado exitosamente",
              cliente: clienteActualizado
            });
        });
      });
});
//==================================
// FIN de Actualizar un cliente
//==================================

//==================================
// Eliminar cliente
//==================================
app.delete('/:id', mdAutenticacion.verificarToken, (req, res)=>{
    var id = req.params.id;

    Cliente.findByIdAndDelete(id, (err, clienteEliminado) =>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al eliminar cliente',
                errors: err
            });
        }

        if(!clienteEliminado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un cliente con ese ID',
                errors: {message: 'No existe un cliente con ese ID'}
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Cliente eliminado exitosamente',
            cliente: clienteEliminado
        });
    });
});
//==================================
// FIN de Eliminar cliente
//==================================


module.exports = app;