// src/config/database.js - Archivo de Conexión y Modelos DAO
const { Sequelize, DataTypes } = require('sequelize');

// ⚠️ AJUSTA ESTAS CREDENCIALES A TU CONFIGURACIÓN DE MYSQL ⚠️
const sequelize = new Sequelize('integrador', 'root', '', {
  // 💡 REVISA 'integrador' y 'root'
  host: 'localhost',
  port: 3307, // 👈 ¡CLAVE PARA XAMPP!
  dialect: 'mysql',
  logging: console.log, // Muestra consultas SQL
  define: { freezeTableName: true } // Evita que Sequelize pluralice
});

// DEFINICIÓN DE MODELOS DAO (Clientes y Solicitudes)
const Cliente = sequelize.define('Cliente', {
  id_cliente: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(120), allowNull: false },
  correo: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  telefono: { type: DataTypes.STRING(30) }
}, { tableName: 'cliente', timestamps: false });

const Solicitud = sequelize.define('Solicitud', {
  id_solicitud: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  descripcion: { type: DataTypes.TEXT, allowNull: false },
  estado: { type: DataTypes.ENUM('pendiente', 'procede', 'no procede'), defaultValue: 'pendiente' },
  canal_ingreso: { type: DataTypes.STRING(30), defaultValue: 'Web Contacto' },
  fecha_hora: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'solicitud', timestamps: false});

const CotizacionPreliminar = sequelize.define('CotizacionPreliminar', {
  id_cotizacion: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  monto_estimado: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
  parametros_resumen: { type: DataTypes.JSON }
}, { tableName: 'cotizacionpreliminar', timestamps: false });

// --- DEFINICIÓN DE MODELOS DE USUARIO Y ROLES ---
const Rol = sequelize.define('Rol', {
  id_rol: { type: DataTypes.TINYINT, primaryKey: true },
  nombre_rol: { type: DataTypes.STRING(40), allowNull: false, unique: true }
}, { tableName: 'rol', timestamps: false });

// 💡 MODELO CORREGIDO: Apunta al nombre de tabla 'usuario' (la tabla nueva y limpia)
const Usuario = sequelize.define('Usuario', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_rol: { type: DataTypes.TINYINT, allowNull: false },
  nombres: { type: DataTypes.STRING(80), allowNull: false },
  correo_corp: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING(255), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'usuario', timestamps: false });

// -----------------------------------------------------------------
// RELACIONES (Clientes y Solicitudes)
Cliente.hasMany(Solicitud, { foreignKey: 'id_cliente' });
Solicitud.belongsTo(Cliente, { foreignKey: 'id_cliente' });
Solicitud.hasOne(CotizacionPreliminar, { foreignKey: 'id_solicitud' });
CotizacionPreliminar.belongsTo(Solicitud, { foreignKey: 'id_solicitud' });

// RELACIONES (Usuarios y Roles)
Rol.hasMany(Usuario, { foreignKey: 'id_rol' }); // Usamos Usuario
Usuario.belongsTo(Rol, { foreignKey: 'id_rol' }); // Usamos Usuario

// BLOQUE DE CONEXIÓN Y SINCRONIZACIÓN
sequelize.authenticate()
  .then(() => {
    console.log("Conexión MySQL establecida. Sincronizando modelos...");
    // Usamos ALTER para actualizar la nueva tabla 'usuario' sin borrar las antiguas
    return sequelize.sync();
  })
  .then(() => {
    console.log("Modelos de BD sincronizados. ✅");
  })
  .catch(err => {
    console.error("Error FATAL al conectar/sincronizar la BD:", err.message);
    console.error("Asegúrese de que XAMPP esté iniciado en el puerto 3307 y que la BD 'integrador' exista.");
  });

module.exports = { sequelize, Cliente, Solicitud, CotizacionPreliminar, Rol, Usuario };
