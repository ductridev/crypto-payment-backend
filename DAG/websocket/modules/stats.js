const WebSocket = require('ws');
const { heartbeatWS } = require('../utils/basicUtils');

const stats = async function (request, response) {
    const ws = new WebSocket('ws://localhost:6000');

    ws.on('open', function open() {
        heartbeatWS();
        ws.send(JSON.stringify({ type: 'stats' }));
    });

    ws.on('ping', function ping() {
        heartbeatWS();
    });

    ws.on('message', function message(data) {
        response.send(data);
    });

    ws.on('close', function clear() {
        clearTimeout(this.pingTimeout);
    });
}

module.exports = {
    stats
};