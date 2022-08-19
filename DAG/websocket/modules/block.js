const WebSocket = require('ws');
const { heartbeatWS } = require('../utils/basicUtils');

const block = async function (request, response) {
    const ws = new WebSocket('ws://localhost:6000');

    ws.on('open', function open() {
        heartbeatWS();
        ws.send(JSON.stringify({ type: 'block', data: request.params }));
    });

    ws.on('ping', function ping() {
        heartbeatWS();
    });

    ws.on('message', function message(data) {
        console.log(JSON.parse(data.toString()));
        // response.send(JSON.parse(data.toString()));
    });

    ws.on('close', function clear() {
        clearTimeout(this.pingTimeout);
    });
}

module.exports = {
    block
};