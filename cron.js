var cron = require('node-cron');
const logger = require('./utils/logger');
const https = require('https');
const ethers = require("ethers");

var mongoDB = require('./db');

const updateTokenPriceInUSDTask = cron.schedule("*/15 * * * *", async () => {
    const options = {
        "method": "GET",
        "hostname": "rest.coinapi.io",
        "path": "/v1/exchangerate/USD?invert=true",
        "headers": { 'X-CoinAPI-Key': process.env.COINAPI_APIKEY }
    };
    const dbName = "TokenPrices";
    const collectionName = "Exchange Rates";

    var client = mongoDB.getDb();

    var request = https.request(options, function (response) {
        var chunks = [];
        response.on("data", function (chunk) {
            chunks.push(chunk);
        });
        response.on('end', function () {
            try {
                chunks = JSON.parse(Buffer.concat(chunks).toString());
                const db = client.db(dbName);
                var collection = db.collection(collectionName);
                chunks.rates.forEach((element) => {
                    let input = { lastUpdatedTime: element.time, assetIdQuote: element.asset_id_quote, rate: element.rate, assetIdBase: 'USD' };

                    collection.find({ assetIdQuote: element.asset_id_quote }).toArray(function (queryCollectionErr, result) {

                        if (queryCollectionErr) {

                            logger.error(`Unable to query document(s) on the collection "${collectionName}". Error: ${queryCollectionErr}`);

                        } else if (result.length) {

                            collection.updateOne({ assetIdQuote: element.asset_id_quote }, { $set: { lastUpdatedTime: element.time, rate: element.rate } }).then((obj) => {
                                if (obj) {
                                    logger.info('Updated - ', obj);
                                } else {
                                    logger.info(`No document found with defined "${element.asset_id_quote}" criteria!`);
                                }
                            }).catch((e) => {
                                logger.error(`Unable to update document to the collection "${collectionName}". Error: ${e}`);
                            });

                        } else {

                            collection.insertOne(input, (insertCollectionErr, result) => {
                                if (insertCollectionErr) {
                                    logger.error(`Unable to insert document to the collection "${collectionName}". Error: ${insertCollectionErr}`);
                                } else {
                                    logger.info(`Inserted ${result.length} documents into the "${collectionName}" collection. The documents inserted with "_id" are: ${result.insertedId}`);
                                }
                            });

                        }

                    });
                });
            } catch (apiResponeErr) {
                logger.error(`Unable to get data from API. Error: ${apiResponeErr}`);
            }
        });
    });

    request.end();
}, {
    scheduled: false,
});

const sendEthersToSeller = cron.schedule("* * * * *", async () => {
    const abi = process.env.CONTRACT_ABI;

    let userSigner = new ethers.Wallet(process.env.PRIVATE_KEY);

    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS,
        abi, userSigner);

    const dbName = "transactions";
    const collectionName = "Receipts";

    var client = mongoDB.getDb();
    const db = client.db(dbName);
    var collection = db.collection(collectionName);

    collection.find({ transferToSeller: false }).toArray(function (err, result) {
        if (err) {
            logger.error(`Unable to query document(s) on the collection "${collectionName}". Error: ${err}`);
        }
        else {
            if(result.length){
                for(let i = 0; i < result.length; i++){
                    contract.sendViaCall(result[i].sellerAddress, { value: ethers.utils.parseEther(result[i].amount), gasLimit: ethers.utils.hexlify(25000) });
                }
            }
        }
    });
})

console.log('Cron started');

// updateTokenPriceInUSDTask.start();
sendEthersToSeller.start();