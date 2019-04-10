var express = require('express');
var bcrypt = require('bcryptjs');

// var jwt = require('jsonwebtoken');
// var SEED= require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require("../models/usuario");



//=====================================
// Obtener usuarios de 10 en 10
//=====================================
app.get("/", mdAutenticacion.verificarToken, (req, res, next) => {

  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({ role: {$ne: 'ADMIN_ROLE'} }, "nombre email img role correo unidadDeNegocio")
  .skip(desde)
  .limit(10)
  .exec((err, usuarios) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando usuarios.",
        errors: err
      });
    }

    Usuario.count({}, (err, conteoUsuarios)=>{

      if(err){
        return res.status(500).json({
          ok: false,
          mensaje:"Error al contar usuarios",
          errors: err
        });
      }
      
      res.status(200).json({
        ok: true,
        mensaje: "Consulta de usuarios realizada correctamente.",
        usuarios: usuarios,
        totalUsuarios: conteoUsuarios
      });

    });

  });
});
//=====================================
//Fin de Obtener usuarios de 10 en 10
//=====================================

//==================================
// Actualizar usuario
//==================================
    app.put("/:id", mdAutenticacion.verificarToken, (req, res, next) => {
      var id = req.params.id;
      var body = req.body;      

      Usuario.findById(id, (err, usuario) => {
        if (err) {
          return res
            .status(500)
            .json({
              ok: false,
              mensaje: "Error al buscar usuario",
              errors: err
            });
        }

        if (!usuario) {
          return res
            .status(400)
            .json({
              ok: false,
              mensaje: "El usuario con el id" + id + " no existe",
              errors: { message: "No existe un usuario con ese ID" }
            });
        }

        ( body.nombre != null && body.nombre != '' )?usuario.nombre = body.nombre:null;
        ( body.email != null && body.email!='' )?(usuario.email = body.email):null;
        ( body.role != null && body.role!='' )?(usuario.role = body.role):null;
        ( body.unidadDeNegocio != null && body.unidadDeNegocio!='' )?usuario.unidadDeNegocio = body.unidadDeNegocio:null;


        usuario.save((err, usuarioGuardado) => {
          if (err) {
            return res
              .status(400)
              .json({
                ok: false,
                mensaje: "Error al actualizar usuario",
                errors: err
              });
          }

          usuarioGuardado.password = "PRIVATE";

          res
            .status(200)
            .json({
              ok: true,
              mensaje: "Usuario actualizado correctamente",
              usuario: usuarioGuardado
            });
        });
      });
    });
//==================================
// FIN de Actualizar usuario
//==================================

//==================================
// Crear un nuevo usuario
//==================================
app.post('/', mdAutenticacion.verificarToken, (req, res, next) =>{
    var body=req.body;

    var usuario = new Usuario({
      nombre: body.nombre,
      email: body.email,
      password: bcrypt.hashSync( body.password, 10 ),
      img: body.img,
      role: body.role,
      unidadDeNegocio: body.unidadDeNegocio
    });

    usuario.save( ( err, usuarioGuardado )=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario.',
                errors: err
            });
            
        }

        usuarioGuardado.password = "PRIVATE";
        
        res.status(201).json({
            ok:true,
            mensaje: 'Usuario creado correctamente',
            usuario:usuarioGuardado
        });

    });

});
//==================================
// Fin de Crear un nuevo usuario
//==================================

//==================================
// Eliminar un usuario por ID
//==================================
app.delete("/:id", mdAutenticacion.verificarToken, (req, res, next) => {
  var id = req.params.id;

  Usuario.findByIdAndDelete(id, (err, usuarioEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al eliminar usuario",
        errors: err
      });
    }

    if (!usuarioEliminado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un usuario con ese ID",
        errors: { message: "No existe un usuario con ese ID" }
      });
    }

    usuarioEliminado.password = "PRIVATE";

    res.status(200).json({
      ok: true,
      mensaje: "Usuario eliminado correctamente",
      usuario: usuarioEliminado
    });
  });
});
//==================================
// FIN de Eliminar un usuario por ID
//==================================


module.exports = app;
