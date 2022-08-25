const mongoDB = require('../db');
const logger = require('../utils/logger');
const path = require('path');

const adminTransactions = async function (request, response) {
    const dbName = "Website";
    const dbName1 = "transactions";
    const collectionName = "Setting";
    const collectionName1 = "Transactions";

    const client = await mongoDB.getDb();
    const db = client.db(dbName);
    const db1 = client.db(dbName1);
    const collection = db.collection(collectionName);
    const collection1 = db1.collection(collectionName1);

    collection1.find({}).toArray(function (queryCollectionErr, result) {
        if (queryCollectionErr) {
            logger.error(`Error in query collection ${dbName}.${collectionName1}. Error: ${queryCollectionErr}`);
            result = [];
        }
        collection.find({}).toArray(function (_queryCollectionErr, _result) {
            if (_queryCollectionErr) {
                logger.log({
                    level: 'error',
                    message: `Error in query collection ${dbName}.${collectionName}. Error: ${_queryCollectionErr}`
                })
                logger.error(`Unable to query document(s) on the collection "${collectionName}". Error: ${_queryCollectionErr}`);
                response.render(path.join(path.resolve("."), '/public/templates/admin/manage-transactions.html'), {
                    page: 'transactions', transactions: result
                });

            } else if (_result.length) {
                response.render(path.join(path.resolve("."), '/public/templates/admin/manage-transactions.html'), { icon: _result[0].iconURI, title: _result[0].mp_title, description: _result[0].mp_description, page: 'transactions', transactions: result });

            }
            else {
                response.render(path.join(path.resolve("."), '/public/templates/admin/manage-transactions.html'), { page: 'transactions', transactions: result });
            }
        });
    });
}

module.exports = {
    adminTransactions
}