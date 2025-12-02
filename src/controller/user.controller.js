// src/controller/user.controller.js - Maneja el registro y login de usuarios del sistema
// 💡 CORRECCIÓN: Importamos el modelo 'Usuario' (que mapea a la tabla 'usuario')
const { Usuario } = require('../config/database');
const bcrypt = require('bcrypt');
const saltRounds = 10; // Nivel de seguridad del hash

async function registrarUsuario(req, res) {
  try {
    // Obtenemos 'nombres', 'correo_corp', etc., para coincidir con el HTML
    const { nombres, correo_corp, password, id_rol } = req.body;

    // 🛑 VALIDACIÓN: Aseguramos que el campo NOT NULL no sea nulo/vacío
    if (!nombres || nombres.trim() === '') {
      return res.status(400).json({ mensaje: 'El nombre completo es obligatorio.' });
    }

    // 1. Encriptar la contraseña
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 2. Crear el nuevo usuario en la tabla 'usuario'
    const nuevoUsuario = await Usuario.create({
      id_rol: id_rol,
      nombres: nombres,
      correo_corp: correo_corp,
      password_hash: password_hash,
      activo: true
    });

    // 3. Éxito: Enviar respuesta de creación exitosa
    return res.status(201).json({ mensaje: 'Usuario registrado con éxito.', usuario: { nombres: nuevoUsuario.nombres } });
  } catch (error) {
    // MUY IMPORTANTE: Imprimir el error real en la consola del servidor
    console.error('Error al registrar usuario:', error);

    // Manejo de error por correo duplicado
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ mensaje: 'El correo corporativo ya está registrado.' });
    }

    // Manejo de error genérico
    return res.status(500).json({ mensaje: 'Error interno del servidor al registrar el usuario. Verifique el log de Node.js.' });
  }
}

// Login: Verifica contraseña
async function loginUsuario(req, res) {
  try {
    const { correo_corp, password } = req.body;

    const usuario = await Usuario.findOne({ where: { correo_corp } });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // ✅ COMPARAR HASH
    const esValido = await bcrypt.compare(password, usuario.password_hash);
    if (!esValido) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({ 
      mensaje: 'Login exitoso',
      usuario: { id_usuario: usuario.id_usuario, nombres: usuario.nombres, correo_corp: usuario.correo_corp, id_rol: usuario.id_rol }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ OBTENER TODOS LOS USUARIOS
async function obtenerUsuarios(req, res) {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password_hash'] } // No devolver contraseña
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ACTUALIZAR USUARIO (nombre, correo, rol, activo)
async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombres, correo_corp, id_rol, activo } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.update({
      nombres: nombres || usuario.nombres,
      correo_corp: correo_corp || usuario.correo_corp,
      id_rol: id_rol || usuario.id_rol,
      activo: activo !== undefined ? activo : usuario.activo
    });

    res.json({ mensaje: 'Usuario actualizado', usuario });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ELIMINAR USUARIO
async function eliminarUsuario (req, res) {
  try {
    const { id } = req.params;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ EXPORTA TODAS LAS FUNCIONES
module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario
};
