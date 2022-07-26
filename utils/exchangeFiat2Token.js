const mongoDB = require('../db');
const logger = require('./logger');

const exchangeFiat2Token = async (request, response) => {
    const dbName = "TokenPrices";
    const collectionName = "Exchange Rates";

    var client = await mongoDB.getDb();
    const db = client.db(dbName);

    var collection = db.collection(collectionName);
    collection.findOne({ assetIdQuote: request.params.token, assetIdBase: request.params.currency }, function (queryCollectionErr, result) {
        if (queryCollectionErr) {
            logger.error(queryCollectionErr);
            logger.info('No token or currency found');
            response.send({ error: true, description: 'No token or currency match!' });
        }
        else {
            try {
                response.send({ amountTo: (request.params.amount / result.rate).toString() });
            }
            catch (e) {
                response.send({ e });
            }
        }
    })
}

module.exports = {
    exchangeFiat2Token
}