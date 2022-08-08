const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

let _client;
const password = process.env.PASSWORD;
const cluster = process.env.CLUSTER;

module.exports = {
    dbConn: async function (callback) {

        const mongoClient = new MongoClient(`mongodb+srv://backend:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        mongoClient.connect(function (err, client) {
            _client = client;
            return callback(err, client);
        });
    },
    getDb: function () {
        if (typeof _client === 'undefined') {
            console.log(_client);
            const mongoClient = new MongoClient(`mongodb+srv://backend:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
            );
            mongoClient.connect(function (err, client) {
                console.log(err);
                console.log(client);
                console.log(mongoClient);
                if (err) {
                    console.log(err);
                }
                else {
                    _client = client;
                    console.log(client);
                    return client;
                }
            });
        }
        else {
            return _client;
        }
    }
}