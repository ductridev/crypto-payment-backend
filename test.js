// const Web3 = require('web3');
const ethers = require("ethers");
const ObjectId = require('mongodb').ObjectId;
const { Biconomy } = require('@biconomy/mexa');

const logger = require('./utils/logger');
var mongoDB = require('./db');

function test() {
    let biconomy = new Biconomy(new ethers.providers.InfuraProvider('kovan', '326c54692f744c85841911be8a4855f5'), {
        apiKey: process.env.ETH_BICONOMY_APIKEY,
        debug: false
    });

    // const provider = await RelayProvider.newProvider({ provider: process.env.INFURA_API || EthereumWeb3.currentProvider, config }).init();
    const EthereumWeb3 = new ethers.providers.Web3Provider(biconomy);

    // const ws = new WebSocket('ws://localhost:17214/');
    // const timer = setInterval(() => {
    //     if (ws.readyState === 1) {
    //         clearInterval(timer);
    //     }
    // }, 100);

    const dbName = "transactions";
    const collectionName = "Signed Transactions";
    const collectionName1 = "Receipts";

    var client = mongoDB.getDb();

    const db = client.db(dbName);
    var collection = db.collection(collectionName);
    var collection1 = db.collection(collectionName1);

    collection.find({ status: 'pending' }).toArray(async function (queryCollectionErr, result) {

        if (queryCollectionErr) {

            logger.error(`Unable to query document(s) on the collection "${collectionName}". Error: ${queryCollectionErr}`);

        } else if (result.length) {
            for (let i = 0; i < result.length; i++) {
                try {
                    let {hash} = await EthereumWeb3.sendTransaction(result[i].rawTransaction.toString("hex"));
                    let receipt = await EthereumWeb3.waitForTransaction(hash);

                    collection1.insertOne({ receipt: receipt.transactionHash, amount: result[i].amount, gasUsed: receipt.gasUsed, transaction_id: result[i]._id, status: receipt.status ? 'success' : 'failed' }, (insertCollectionErr, __result) => {
                        if (insertCollectionErr) {
                            logger.error(`Unable to insert document to the collection "${collectionName1}". Error: ${insertCollectionErr}`);
                        } else {
                            logger.info(`Inserted ${__result.length} documents into the "${collectionName1}" collection. The documents inserted with "_id" are: ${__result.insertedId}`);

                            // if (ws.readyState === 1) {
                            //     ws.onmessage((msg) => {
                            //         var jsonObject = JSON.parse(msg.data);
                            //         console.log(jsonObject);
                            //     });
                            //     ws.send(JSON.stringify('{"type":"ping"}'));
                            //     ws.send(JSON.stringify({ type: 'newSignedTransactions', transactionId: result[i]._id, transactionHash: _result.transactionHash, rawTransaction: result[i].rawTransaction, transactionType: result[i].type, amount: result[i].amount, from: _result.from, to: _result.to, gasUsed: _result.gasUsed, contractAddress: _result.contractAddress }));
                            // }
                            // else {
                            //     console.log('WebSocket not ready');
                            // }
                        }
                    })
                    collection.deleteOne({ _id: ObjectId(result[i]._id) }, function (err, obj) {
                        if (err) {
                            logger.error(`Unable to delete document inside the collection "${collectionName}" with ID: ${result[i]._id}. Error: ${err}`);
                        }
                        else if (obj) {
                            logger.info('Deleted - ', obj);
                        } else {
                            logger.info(`No document found with defined "${result[i]._id}" criteria!`);
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                }
            }
        }

    });
}

mongoDB.dbConn(function (err, client) {
    if (err) console.log(err);
    else {
        console.log('connected');
        test();
    }
});