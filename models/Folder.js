const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: String, required: true }, // uuid del usuario
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Folder', folderSchema);
