const mongoDB = require('../db');
const logger = require('../utils/logger');

const saveTransactions = function (request, response) {
    const dbName = "transactions";
    const collectionName = "Receipts";

    var client = mongoDB.getDb();
    const db = client.db(dbName);
    var collection = db.collection(collectionName);

    let input = { receipt: request.params.transactionHash, type: request.params.type, amount: request.params.amount, gasUsed: request.params.gasUsed, status: request.params.status ? 'success' : 'failed', transferToSeller: false };

    collection.insertOne(input, (insertCollectionErr, __result) => {
        if (insertCollectionErr) {
            logger.error(`Unable to insert document to the collection "${collectionName}". Error: ${insertCollectionErr}`);
            response.send({status: 'Error! Unsaved'});
        } else {
            logger.info(`Inserted document into the "${collectionName}" collection. The documents inserted with "_id" are: ${__result.insertedId}`);
            response.send({status: 'Saved'});
        }
    })
}

module.exports = {
    saveTransactions
}