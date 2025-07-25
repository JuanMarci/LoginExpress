const express = require('express')
const app = express()
const port = 3000
// Get the client
const mysql = require('mysql2/promise');
const cors = require('cors')
const session = require('express-session')

app.use(cors({
  origin: 'http://localhost:5173', // Cambia esto a la URL de tu frontend
  credentials: true
}));
app.use(session({
  secret: 'ffdgfhbvnvjkjmnvmnxc',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false // pon true si usas HTTPS
  }
}));

// Create the connection to database
const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'login',
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/login', async (req, res) => { //req = request, peticion; res = response, respuesta
  const datos = req.query;
  // A simple SELECT query
try {
  const [results, fields] = await connection.query(
    "SELECT * FROM `usuarios` WHERE `nombre` = ? AND `clave` = ?",
    [datos.usuario, datos.clave]
  );
  if (results.length > 0) {
  req.session.usuario = results[0]; // Guarda el primer usuario que coincide
res.status(200).json({ mensaje: 'Inicio de sesión correcto', usuario: results[0] });

  res.status(200).json({ mensaje: 'Inicio de sesión correcto', usuario });
} else {
  res.status(401).json({ mensaje: 'Credenciales inválidas' });
}

  console.log(results); // results contains rows returned by server
  console.log(fields); // fields contains extra meta data about results, if available
} catch (err) {
  console.error('Error en login:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}
})
app.get('/validar', (req, res) => {
  if (req.session.usuario) {
    res.status(200).send('Sesión validada')
  } else {
    res.status(401).send('no autorizado')
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})