const { WebSocketServer } = require('ws');
const WebSocket = require('ws');
const DAG = require('../../dag');
const { heartbeatWSS } = require('./utils/basicUtils');
const crypto = require('crypto');

const wss1 = new WebSocketServer({
    port: 6000,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    },
    backlog: 100,
    clientTracking: true
});
const wss2 = new WebSocketServer({
    port: 6001,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    },
    backlog: 100,
    clientTracking: true
});

wss1.on('connection', function connection(ws, request) {
    ws.isAlive = true;
    ws.on('pong', heartbeatWSS);

    ws.id = crypto.randomUUID();

    console.log(`${ws.id} connecting to WebSocket Server 1`);

    ws.on('message', function message(data, isBinary) {
        if (ws.readyState === WebSocket.OPEN) {
            data = JSON.parse(data.toString());
            ws.params = data;
            if (data.type === 'lastBlock') {
                ws.send(JSON.stringify(DAG.getDAG().dag_getLastBlock()));
            }
            else if (data.type === 'allBlock') {
                ws.send(JSON.stringify(DAG.getDAG().dag_allBlock()));
            }
            else if (data.type === 'block') {
                ws.send(JSON.stringify(DAG.getDAG().dag_getBlock(parseInt(data.data.number))));
            }
            else if (data.type === 'stats') {
                ws.send(JSON.stringify(DAG.getDAG().dag_stats()));
            }
            else {
                ws.send('Invalid call!');
            }
        }
    });
});
const interval1 = setInterval(function ping() {
    wss1.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping();
    });
}, 30000);
wss1.on('close', function close() {
    clearInterval(interval1);
});

wss2.on('connection', function connection(ws, request) {
    ws.isAlive = true;
    ws.on('pong', heartbeatWSS);

    ws.id = crypto.randomUUID();

    console.log(`${ws.id} connecting to WebSocket Server 2`);

    ws.on('message', function message(data, isBinary) {
        if (ws.readyState === WebSocket.OPEN) {
            data = JSON.parse(data.toString());
            ws.params = data;
            if (data.type === 'newBlock') {
                ws.send(JSON.stringify(DAG.getDAG().dag_pushNewBlock(data.data.paymentID, data.data.buyerAddress, data.data.sellerAddress, data.data.value)));
            }
            else {
                ws.send('Invalid call!');
            }
        }
    });
});
const interval2 = setInterval(function ping() {
    wss2.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();

        ws.isAlive = false;
        ws.ping();
    });
}, 30000);
wss2.on('close', function close() {
    clearInterval(interval2);
});

module.exports = { wss1, wss2 };