const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Folder = require('../models/Folder');

// Crear nueva carpeta
router.post('/folders', authMiddleware, async (req, res) => {
    try {
        const folder = new Folder({
            name: req.body.name,
            owner: req.user.uuid,
        });
        await folder.save();
        res.status(201).json(folder);
    } catch (err) {
        res.status(500).json({ message: 'Error al crear carpeta' });
    }
});

// Obtener carpetas del usuario
router.get('/folders', authMiddleware, async (req, res) => {
    try {
        const folders = await Folder.find({ owner: req.user.uuid }).sort({ createdAt: -1 });
        res.json(folders);
    } catch (err) {
        res.status(500).json({ message: 'Error al cargar carpetas' });
    }
});

module.exports = router;
