const mongoDB = require('../db');
const logger = require('../utils/logger');
const ObjectId = require('mongodb').ObjectId;

const saveTransactions = async function (request, response) {
    const dbName = "transactions";
    const collectionName = "Transactions";
    const collectionName1 = "Receipts";

    var client = await mongoDB.getDb();
    const db = client.db(dbName);
    var collection = db.collection(collectionName);
    var collection1 = db.collection(collectionName1);

    let input = { receipt: request.params.transactionHash, type: request.params.type, amount: request.params.amount, paymentID: request.params.paymentID };

    collection1.insertOne(input, (insertCollectionErr, __result) => {
        if (insertCollectionErr) {
            logger.error(`Unable to insert document to the collection "${collectionName}". Error: ${insertCollectionErr}`);
            response.send({status: 'Error! Unsaved'});
        } else {
            logger.info(`Inserted document into the "${collectionName}" collection. The documents inserted with "_id" are: ${__result.insertedId}`);
            collection.updateOne({_id: ObjectId(request.params.paymentID)}, {$set: {paymentStatus: 'paid'}}, function(_updateCollectionErr, _update){
                if(_updateCollectionErr){
                    logger.log({
                        level: 'error',
                        message: `Failed update paymentStatus for payment ID : ${request.params.paymentID}. Error: ${_updateCollectionErr}`
                    })
                }
                else{
                    logger.log({
                        level: 'info',
                        message: `paymentStatus update for payment ID : ${request.params.paymentID}`
                    });
                }
            })
            response.send({status: 'Saved'});
        }
    })
}

module.exports = {
    saveTransactions
}