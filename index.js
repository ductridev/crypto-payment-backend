const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const timeout = require('connect-timeout');
const Client = require('coinbase').Client;
const session = require('express-session')
const mustacheExpress = require('mustache-express');
const cron = require('node-cron');

const mongoDB = require('./db');
const DAG = require('./dag');
const WS = require('./DAG/websocket/Server');
const path = require('path');
const dotenv = require('dotenv');

const { logout } = require("./user/logout");
const { setting } = require("./user/setting");
const { index } = require("./user/index");
const { login, loginSubmit } = require("./user/login");
const { transactions } = require("./user/transactions");
const { wallet } = require("./user/wallet");
const { register, registerSubmit, registerSuccess, verifyEmail } = require("./user/register");

const { adminIndex } = require("./admin/index");
const { adminLogin, adminLoginSubmit } = require("./admin/login");
const { adminLogout } = require("./admin/logout");
const { adminSetting } = require("./admin/setting");
const { adminTransactions } = require("./admin/transactions");
const { adminUsers } = require("./admin/users");
const { adminDAG } = require('./admin/dag');

const { adminAuthenticate, userAuthenticate } = require('./utils/authencate');
const { getHash } = require('./transactions/getHash');
const { saveTransactions } = require('./transactions/saveTransactions');
const { exchangeFiat2Token } = require('./utils/exchangeFiat2Token');
const { exchangeToken2Fiat } = require('./utils/exchangeToken2Fiat');
const { getPayment } = require('./transactions/getPayment');
const { sendBCH } = require('./bch/send');

const { stats } = require('./DAG/websocket/modules/stats');
const { allBlock } = require('./DAG/websocket/modules/allBlock');
const { block } = require('./DAG/websocket/modules/block');
const { newBlock } = require('./DAG/websocket/modules/newBlock');
const { lastBlock } = require('./DAG/websocket/modules/lastBlock');

// let redisClient = createClient({ legacyMode: true });
// redisClient.connect().catch(console.error);

dotenv.config();

const init_mongoDB = async () => {
    await mongoDB.dbConn();
}

init_mongoDB();

DAG.initDAG();

const { exportDAG, importDAG } = require('./DAG/utils/ex&imDAG');

importDAG(DAG.getDAG());

const saveDAG = cron.schedule("*/30 * * * * *", async () => {
    const dag = DAG.getDAG();
    dag.dag_pushNewBlock('test', 'test', 'test', 'test');
    dag.dag_pushNewBlock('test1', 'test1', 'test1', 'test1');
    await exportDAG(dag);
})

saveDAG.start();


// Require the Routes API
// Create a Server and run it on the port 5000, 5001, 5002, 5003

const app = express();

app.engine('html', mustacheExpress());
app.set("view engine", "html");
app.set("views", path.join(path.resolve("."), '/public/templates/'));

var corsOptions = {
    // origin: ['https://crypto-payment.estar-solutions.com/', 'https://crypto-payment.estar-solutions.com'],
    origin: ['http://localhost:3000/', 'http://localhost:3000', 'https://crypto-payment.estar-solutions.com', 'https://crypto-payment.estar-solutions.com/'],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

/* handle middlewares*/
app.use(timeout('5s'));
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(responseTime());
app.use(session({
    // store: new RedisStore({ client: redisClient }),
    secret: 'dag crypto brigde',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1 * 60 * 60 * 1000
    }
}))
app.use(express.static(path.join(path.resolve("."), '/'), {
    extensions: ['html', 'htm'],
}));
app.use(function (req, res, next) {
    res.setHeader("Content-Security-Policy", "script-src * 'unsafe-inline'; style-src *; default-src *; media-src *;");
    return next();
});

app.get('/', function (request, response) {
    response.send('Silence is golden');
})
app.get('/transfer/', function (request, response) {
    response.send('Silence is golden');
})
app.get('/admin/login/', adminLogin);
app.post('/admin/login/submit', adminLoginSubmit);
app.get('/admin/logout', adminAuthenticate, adminLogout);
app.get('/admin/index', adminAuthenticate, adminIndex);
app.get('/admin/setting', adminAuthenticate, adminSetting);
app.get('/admin/manage-users', adminAuthenticate, adminUsers);
app.get('/admin/manage-transactions', adminAuthenticate, adminTransactions);
app.get('/admin/dag/', adminAuthenticate, adminDAG);
app.get('/register', register);
app.post('/register/submit', registerSubmit);
app.get('/register/emailVerify/:userID', verifyEmail);
app.get('/register/success', registerSuccess);
app.get('/login', login);
app.get('/user/login', login);
app.post('/user/login/submit', loginSubmit)
app.get('/user/index', userAuthenticate, index);
app.get('/user/logout', userAuthenticate, logout);
app.get('/user/setting', userAuthenticate, setting);
app.get('/user/manage-transactions', userAuthenticate, transactions);
app.get('/user/manage-wallet', userAuthenticate, wallet);

