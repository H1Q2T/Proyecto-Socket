const { BehaviorSubject } = require('rxjs');

const userSession$ = new BehaviorSubject(0);

function userConnected() {
    userSession$.next(userSession$.value + 1);
}

function userDisconnected() {
    userSession$.next(userSession$.value - 1);
}

module.exports = {
    userSession$,
    userConnected,
    userDisconnected
};
