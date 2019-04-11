var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var modulos = {
  values: [
    "Catalogo de productos",
    "Reporte de Ventas",
    "CRM",
    "Cuentas Por Cobrar",
    "Cuentas Por Pagar",
    "Mis requisiciones",
    "Aprobaciones",
    "Compras",
    "Permisos",
    "Gastos"
  ],
  message: '{VALUE} no es un módulo válido'
};

var permisos = {
  values: [
    "Agregar Productos",
    "Editar Productos",
    "Eliminar Productos",
    "Realizar Ventas",
    "Editar Ventas",
    "Eliminar Ventas",
    "Editar Metas de Venta",
    "Agregar Clientes",
    "Editar Clientes",
    "Agregar Proyectos",
    "Eliminar Proyectos",
    "Agregar Cotizaciones",
    "Editar Cotizaciones",
    "Eliminar Cotizaciones",
    "Ver cuentas por Cobrar",
    "Registrar pagos de clientes",
    "Eliminar pagos de clientes",
    "Crear Requisiciones",
    "Eliminar requisiciones sin aprobar",
    "Ver requisiciones por aprobar",
    "Aprobar/Rechazar Requisiciones",
    "Crear ordenes de compra",
    "Editar ordenes de compra",
    "Eliminar ordenes de compra",
    "Registrar pago a proveedor",
    "Ver cuentas por pagar",
    "Eliminar pago a proveedor",
    "Ver permisos de usuarios",
    "Editar permisos de usuarios",
    "Ver Clientes",
    "Ver Proyectos",
    "Ver Chats",
    "Crear Chats",
    "Eliminar Chats",
    "Ver Cotizaciones",
    "Ver ventas mensuales",
    "Ver ventas diarias",
    "Ver saldo pendiente anual",
    "Ver descuentos mensuales",
    "Ver tabla de ventas",
    "Ver clientes con saldo pendiente",
    "Ver total saldo pendiente",
    "Ver ventas con saldo de cada cliente",
    "Ver pagos de cada compra",
    "Ver requisiciones aprobadas",
    "Ver compras",
    "Ver proveedores con saldo",
    "Ver saldo pendiente total",
    "Ver compras con saldo de cada proveedor",
    "Ver pagos de cada venta",
    "Ver Gastos",
    "Registrar Gastos",
    "Editar Gastos",
    "Eliminar Gastos"
  ],
  message: "{VALUE} no es un permiso válido"
};

var urls = {
  values: [
    "/producto/",
    "/producto/:id",
    "/venta/",
    "/venta/:id",
    "/meta/:id",
    "/cliente/",
    "/cliente/:id",
    "/proyecto/",
    "/proyecto/:id",
    "/cotizacion/",
    "/cotizacion/:id",
    "/cobro/:idVenta",
    "/cobro/",
    "/cobro/:cobroId",
    "/requisicion/",
    "/requisicion/:id",
    "/requisicion/porAprobar",
    "/compra/",
    "/compra/:id",
    "/pago/",
    "/pago/:idCompra",
    "/pago/:pagoId",
    "/permisos/:userId",
    "/poyecto/:id",
    "/chat/:idProyecto",
    "/chat/",
    "/chat/:id",
    "/cotizacion/cotizacionProyecto/:id",
    "/venta/ventasMensuales/:year",
    "/venta/ventasDiarias/:year/:mes",
    "/venta/saldoPendiente/:year",
    "/venta/descuentosAnuales/:year",
    "/venta/tablaVentas",
    "/venta/clientesConSaldo",
    "/venta/saldoPendiente/todosLosTiempos",
    "/venta/ventasConSaldo/:clienteId",
    "/cobro/:idVenta",
    "/aprobadas",
    "/compra/proveedoresConSaldo",
    "/compra/saldoPendiente/todosLosTiempos",
    "/compra/comprasConSaldo/:proveedorId",
    "/gasto/",
    "/gasto/:gastoId"
  ],
  message: "{VALUE} no es una url válida"
};

var metodos = {
  values:[
    'GET',
    'POST',
    'PUT',
    'DELETE'
  ],
  message: '{VALUE} no es un método válido'
};

var permisosSchema = new Schema({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
    unique: true
  },
  fechaUltimaModificacion: { type: Date, required: true },
  usuarioUltimaModificacion: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  permisos: [
    {
      modulo: { type: String, required: true, enum: modulos },
      permiso: { type: String, required: true, enum: permisos },
      enabled: { type: Boolean, required: true, default: false },
      url: { type: String, required: true, enum: urls },
      method: { type: String, required: true, enum: metodos }
    }
  ]
});

module.exports = mongoose.model("Permisos", permisosSchema); 