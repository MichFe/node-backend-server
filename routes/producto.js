var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');
var fs = require('fs');

var UPLOADS_PATH = require("../config/config").UPLOADS_PATH;

var app = express();

var Producto = require('../models/producto');

//======================================================================
// Obtener todas las familias y todos los productos por familia
//======================================================================
app.get('/familiasYProductos', mdAutenticacion.verificarToken, (req, res)=>{
    Producto.aggregate(
      [
        {
          $group: {
            _id: { familia: "$familia" },
            productos: {
              $push: {
                productoId: "$_id",
                codigo: "$codigo",
                nombre: "$nombre",
                cantidad: "$cantidad"
              }
            }
          }
        }
      ],
      (err, familias) => {
        if (err) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error al consultar familias y productos",
            errors: err
          });
        }

        res.status(200).json({
          ok: true,
          mensaje: "Consulta de familias y productos exitosa",
          familias: familias
        });
      }
    );
});
//======================================================================
// FIN de Obtener todas las familias y todos los productos por familia
//======================================================================

//========================================================
// Obtener todos los productos
//========================================================
app.get('/', mdAutenticacion.verificarToken, (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({})
        .skip(desde)
        .limit(10)
        .populate('usuarioCreador', 'nombre email')
        .populate('usuarioUltimaModificacion', 'nombre email')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar productos',
                    errors: err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay productos en la base de datos',
                    errors: { message: 'No hay ningún producto en la base de datos' }
                });
            }

            Producto.count({}, (err, conteoProductos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al contar los productos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Consulta de productos realizada correctamente',
                    productos: productos,
                    totalProductos: conteoProductos
                });

            });

        });
});
//========================================================
// FIN de Obtener todos los productos
//========================================================

//========================================================
// Obtener productos por familia
//========================================================
app.get('/familia/:familia', mdAutenticacion.verificarToken, (req, res) => {
    var familia = req.params.familia;

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Producto.find({ 'familia': familia }, "codigo nombre familia precio img usuarioCreador usuarioUltimaModificacion")
        .skip(desde)
        .limit(10)
        .populate('usuarioCreador', 'nombre email')
        .populate('usuarioUltimaModificacion', 'nombre email')
        .exec((err, productosFamilia) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar productos',
                    errors: err
                });
            }

            if (!productosFamilia) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No hay productos asociados a la familia: ' + familia,
                    errors: { message: 'No hay productos asociados a la familia especificada' }
                });
            }

            Producto.count({ 'familia': familia }, (err, conteoProductos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al contar los productos',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'Consulta de productos realizada correctamente',
                    productos: productosFamilia,
                    totalProductos: conteoProductos
                });

            });

        });
});
//========================================================
// FIN de Obtener productos por familia
//========================================================

//========================================================
// Guardar producto
//========================================================
app.post('/', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var body = req.body;

    var producto = new Producto({
        codigo: body.codigo,
        nombre: body.nombre,
        familia: body.familia,
        precio: body.precio,
        usuarioUltimaModificacion: body.usuarioUltimaModificacion,
        usuarioCreador: body.usuarioCreador,
        img: body.img
    });

    producto.save((err, productoGuardado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al guardar producto',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            mensaje: 'Producto guardado exitosamente',
            producto: productoGuardado
        });
    });
});
//========================================================
// FIN de Guardar producto
//========================================================

//========================================================
// Actualizar producto
//========================================================
app.put('/:id', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Producto.findById(id)
        .exec((err, producto) => {

            if (err) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar producto',
                    errors: err
                });
            }

            if (!producto) {
                res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el producto id: ' + id,
                    errors: { message: 'No existe un producto que coincida con el id: ' + id + ', en la base de datos' }
                });
            }

            ( body.codigo ) ? producto.codigo = body.codigo: null;
            ( body.nombre ) ? producto.nombre = body.nombre: null;
            ( body.familia ) ? producto.familia = body.familia: null;
            ( body.precio ) ? producto.precio = body.precio: null;
            ( body.cantidad >= 0 ) ? producto.cantidad = body.cantidad: null;
            ( body.usuarioUltimaModificacion ) ? producto.usuarioUltimaModificacion = req.usuario._id: null;

            producto.save((err, productoActualizado) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el producto id: ' + id,
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    mensaje: 'El producto se actualizó exitosamente',
                    producto: productoActualizado
                });
            });
        });

});
//========================================================
// FIN de Actualizar producto
//========================================================

//========================================================
// Eliminar un producto
//========================================================
app.delete('/:id', mdAutenticacion.verificarToken, mdAutenticacion.validarPermisos, (req, res) => {
    var id = req.params.id;

    Producto.findByIdAndDelete(id, (err, productoEliminado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar producto',
                errors: err
            });
        }

        if (!productoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El producto id: ' + id + ', no existe',
                errors: { message: 'El producto que se desea eliminar no existe en la base de datos' }
            });
        }

        //Creamos la ruta que tendría la imagen del producto
        var oldPath = UPLOADS_PATH + `producto/${ productoEliminado.img }`;

        //Verificamos si existía una imagen para el producto y la eliminamos
        if( fs.existsSync(oldPath) ){
            fs.unlink(oldPath, (err)=>{
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al eliminar imagen anterior',
                        errors: err
                    });
                }
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Producto eliminado exitosamente',
            producto: productoEliminado
        });
    });
});
//========================================================
// FIN de Eliminar un producto
//========================================================

module.exports = app;
