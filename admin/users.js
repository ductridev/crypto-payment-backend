const mongoDB = require('../db');
const logger = require('../utils/logger');
const path = require('path');
const md5 = require('md5');
const nodemailer = require('nodemailer');
const ObjectId = require('mongodb').ObjectId; 
const dotenv = require('dotenv');

const adminUsers = async function (request, response) {
    const dbName = "Website";
    const collectionName = "Setting";

    var client = await mongoDB.getDb();
    const db = client.db(dbName);
    var collection = db.collection(collectionName);

    collection.find({}).toArray(function (queryCollectionErr, result) {
        if (queryCollectionErr) {
            logger.log({
                level: 'error',
                message: `Error in query collection ${dbName}.${collectionName}. Error: ${queryCollectionErr}`
            })
            logger.error(`Unable to query document(s) on the collection "${collectionName}". Error: ${queryCollectionErr}`);
            response.render(path.join(path.resolve("."), '/public/templates/admin/manage-users.html'), { page: 'users' });

        } else if (result.length) {
            response.render(path.join(path.resolve("."), '/public/templates/admin/manage-users.html'), { icon: result[0].iconURI, title: result[0].mp_title, description: result[0].mp_description, page: 'users' });

        }
        else {
            response.render(path.join(path.resolve("."), '/public/templates/admin/manage-users.html'), { page: 'users'});
        }
    });
}

module.exports = {
    adminUsers
}