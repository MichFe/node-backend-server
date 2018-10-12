var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
// var SEED= require('../config/config').SEED;

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require("../models/usuario");



//==================================
// Obtener todos los usuarios
//==================================
app.get("/", mdAutenticacion.verificarToken, (req, res, next) => {
  Usuario.find({}, "nombre email img role correo").exec((err, usuarios) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error cargando usuarios.",
        errors: err
      });
    }

    res.status(200).json({
      ok: true,
      mensaje: "Consulta de usuarios realizada correctamente.",
      usuarios: usuarios
    });
  });
});
//==================================
//Fin de Obtener todos los usuarios
//==================================

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

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

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
app.post('/', mdAutenticacion.verificarToken ,(req, res, next) =>{
    var body=req.body;

    var usuario = new Usuario({
      nombre: body.nombre,
      email: body.email,
      password: bcrypt.hashSync( body.password, 10 ),
      img: body.img,
      role: body.role
    });

    usuario.save( ( err, usuarioGuardado )=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario.',
                errors: err
            });
            
        }
        
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