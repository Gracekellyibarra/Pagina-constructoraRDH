// server.js - Archivo principal del Backend
const express = require('express');
const cors = require('cors');
const path = require('path');

// 💡 CORRECCIÓN DE RUTA: Apunta a src/controller/
const solicitudController = require('./src/controller/solicitud.controller');

// 💡 MODIFICACIÓN: Importa el controlador de Usuarios (Registro/Login)
const userController = require('./src/controller/user.controller');

// 💡 CORRECCIÓN DE RUTA: Apunta a src/config/
const db = require('./src/config/database'); // Importa la conexión para inicializar Sequelize

const app = express();
const PORT = 3001; // Puerto del servidor Express

// --- CONFIGURACIÓN DE MIDDLEWARE ---
app.use(cors());
app.use(express.json()); // Permite a Express leer JSON en el cuerpo de las peticiones

// CONFIGURAR ARCHIVOS ESTÁTICOS
// Esto sirve los archivos HTML, CSS e imágenes (asumiendo que están en la carpeta 'public')
app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS DE API (Backend) ---
app.post('/api/solicitudes', solicitudController.registrarCotizacion); // Ruta de solicitudes
app.post('/api/contacto', solicitudController.handleSimpleContact); // Ruta de contacto
app.post('/api/usuarios/registro', userController.registrarUsuario); // Ruta de registro de nuevo usuario
app.post('/api/usuarios/login', userController.loginUsuario); // ← NUEVA RUTA

// ✅ NUEVAS RUTAS PARA ADMIN
app.get('/api/usuarios', userController.obtenerUsuarios); // Listar todos
app.put('/api/usuarios/:id', userController.actualizarUsuario); // Editar
app.delete('/api/usuarios/:id', userController.eliminarUsuario); // Borrar
app.get('/api/solicitudes/all', solicitudController.obtenerSolicitudes); // Listar solicitudes

// Ruta de prueba
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.send('Servidor activo ✅. Acceda a /index.html o /calculadora.html');
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