app.get('/transactions/getHash/:paymentID', getHash);
app.get('/transactions/save/:transactionHash/:type/:amount/:paymentID', saveTransactions);

app.get('/exchangeFiat2Token/:token/:currency/:amount', exchangeFiat2Token);
app.get('/exchangeToken2Fiat/:token/:currency/:amountTo', exchangeToken2Fiat);
app.get('/getPayment/:paymentID', getPayment);

app.get('/bch/send/:sellerAddress/:key/:amount', sendBCH);

app.get('/dag/stats', stats);
app.get('/dag/lastBlock', lastBlock);
app.get('/dag/block/:number', block);
app.get('/dag/allBlock', allBlock);
app.get('/dag/newBlock/:paymentID/:buyerAddress/:sellerAddress/:value', newBlock);
// Temporary disabled
// app.get('/coinbase/auth/', function (request, response) {
//     response.redirect('https://www.coinbase.com/oauth/authorize?response_type=code&client_id=2abb855bdd5b3a649f1f54a811b53f80832d2b6f4516758014c35de4ed576090&redirect_uri=http://127.0.0.1:5000/auth/coinbase/callback&scope=wallet:accounts:read,wallet:transactions:request,wallet:transactions:read');
// })
// app.get('/auth/coinbase/callback', function (request, response) {
//     response.redirect(`/coinbase/transaction/request/${request.query.code}`);
// })
// app.get('/coinbase/transaction/request/:code', function (request, response) {
//     let data = `grant_type=authorization_code&code=${request.params.code}&client_id=2abb855bdd5b3a649f1f54a811b53f80832d2b6f4516758014c35de4ed576090&client_secret=2ce487b3d23ad69799fc8684f9d97d849a65cff085922a135675b3c1d1b72415&redirect_uri=http://127.0.0.1:5000/auth/coinbase/callback`
//     axios.post('https://api.coinbase.com/oauth/token', data).then(async (res) => {
//         let result = await axios.get('https://api.coinbase.com/v2/user', {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `${res.data.token_type} ${res.data.access_token}`,
//                 'CB-VERSION': '2021-11-06',
//             }
//         })
//         console.log(result);
//         let result1 = await axios.post(`https://api.coinbase.com/v2/accounts/${result.data.data.id}/transactions/`, {
//             type: "request",
//             to: "trihdde170376@fpt.edu.vn",
//             amount: "0.001",
//             currency: "BTC",
//             description: `${result.data.data.name} requested you to send 0.001 BTC`
//         }, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `${res.data.token_type} ${res.data.access_token}`,
//                 'CB-VERSION': '2021-11-06',
//             }
//         })
//         console.log('result1' + result1);
//     }).catch((err) => {
//         console.log(err);
//     })
//     response.send('Silence is golden');
// })

app.get('/test', function (request, response) {
    var client = new Client({
        'apiKey': process.env.COINBASE_APIKEY,
        'apiSecret': process.env.COINBASE_APISECRET,
        'version': '2021-11-06',
        'strictSSL': false
    });

    client.getAccount('primary', function (err, account) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(account);
            account.requestMoney({
                'type': 'request',
                'to': 'bitdiddle@example.com',
                'amount': '0.1',
                'currency': 'BTC'
            }, function (_err, tx) {
                console.log(_err);
                console.log(tx);
            });
        }
    });
})
app.get('*', function (req, res) {
    res.status(404).send('Silence is golden');
});

// Require the Routes API  
// Create a Server and run it on the port 5000, 5001, 5002, 5003 => Temp disable
http.createServer(app).listen(process.env.PORT || 5000, function () {
    // Starting the Server at the port 5000
    console.log(`Server started at ${process.env.PORT || 5000}`);
})
// http.createServer(app).listen(process.env.PORT_BACKEND2 || 5001, function () {
//     // Starting the Server at the port 5001
// })
// http.createServer(app).listen(process.env.PORT_BACKEND3 || 5002, function () {
//     // Starting the Server at the port 5002
// })
// http.createServer(app).listen(process.env.PORT_BACKEND4 || 5003, function () {
//     // Starting the Server at the port 5003
// })

module.exports = app;