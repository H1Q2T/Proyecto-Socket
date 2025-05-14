const { userConnected, userDisconnected, userSession$ } = require('../rx/tokenObservable');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Usuario conectado:', socket.id);
        userConnected();

        // Emitir número actual de usuarios conectados
        userSession$.subscribe((count) => {
            io.emit('userCount', count);
        });

        socket.on('disconnect', () => {
            console.log(' Usuario desconectado:', socket.id);
            userDisconnected();
        });
    });
};
