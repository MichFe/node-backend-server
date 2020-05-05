module.exports.PERMISOS_DEFAULT = [
  {
    modulo: "Catalogo de productos",
    permiso: "Agregar Productos",
    enabled: false,
    url: "/producto/",
    method: "POST"
  },
  {
    modulo: "Catalogo de productos",
    permiso: "Editar Productos",
    enabled: false,
    url: "/producto/:id",
    method: "PUT"
  },
  {
    modulo: "Catalogo de productos",
    permiso: "Eliminar Productos",
    enabled: false,
    url: "/producto/:id",
    method: "DELETE"
  },
  {
    modulo: "Catalogo de productos",
    permiso: "Realizar Ventas",
    enabled: false,
    url: "/venta/",
    method: "POST"
  },
  {
    modulo: "Reporte de Ventas",
    permiso: "Ver ventas mensuales",
    enabled: false,
    url: "/venta/ventasMensuales/:year",
    method: "GET"
  },
  {
    modulo: "Reporte de Ventas",
    permiso: "Ver ventas diarias",
    enabled: false,
    url: "/venta/ventasDiarias/:year/:mes",
    method: "GET"
  },
  {
    modulo: "Reporte de Ventas",
    permiso: "Ver saldo pendiente anual",
    enabled: false,
    url: "/venta/saldoPendiente/:year",
    method: "GET"
  },
  {
    modulo: "Reporte de Ventas",
    permiso: "Ver descuentos mensuales",
    enabled: false,
    url: "/venta/descuentosAnuales/:year",
    method: "GET"
  },
  {
    modulo: "Reporte de Ventas",
    permiso: "Ver tabla de ventas",
    enabled: false,
    url: "/venta/tablaVentas",
    method: "GET"
  },
  {
    modulo: "Reporte de Ventas",
    permiso: "Editar Ventas",
    enabled: false,
    url: "/venta/:id",
    method: "PUT"
  },
  {
    modulo: "Reporte de Ventas",
    permiso: "Eliminar Ventas",
    enabled: false,
    url: "/venta/:id",
    method: "DELETE"
  },
  {
    modulo: "Reporte de Ventas",
    permiso: "Editar Metas de Venta",
    enabled: false,
    url: "/meta/:id",
    method: "PUT"
  },
  {
    modulo: "CRM",
    permiso: "Ver Clientes",
    enabled: false,
    url: "/cliente/",
    method: "GET"
  },
  {
    modulo: "CRM",
    permiso: "Ver Proyectos",
    enabled: false,
    url: "/proyecto/:id",
    method: "GET"
  },
  {
    modulo: "CRM",
    permiso: "Ver Chats",
    enabled: false,
    url: "/chat/:idProyecto",
    method: "GET"
  },
  {
    modulo: "CRM",
    permiso: "Crear Chats",
    enabled: false,
    url: "/chat/",
    method: "POST"
  },
  {
    modulo: "CRM",
    permiso: "Eliminar Chats",
    enabled: false,
    url: "/chat/:id",
    method: "DELETE"
  },
  {
    modulo: "CRM",
    permiso: "Agregar Clientes",
    enabled: false,
    url: "/cliente/",
    method: "POST"
  },
  {
    modulo: "CRM",
    permiso: "Editar Clientes",
    enabled: false,
    url: "/cliente/:id",
    method: "PUT"
  },
  {
    modulo: "CRM",
    permiso: "Agregar Proyectos",
    enabled: false,
    url: "/proyecto/",
    method: "POST"
  },
  {
    modulo: "CRM",
    permiso: "Eliminar Proyectos",
    enabled: false,
    url: "/proyecto/:id",
    method: "DELETE"
  },
  {
    modulo: "CRM",
    permiso: "Ver Cotizaciones",
    enabled: false,
    url: "/cotizacion/cotizacionProyecto/:id",
    method: "GET"
  },
  {
    modulo: "CRM",
    permiso: "Agregar Cotizaciones",
    enabled: false,
    url: "/cotizacion/",
    method: "POST"
  },
  {
    modulo: "CRM",
    permiso: "Editar Cotizaciones",
    enabled: false,
    url: "/cotizacion/:id",
    method: "PUT"
  },
  {
    modulo: "CRM",
    permiso: "Eliminar Cotizaciones",
    enabled: false,
    url: "/cotizacion/:id",
    method: "DELETE"
  },
  {
    modulo: "Cuentas Por Cobrar",
    permiso: "Ver clientes con saldo pendiente",
    enabled: false,
    url: "/venta/clientesConSaldo",
    method: "GET"
  },
  {
    modulo: "Cuentas Por Cobrar",
    permiso: "Ver total saldo pendiente",
    enabled: false,
    url: "/venta/saldoPendiente/todosLosTiempos",
    method: "GET"
  },
  {
    modulo: "Cuentas Por Cobrar",
    permiso: "Ver ventas con saldo de cada cliente",
    enabled: false,
    url: "/venta/ventasConSaldo/:clienteId",
    method: "GET"
  },
  {
    modulo: "Cuentas Por Cobrar",
    permiso: "Ver pagos de cada venta",
    enabled: false,
    url: "/cobro/:idVenta",
    method: "GET"
  },
  {
    modulo: "Cuentas Por Cobrar",
    permiso: "Registrar pagos de clientes",
    enabled: false,
    url: "/cobro/",
    method: "POST"
  },
  {
    modulo: "Cuentas Por Cobrar",
    permiso: "Eliminar pagos de clientes",
    enabled: false,
    url: "/cobro/:cobroId",
    method: "DELETE"
  },
  {
    modulo: "Mis requisiciones",
    permiso: "Crear Requisiciones",
    enabled: false,
    url: "/requisicion/",
    method: "POST"
  },
  {
    modulo: "Mis requisiciones",
    permiso: "Eliminar requisiciones sin aprobar",
    enabled: false,
    url: "/requisicion/:id",
    method: "DELETE"
  },
  {
    modulo: "Aprobaciones",
    permiso: "Ver requisiciones por aprobar",
    enabled: false,
    url: "/requisicion/porAprobar",
    method: "GET"
  },
  {
    modulo: "Aprobaciones",
    permiso: "Aprobar/Rechazar Requisiciones",
    enabled: false,
    url: "/requisicion/:id",
    method: "PUT"
  },
  {
    modulo: "Compras",
    permiso: "Crear ordenes de compra",
    enabled: false,
    url: "/compra/",
    method: "POST"
  },
  {
    modulo: "Compras",
    permiso: "Ver requisiciones aprobadas",
    enabled: false,
    url: "requisicion/aprobadas",
    method: "GET"
  },
  {
    modulo: "Compras",
    permiso: "Ver compras",
    enabled: false,
    url: "/compra/",
    method: "GET"
  },
  {
    modulo: "Compras",
    permiso: "Editar ordenes de compra",
    enabled: false,
    url: "/compra/:id",
    method: "PUT"
  },
  {
    modulo: "Compras",
    permiso: "Eliminar ordenes de compra",
    enabled: false,
    url: "/compra/:id",
    method: "DELETE"
  },
  {
    modulo: "Compras",
    permiso: "Registrar pago a proveedor",
    enabled: false,
    url: "/pago/",
    method: "POST"
  },
  {
    modulo: "Cuentas Por Pagar",
    permiso: "Ver proveedores con saldo",
    enabled: false,
    url: "/compra/proveedoresConSaldo",
    method: "GET"
  },
  {
    modulo: "Cuentas Por Pagar",
    permiso: "Ver saldo pendiente total",
    enabled: false,
    url: "/compra/saldoPendiente/todosLosTiempos",
    method: "GET"
  },
  {
    modulo: "Cuentas Por Pagar",
    permiso: "Ver compras con saldo de cada proveedor",
    enabled: false,
    url: "/compra/comprasConSaldo/:proveedorId",
    method: "GET"
  },
  {
    modulo: "Cuentas Por Pagar",
    permiso: "Ver pagos de cada compra",
    enabled: false,
    url: "/pago/:idCompra",
    method: "GET"
  },
  {
    modulo: "Cuentas Por Pagar",
    permiso: "Eliminar pago a proveedor",
    enabled: false,
    url: "/pago/:pagoId",
    method: "DELETE"
  },
  {
    modulo: "Gastos",
    permiso: "Ver Gastos",
    enabled: false,
    url: "/gasto/",
    method: "GET"
  },
  {
    modulo: "Gastos",
    permiso: "Registrar Gastos",
    enabled: false,
    url: "/gasto/",
    method: "POST"
  },
  {
    modulo: "Gastos",
    permiso: "Editar Gastos",
    enabled: false,
    url: "/gasto/:gastoId",
    method: "PUT"
  },
  {
    modulo: "Gastos",
    permiso: "Eliminar Gastos",
    enabled: false,
    url: "/gasto/:gastoId",
    method: "DELETE"
  },
  {
    modulo: "Permisos",
    permiso: "Ver permisos de usuarios",
    enabled: false,
    url: "/permisos/:userId",
    method: "GET"
  },
  {
    modulo: "Permisos",
    permiso: "Editar permisos de usuarios",
    enabled: false,
    url: "/permisos/:userId",
    method: "PUT"
  }
];