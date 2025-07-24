const express = require('express');
const app = express();
const port = 3000;

const mysql = require('mysql2/promise');
const cors = require('cors');
const session = require('express-session');

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'ffdgfhbvnvjkjmnvmnxc',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // pon true si usas https
    httpOnly: true
  }
}));

// Conexión a la base de datos
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // añade tu contraseña si aplica
  database: 'login'
});

// Ruta de inicio (puedes quitarla si no se usa)
app.get('/', (req, res) => {
  res.send('Servidor Express listo 🎯');
});

// Ruta de login (POST)
app.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;

  try {
    const [results] = await connection.query(
      "SELECT * FROM `usuarios` WHERE `nombre` = ? AND `clave` = ?",
      [usuario, clave]
    );

    if (results.length > 0) {
      req.session.usuario = usuario;
      res.status(200).json({ mensaje: 'Inicio de sesión correcto', usuario });
    } else {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
  } catch (err) {
    console.error('Error al hacer login:', err);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// Ruta para validar sesión
app.get('/validar', (req, res) => {
  if (req.session.usuario) {
    res.status(200).json({ mensaje: 'Sesión activa', usuario: req.session.usuario });
  } else {
    res.status(401).json({ mensaje: 'No autorizado' });
  }
});

// Escuchar en el puerto 3000
app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});