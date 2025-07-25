const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const session = require('express-session');

const app = express();
const port = 3000;

// 🌐 Middleware CORS (habilita cookies cruzadas)
app.use(cors({
  origin: 'http://localhost:5173', // ajusta si cambias el puerto frontend
  credentials: true
}));

// 📦 Middleware para parsear JSON
app.use(express.json());

// 🔐 Sesiones
app.use(session({
  secret: 'tu_clave_secreta_segura_aquí', // cámbiala por seguridad
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true solo si usas HTTPS
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));

// 🔗 Base de datos
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // asegúrate de incluir contraseña si aplica
  database: 'login',
});

// 🟢 Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Servidor funcionando!');
});

// 🔐 Login
app.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;
  try {
    const [results] = await connection.query(
      "SELECT * FROM `usuarios` WHERE `nombre` = ? AND `clave` = ?",
      [usuario, clave]
    );
    if (results.length > 0) {
      req.session.usuario = results[0]; // guarda todo el objeto si deseas
      return res.status(200).json({ mensaje: 'Inicio de sesión correcto' });
    } else {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
  } catch (err) {
    console.error('🔴 Error en login:', err);
    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// 🔎 Validar sesión
app.get('/validar', (req, res) => {
  if (req.session.usuario) {
    return res.status(200).send('Sesión validada');
  }
  return res.status(401).send('No autorizado');
});

// 🔴 Logout (opcional, si lo usas en frontend)
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error al cerrar sesión');
    res.clearCookie('connect.sid');
    return res.status(200).send('Sesión cerrada');
  });
});

app.listen(port, () => {
  console.log(`✅ Backend corriendo en http://localhost:${port}`);
});