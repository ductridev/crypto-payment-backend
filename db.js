const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

let _client;
const password = process.env.PASSWORD;
const cluster = process.env.CLUSTER;

module.exports = {
    dbConn: async function () {

        _client = new MongoClient(`mongodb+srv://backend:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );

        await _client.connect();
    },
    getDb: async function () {
        if (typeof _client === 'undefined') {
            _client = new MongoClient(`mongodb+srv://backend:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
            );
            await _client.connect();

            return _client;
        }
        else {
            return _client;
        }
    }
}