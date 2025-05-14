const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nombre: String,
    apellidos: String,
    pais: String,
    username: { type: String, unique: true },
    password: String,
    tarjeta: String,
    uuid: String,
});

module.exports = mongoose.model('User', userSchema);
