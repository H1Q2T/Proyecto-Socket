const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('File', fileSchema);
