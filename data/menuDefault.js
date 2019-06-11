module.exports.MENU_DEFAULT = [
  {
    modulo: "Vender",
    icono: "mdi mdi-cart",
    url: "/catalogoProductos",
    show: false
  },
  {
    modulo: "Ventas",
    icono: "mdi mdi-cash-usd",
    url: "/reporteVentas",
    show: false,
    submenu: [
      { titulo: "CRM", url: "/crm", show: false },
      { titulo: "Reporte de Ventas", url: "/reporteVentas", show: false },
      {
        titulo: "Catálogo de Productos",
        url: "/catalogoProductos",
        show: false
      },
      { titulo: "Cuentas por cobrar", url: "/cuentasPorCobrar", show: false }
    ]
  },
  {
    modulo: "Compras",
    icono: "mdi mdi-tag-text-outline",
    url: "/requisiciones",
    show: false,
    submenu: [
      { titulo: "Requisiciones", url: "/requisiciones", show: false },
      { titulo: "Aprobaciones", url: "/aprobaciones", show: false },
      { titulo: "Compras", url: "/compras", show: false },
      { titulo: "Cuentas por pagar", url: "/cuentasPorPagar", show: false }
    ]
  },
  {
    modulo: "Gastos",
    icono: "ti-wallet",
    url: "/gastos",
    show: false,
    submenu: [
      { titulo: "Registro de gastos", url: "/gastos", show: false },
      { titulo: "Reporte de gastos", url: "/reporteDeGastos", show: false }
    ]
  },
  {
    modulo: "Inventario",
    icono: "mdi mdi-package-variant-closed",
    url: "/inventarioTienda",
    show: false,
    submenu: [
      { titulo: "Inventario tienda", url: "/inventarioTienda", show: false }
    ]
  },
  {
    modulo: "Equipo",
    icono: "mdi mdi-account-multiple",
    url: "/nomina",
    show: false,
    submenu: [
      { titulo: "Nomina", url: "/nomina", show: false },
      { titulo: "Usuarios", url: "/usuarios", show: false }
    ]
  },
  {
    modulo: "Configuración",
    icono: "mdi mdi-settings",
    url: "/permisosDeUsuario",
    show: false,
    submenu: [
      { titulo: "Permisos", url: "/permisosDeUsuario", show: false },
      {
        titulo: "Configuración de menú",
        url: "/configuracionDeMenu",
        show: false
      }
    ]
  }
]; 

module.exports.MENU_DEFAULT_ADMIN = [
    {
        modulo: "Vender",
        icono: "mdi mdi-cart",
        url: "/catalogoProductos",
        show: true
    },
    {
        modulo: "Ventas",
        icono: "mdi mdi-cash-usd",
        url: "/reporteVentas",
        show: true,
        submenu: [
            { titulo: "CRM", url: "/crm", show: true },
            { titulo: "Reporte de Ventas", url: "/reporteVentas", show: true },
            { titulo: "Catálogo de Productos", url: "/catalogoProductos", show: true },
            { titulo: "Cuentas por cobrar", url: "/cuentasPorCobrar", show: true }
        ]
    },
    {
        modulo: "Compras",
        icono: "mdi mdi-tag-text-outline",
        url: "/requisiciones",
        show: true,
        submenu: [
            { titulo: "Requisiciones", url: "/requisiciones", show: true },
            { titulo: "Aprobaciones", url: "/aprobaciones", show: true },
            { titulo: "Compras", url: "/compras", show: true },
            { titulo: "Cuentas por pagar", url: "/cuentasPorPagar", show: true }
        ]
    },
    {
        modulo: "Gastos",
        icono: "ti-wallet",
        url: "/gastos",
        show: true,
        submenu: [
            { titulo: "Registro de gastos", url: "/gastos", show: true },
            { titulo: "Reporte de gastos", url: "/reporteDeGastos", show: true }
        ]
    },
    {
        modulo: "Inventario",
        icono: "mdi mdi-package-variant-closed",
        url: "/inventarioTienda",
        show: true,
        submenu: [
            { titulo: "Inventario tienda", url: "/inventarioTienda", show: true }
        ]

    },
    {
        modulo: "Equipo",
        icono: "mdi mdi-account-multiple",
        url: "/nomina",
        show: true,
        submenu: [
            { titulo: "Nomina", url: "/nomina", show: true },
            { titulo: "Usuarios", url: "/usuarios", show: true }
        ]
    },
    {
        modulo: "Configuración",
        icono: "mdi mdi-settings",
        url: "/permisosDeUsuario",
        show: true,
        submenu: [
            { titulo: "Permisos", url: "/permisosDeUsuario", show: true },
            { titulo: "Configuración de menú", url: "/configuracionDeMenu", show: true }
        ]
    }
];


