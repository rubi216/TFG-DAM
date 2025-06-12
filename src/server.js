const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { error } = require('console');
const multer = require('multer');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'resources');
    },

    filename: (req, file, cb) => {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/resources', express.static(path.join(__dirname, 'resources')));

const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'usuarios' });

const SECRET_KEY = "6701a247-6df2-41dc-833d-96342acc83f6";

function verificarToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({ error: "Token requerido" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token inválido" });
        }
        req.user = decoded; // Guardamos los datos del usuario en la request
        next();
    });
};

app.post('/register', async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) {
        return res.status(400).json({ error: "Introduzca los datos en todos los campos." });
    }

    // Para encriptar la contraseña con bcrypt
    const hashedpass = await bcrypt.hash(pass, 10);

    db.query("INSERT INTO users (user, pass) VALUES (?, ?)", [user, hashedpass], (err, result) => {
        if (err) {
            console.error("Error al registrar el usuario: ", err);
            return res.status(500).json({ error: "Error al registrar el usuario." });
        }
        res.status(201).json({ success: true, message: `Usuario ${user} creado correctamente.` });
    });
});

app.post('/login', async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) {
        return res.status(400).json({ error: "Introduzca los datos en todos los campos." });
    }

    db.query("SELECT * FROM users WHERE user = ?", [user], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(401).json({ error: "Datos incorrectos." });
        }
        const user = result[0];
        const isOK = await bcrypt.compare(pass, user.pass);
        if (!isOK) {
            return res.status(401).json({ error: "Datos incorrectos." });
        }

        const token = jwt.sign({ id: user.id, user: user.user, pass: user.pass }, SECRET_KEY, { expiresIn: '10h' });

        console.log(`Usuario ${user.user} logeado correctamente.`);
        res.status(200).json({ success: true, message: `Usuario ${user.user} logeado correctamente.`, token });
    });
});

app.get('/getUser/:userID', verificarToken, async (req, res) => {
    const userID = req.params.userID;

    db.query("SELECT * FROM users WHERE id = ?", [userID], async (err, result) => {
        if(err) {
            return res.status(400).json({ error: "Error al obtener el usuario" });
        }
        res.status(202).json(result[0]);
    });
});

app.post('/addCar', verificarToken, upload.single('foto'), (req, res) => {
    const { userID, matricula, marca, modelo, kilometros, year, kmUltimoMantenimiento, kmIntervalo, fechaUltimoMantenimiento, fechaIntervalo, descripcion } = req.body;
    const foto = req.file?.filename;

    const sql = "INSERT INTO cars (user_id, matricula, marca, modelo, kilometros, year, kmUltimoMantenimiento, kmIntervalo, fechaUltimoMantenimiento, fechaIntervalo, descripcion, foto) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [userID, matricula.toUpperCase(), (marca.charAt(0).toUpperCase() + marca.slice(1)), (modelo.charAt(0).toUpperCase() + modelo.slice(1)), kilometros, year, kmUltimoMantenimiento, kmIntervalo, fechaUltimoMantenimiento, fechaIntervalo, descripcion, foto], (err, result) => {
        if (err) {
            console.log("Error al guardar el coche", err);
            return res.status(500).json({ error: "Error al guardar los datos." });
        }
        res.status(201).json({ success: true, message: `Coche ${matricula} guardado correctamente.`, user: req.user });
    });
});

app.get('/getCars/:userID', verificarToken, (req, res) => {
    const userID = req.params.userID;

    db.query("SELECT * FROM cars WHERE user_id = ?", [userID], (err, result) => {
        if (err) {
            console.error("Error obteniendo coches", err);
            return res.status(500).json({ error: "Error al obtener los coches" });
        }
        console.log("Coches obtenidos: ", result);
        res.status(200).json(result);
    });
});

app.get('/getCar/:id', verificarToken, (req, res) => {
    const carID = req.params.id;

    db.query("SELECT * FROM cars WHERE id = ?", [carID], (err, result) => {
        if (err) {
            console.error("Error obteniendo coche", err);
            return res.status(500).json({ error: "Error al obtener el coche" });
        }
        console.log("Coche obtenido: ", result);
        res.status(201).json(result[0]);
    });
});

app.post('/modifyCar/:id', verificarToken, upload.single('foto'), (req, res) => {
    const carID = req.params.id;
    const foto = req.file?.filename;
    const inputs = {};
    if (req.body.matricula) {inputs.matricula = req.body.matricula.toUpperCase()};
    if (req.body.marca) {inputs.marca = req.body.marca.charAt(0).toUpperCase() + req.body.marca.slice(1)};
    if (req.body.modelo) {inputs.modelo = req.body.modelo.charAt(0).toUpperCase() + req.body.modelo.slice(1)};
    if (req.body.kilometros) {inputs.kilometros = req.body.kilometros};
    if (req.body.year) {inputs.year = req.body.year};
    if (req.body.kmUltimoMantenimiento) {inputs.kmUltimoMantenimiento = req.body.kmUltimoMantenimiento};
    if (req.body.kmIntervalo) {inputs.kmIntervalo = req.body.kmIntervalo};
    if (req.body.fechaUltimoMantenimiento) {inputs.fechaUltimoMantenimiento = req.body.fechaUltimoMantenimiento};
    if (req.body.fechaIntervalo) {inputs.fechaIntervalo = req.body.fechaIntervalo};
    if (req.body.descripcion) {inputs.descripcion = req.body.descripcion};

    if (foto) {inputs.foto = foto};

    if (Object.keys(inputs).length === 0) {
        return res.status(400).json({ error: "No hay nada que actualizar" });
    };

    const setInputs = Object.keys(inputs).map(key => `${key} = ?`).join(', ');

    const values = Object.values(inputs);
    values.push(carID);


    db.query(`UPDATE cars SET ${setInputs} WHERE id = ?`, values, (err, result) => {
        if(err) {
            console.error("Error al modificar el coche", err);
            return res.status(500).json({ error: "Error al modificar el coche" });
        }
        console.log("Coche modificado", result);
        res.status(202).json({ success: true, message: 'Coche modificado correctamente.', user: req.user });
    });
});

app.delete('/deleteCar/:id', verificarToken, (req, res) => {
    const carID = req.params.id;

    db.query("DELETE FROM cars WHERE id = ?", [carID], (err, result) => {
        if(err) {
            console.error("Error al eliminar el coche", err);
            return res.status(500).json({ error: "Error al eliminar el coche" });
        }
        console.log("Coche eliminado", result);
        res.status(200).json({ success: true, message: `Coche eliminado correctamente.`, user: req.user });
    });
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});