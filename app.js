const express = require('express');
const app = express();
const port = 3000;
const mysql = require('mysql2/promise');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');

// 🛡️ Middleware CORS y sesiones
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(session({
  secret: 'ffdgfhbvnvjkjmnvmnxc',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false // Cambia a true si usas HTTPS
  }
}));
app.use(express.json());

// 🔗 Conexión a la base de datos
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'login'
});

// 🌐 Ruta base
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 🔐 Endpoint de Login
app.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;
  try {
    const [results] = await connection.query(
      'SELECT * FROM usuarios WHERE nombre = ?',
      [usuario]
    );

    if (results.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const coincide = await bcrypt.compare(clave, results[0].clave);
    if (!coincide) {
      return res.status(401).json({ mensaje: 'Clave incorrecta' });
    }

    req.session.usuario = results[0];
    res.status(200).json({ mensaje: 'Inicio de sesión correcto', usuario: results[0] });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// 🆕 Endpoint de Registro
app.post('/registro', async (req, res) => {
  const { usuario, clave } = req.body;
  try {
    const [existe] = await connection.query(
      'SELECT * FROM usuarios WHERE nombre = ?',
      [usuario]
    );

    if (existe.length > 0) {
      return res.status(400).send('Usuario ya existe');
    }

    const claveSegura = await bcrypt.hash(clave, 10);
    await connection.query(
      'INSERT INTO usuarios (nombre, clave) VALUES (?, ?)',
      [usuario, claveSegura]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).send('Error al registrar usuario');
  }
});

// 🔎 Validar sesión
app.get('/validar', (req, res) => {
  if (req.session.usuario) {
    res.status(200).send('Sesión validada');
  } else {
    res.status(401).send('No autorizado');
  }
});

// 🚀 Lanzar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});