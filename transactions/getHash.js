const mongoDB = require('../db');
const logger = require('../utils/logger');
const ObjectId = require('mongodb').ObjectId;

const getHash = function (request, response) {
    const dbName = "transactions";
    const collectionName = "Signed Transactions";
    const collectionName1 = "Receipts";

    var client = mongoDB.getDb();
    const db = client.db(dbName);
    var collection = db.collection(collectionName);
    var collection1 = db.collection(collectionName1);

    let input = { transaction_id: request.params.transaction_id };

    collection.findOne({ _id: ObjectId(request.params.transaction_id) }, function (queryCollectionErr, result) {
        if (queryCollectionErr) { 
            response.send({ status:'error', error: 'Error happened. Please contact support or try later.' });
        }
        else if (!result) {
            collection1.findOne(input, function (queryCollectionErr1, result1) {
                if (queryCollectionErr1) {
                    logger.error(`Unable to query document(s) on the collection "${collectionName1}". Error: ${queryCollectionErr1}`);
                    response.send({ status:'error', error: 'Error happened. Please contact support or try later.' });
                } else {
                    response.send({ status: 'success', detail: 'Transaction is being sucess', transactionHash: result1.receipt });
                }
            });
        }
        else{
            response.send({ status: 'pending', detail: 'Transaction is being processed' });
        }
    });
}

module.exports = {
    getHash
}