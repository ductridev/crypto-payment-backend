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
        const mongoClient = new MongoClient(`mongodb+srv://backend:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        );
        mongoClient.connect(function (err, client) {
            if (err) console.log(err);
            _client = client;
            console.log(client);
            return client;
        });

        console.log(mongoClient);

        // if (typeof _client === 'undefined') {

        //     const mongoClient = new MongoClient(`mongodb+srv://backend:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`,
        //         {
        //             useNewUrlParser: true,
        //             useUnifiedTopology: true
        //         }
        //     );
        //     mongoClient.connect(function (err, client) {
        //         if (err) console.log(err);
        //         _client = client;
        //         console.log(client);
        //         return client;
        //     });
        // }
        // else {
        //     console.log(_client);
        //     return _client;
        // }
    }
}