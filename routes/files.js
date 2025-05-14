const express = require('express');
const multer = require('multer');
const File = require('../models/File');
const authMiddleware = require('../middleware/authMiddleware');
const { encrypt, decrypt } = require('../utils/encryption');

const router = express.Router();
const upload = multer();

// SUBIR ARCHIVO (con carpeta)
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
    const { originalname, buffer } = req.file;
    const encrypted = encrypt(buffer.toString());
    const folder = req.body.folderId || null;

    try {
        const file = new File({
            userId: req.user.uuid,
            name: originalname,
            content: JSON.stringify(encrypted),
            folder: folder, // soporte para carpetas
        });

        await file.save();
        res.status(201).json({ message: 'Archivo subido correctamente' });

    } catch (err) {
        res.status(500).json({ message: 'Error al subir archivo' });
    }
});

// OBTENER ARCHIVOS (filtrado por carpeta)
router.get('/files', authMiddleware, async (req, res) => {
    try {
        const filter = {
            userId: req.user.uuid,
        };

        if (req.query.folderId && req.query.folderId !== 'root') {
            filter.folder = req.query.folderId;
        } else {
            filter.folder = null;
        }

        const files = await File.find(filter);
        res.json(files);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener archivos' });
    }
});

// DESCARGAR ARCHIVO
router.get('/download/:id', authMiddleware, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file || file.userId !== req.user.uuid)
            return res.status(403).json({ message: 'Acceso denegado' });

        const decrypted = decrypt(JSON.parse(file.content));

        res.set({
            'Content-Disposition': `attachment; filename="${file.name}"`,
            'Content-Type': 'text/plain'
        });
        res.send(decrypted);
    } catch (err) {
        res.status(500).json({ message: 'Error al descargar archivo' });
    }
});

// ELIMINAR ARCHIVO
router.delete('/delete/:id', authMiddleware, async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file || file.userId !== req.user.uuid)
            return res.status(403).json({ message: 'Acceso denegado' });

        await file.deleteOne();
        res.json({ message: 'Archivo eliminado' });

    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar archivo' });
    }
});

module.exports = router;
