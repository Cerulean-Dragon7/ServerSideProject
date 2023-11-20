const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const dbName = 'sample_supplies';
const collectionName = 'sales';
const uri = 'mongodb+srv://test:test@cluster0.ef6my3k.mongodb.net/?retryWrites=true&w=majority';


let client = null;
let db = null;

async function connectToDatabase() {
    try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('Connected successfully to the MongoDB database server.');
    db = client.db(dbName);
    } catch (error) {
    console.error('Error connecting to MongoDB3:', error);
    throw error;
    }
}

function getClient() {
if (!client) {
    throw new Error('MongoDB client is not connected1.');
}
return client;
}

function getCollection(collectionName) {
    if (!db) {
        console.log(db)
        throw new Error('MongoDB database is not connected2.');
    }
    return db.collection(collectionName);
}

function closeConnection() {
if (client) {
    client.close();
    console.log('MongoDB connection closed.');
}
}

module.exports = {
    connectToDatabase,
    getClient,
    getCollection,
    closeConnection,
};