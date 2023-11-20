const express = require('express');
const assert = require('assert');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const app = express();

app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');

const SECRETKEY = 'I want to pass COMPS381F';

const users = new Array(
	{name: 'user1', password: 'usertest1'},
	{name: 'user2', password: 'usertest2'}
);

app.use(session({
    name: 'loginSession',
    keys: [SECRETKEY],
}));

//parsing post data to json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//middlewire
const header = (req, res, next) =>{
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
}
app.use(header);


const dbName = 'sample_supplies';
const collectionName = 'sales';
const uri = 'mongodb+srv://test:test@cluster0.ef6my3k.mongodb.net/?retryWrites=true&w=majority';
let client = new MongoClient(uri);
let database = null;

const dbconnection = async function() {
    try{
        await client.connect();
        console.log('Connected successfully to the MongoDB database server.');
        database = await client.db(dbName);
        console.log('Connected successfully to the database.');
    }catch(error){
        console.error('Error connecting to MongoDB:', error);
    }
}

const findDocument = async function(criteria, callback){
    try{
        await dbconnection();
        let cursor = await database.collection(collectionName).find(criteria).toArray();
        console.log(`findDocument: ${JSON.stringify(criteria)}`);
        if(cursor.length > 0){
            return callback(cursor);
        }
    }catch(error){
        console.error('Error of findDociment: ' , error);
    }
}

const createDocument = async function(body, callback){
    try{
        await dbconnection();
        let document = {};
        document["saleDate"] = new Date(body.date).toISOString();

        let items = [];

        for(let i = 0; i< body.item_name.length; i++){
            let item = {};
            item["name"] = body.item_name[i];
            item["price"] = parseFloat(body.item_price[i]);
            item["quantity"] = parseInt(body.item_quantity[i]);
            items.push(item);
        }

        document["items"] = items;
        document["storeLocation"] = body.storeLocation;

        let customer = {};
        customer["gender"] = body.gender;
        customer["age"] = parseInt(body.age);
        customer["email"] = body.email;
        customer["satisfaction"] = parseInt(body.satisfaction);
        document["customer"] = customer;

        document["couponUsed"] = JSON.parse(body.couponUsed);
        document["purchaseMethod"] = body.purchaseMethod;

        await database.collection(collectionName).insertOne(document);
        await closeConnection();
        callback(document);
    }catch(error){
        console.error('create docs error: ', error )
    }
}

/* {"gender":"F","age":"1","email":"ngky712@gmail.com","satisfaction":"3",
"storeLocation":"Seattle","couponUsed":"false","
purchaseMethod":"instore","item_name":["pens","backpack"],"
item_price":["0.04","0.1"],"item_quantity":["4","12"]}*/

const closeConnection = async function(){
    try{
        await client.close();
        console.log('Closed db connection');
    }catch(error){
        console.error('close connection error: ', error);
    }
}
app.get("/", (req,res) => {
    if(!req.session.authenticated){
        return res.redirect('/login');
    }
    else {
        return res.status(200).redirect('/home');
    }
});

app.get("/login", (req,res) => {
    if(req.session.authenticated){
        return res.redirect('/home');
    };
    return res.status(200).render('login');
});


//handle login information
app.post('/login', async (req, res) => {
    users.forEach((user) => {
        if(user.name == req.body.username && user.password == req.body.password){
            req.session.authenticated = true;
            req.session.username = req.body.name;
        }
    })
    if(!req.session.authenticated){
        res.render('login',{msg: 'wrong username or password'});
    }
    if(req.session.authenticated){ //render to home page
        await findDocument({},async function(docs){
            
            let total_order = 0;
            let order_online = 0;
            let order_store = 0;
            let order_phone = 0;
            docs.forEach(function (i){
                total_order += 1;
                switch(i.purchaseMethod){
                    case 'Online':
                        order_online +=1;
                        break;
                    case 'In store':
                        order_store +=1;
                        break;
                    case 'Phone':
                        order_phone +=1;
                        break;
                }
            })
            await closeConnection();
            res.render('home', {total_order,order_online,order_store,order_phone});
        });
        
    }
});

app.get('/logout', (req, res) => {
    req.session = null;
    closeConnection();
    return res.redirect('/login');
});

app.get("/create", (req, res) => {
    return res.status(200).render('create');
});

app.get("/find", (req, res) => {
    return res.status(200).render('find');
});

app.get("/home", async (req, res) => {
    await findDocument({},async function(docs){
        let total_order = 0;
        let order_online = 0;
        let order_store = 0;
        let order_phone = 0;
        docs.forEach(function (i){
            total_order += 1;
            switch(i.purchaseMethod){
                case 'Online':
                    order_online +=1;
                    break;
                case 'In store':
                    order_store +=1;
                    break;
                case 'Phone':
                    order_phone +=1;
                    break;
            }
        })
        await closeConnection();
        res.render('home', {total_order,order_online,order_store,order_phone});
    });

    
});

app.get("/test", (req, res) => {
    return res.status(200).render('test');
}); 

app.post("/create", async (req, res) => {
    createDocument(req.body,function(formated){
        console.log(formated);
        console.log('successful insert one data');
        res.status(200).render('create');
    });
}); 

const server = app.listen(process.env.PORT || 3000, () => {
    const port = server.address().port;
    console.log(`Server listening at port ${port}`);
});

