const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/User');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    const { nombre, apellidos, pais, username, password, tarjeta } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Usuario ya existe' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            nombre,
            apellidos,
            pais,
            username,
            password: hashedPassword,
            tarjeta,
            uuid: uuidv4()
        });

        await newUser.save();
        const token = jwt.sign({ uuid: newUser.uuid }, process.env.JWT_SECRET);
        res.status(201).json({ message: 'Usuario registrado', token });

    } catch (error) {
        res.status(500).json({ message: 'Error en el registro' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign({ uuid: user.uuid }, process.env.JWT_SECRET);
        res.status(200).json({ message: 'Login exitoso', token });

    } catch (error) {
        res.status(500).json({ message: 'Error en el login' });
    }
});

module.exports = router;
