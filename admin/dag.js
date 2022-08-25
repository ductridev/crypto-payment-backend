const mongoDB = require('../db');
const logger = require('../utils/logger');
const path = require('path');
const axios = require('axios');

const adminDAG = async function (request, response) {
    const dbName = "Website";
    const collectionName = "Setting";

    const client = await mongoDB.getDb();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    let dag;
    axios.get(process.env.API_URL + `/dag/allBlock/`).then(async (result) => {
        dag = result.data;
        // console.log(dag);
    }).catch(async (err) => {
        // console.log(err);
    });
    collection.find({}).toArray(function (_queryCollectionErr, _result) {
        if (_queryCollectionErr) {
            logger.log({
                level: 'error',
                message: `Error in query collection ${dbName}.${collectionName}. Error: ${_queryCollectionErr}`
            })
            response.render(path.join(path.resolve("."), '/public/templates/admin/DAG.html'), {
                page: 'DAG', dag: dag
            });

        } else if (_result.length) {
            response.render(path.join(path.resolve("."), '/public/templates/admin/DAG.html'), { icon: _result[0].iconURI, title: _result[0].mp_title, description: _result[0].mp_description, page: 'DAG', dag: dag });
        }
        else {
            response.render(path.join(path.resolve("."), '/public/templates/admin/DAG.html'), { page: 'DAG', dag: dag });
        }
    });
}

module.exports = {
    adminDAG
}