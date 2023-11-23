const express = require('express');
const assert = require('assert');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const app = express();


app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');

const SECRETKEY = 'I want to pass COMPS381F';

const users = new Array(
	{name: 'user1', password: 'usertest1'},
	{name: 'user2', password: 'usertest2'}
);

const key_name_list = ['saleDate', 'items','storeLocation','customer','couponUsed','purchaseMethod']

//list of item with its tag
const taglist =new Array(
    {name: 'envelopes', tag: ['stationary', 'office', 'general']},
    {name:'notepad',tag:  ['office', 'writing', 'school']}, 
    {name: 'printer paper', tag:  ['office', 'stationary']}, 
    {name: 'laptop', tag:  ['electronics', 'school', 'office']}, 
    {name: 'pens', tag:  ['writing', 'office', 'school', 'stationary']},
    {name: 'binder', tag:  ['school', 'general', 'organization']}, 
    {name: 'backpack', tag:  ['school', 'travel', 'kids']});

app.use(session({
    name: 'loginSession',
    keys: [SECRETKEY],
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        httpOnly: true,
        expires: false
    },
}));

//parsing post data to json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//middlewire
// const header = (req, res, next) =>{
//     res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
//     next();
// }
// app.use(header);


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
        
        await closeConnection();
        return callback(cursor);
    }catch(error){
        await closeConnection();
        throw error;
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
            let tags = [];
            item["name"] = body.item_name[i];
            for(let j = 0;j <taglist.length;j++){
                if(body.item_name[i] == taglist[j].name){
                    console.log(taglist[j].name);
                    console.log(taglist[j].tag);
                    item['tags'] = taglist[j].tag;
                }
            }
            
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
        await closeConnection();
        console.error('create docs error: ', error )
    }
}

const updateDocument_id = async function(id, replacedoc , callback){
    try{
        await dbconnection();
        await database.collection(collectionName).replaceOne({'_id': new ObjectId(id)},replacedoc);
        callback();
    }catch(error){
        throw error;
    }
}

const updateDocument_date = async function(date, replacedoc , callback){
    try{
        await dbconnection();
        await database.collection(collectionName).updateOne({'saleDate': new Date(date)},replacedoc);
        callback();
    }catch(error){
        throw error;
    }
}

const deleteDocument_id = async function(id, callback){
    try{
        await dbconnection();
        await database.collection(collectionName).deleteOne({'_id': new ObjectId(id)});
        callback();
    }catch(error){
        throw error;
    }
}

const deleteDocument_email = async function(email, callback){
    try{
        await dbconnection();
        await database.collection(collectionName).deleteOne({'customer.email': email});
        callback();
    }catch(error){
        throw error;
    }
}

const deleteDocument_date = async function(date, callback){
    try{
        await dbconnection();
        await database.collection(collectionName).deleteOne({'customer.email': new Date(date)});
        callback();
    }catch(error){
        throw error;
    }
}

const closeConnection = async function(){
    try{
        await client.close();
        console.log('Closed db connection');
    }catch(error){
        console.error('close connection error: ', error);
    }
}

const isDateValid = (dateStr) =>{
    return !isNaN(new Date(dateStr));
}

const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const matchLocation = (str) => {
    let requestList = str.split('_');
    let locationList = [];

    for(let i in requestList){
        switch(requestList[i].toLowerCase()){
            case 'london':
                locationList.push('London');
                break;
            case 'sandiego':
                locationList.push('San Diego');
                break;
            case 'denver':
                locationList.push('Denver');
                break;
            case 'seattle':
                locationList.push('Seattle');
                break;
            case 'Austin': 
                locationList.push('Austin');
                break;
            case 'newyork': 
                locationList.push('New York');
                break;
            default:
                break;
        }
    }
    return locationList;
}

const matchPurchaseMethod = (str) =>{
    let requestList = str.split("_");
    let purchaseMethodList = []

    for(let i = 0; i<requestList.length;i++){
        switch(requestList[i].toLowerCase()){
            case 'instore':
                purchaseMethodList.push('In store');
                break;
            case 'online':
                purchaseMethodList.push('Online');
                break;
            case 'phone':
                purchaseMethodList.push('Phone');
                break;
            default:
                break;
        }
    }
    return purchaseMethodList
}

// <!-- location: ['London', 'San Diego', 'Denver', 'Seattle', 'Austin', 'New York']-->

const matchItem = (str) => {
    let requestList = str.split("_");
    let itemList = []

    for(let i = 0; i<requestList.length;i++){
        switch(requestList[i].toLowerCase()){
            case 'envelopes':
                itemList.push('Ienvelopes');
                break;
            case 'notepad':
                itemList.push('notepad');
                break;
            case 'printerpaper':
                itemList.push('printer paper');
                break;
            case 'laptop':
                itemList.push('laptop');
                break;
            case 'pens':
                itemList.push('pens');
                break;
            case 'binder':
                itemList.push('binder');
                break;
            case 'backpack':
                itemList.push('backpack');
                break;
            default:
                break;
        }
    }
    return itemList
}

const matchKey = (str) =>{
    const correctKey = ['storeLocation', 
    'customer', 'couponUsed', 'purchaseMethod'];
    
    for(let i =0;i<correctKey.length;i++){
        if(str == correctKey[i]){
            return true
        }
    }
    return false
}

//handle request
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

app.get("/find",async (req, res) => {
    let criteria ={};
    res.status(200).render('find');

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

app.post("/create", async (req, res) => {
    createDocument(req.body,function(formated){
        console.log(formated);
        console.log('successful insert one data');
        res.status(200).render('home');
    });
}); 

app.post("/find", async (req, res) =>{
    console.log('requset body:',req.body);
    let criteria = {};
    
    if('location' in req.body){
        if(Array.isArray(req.body.location)){
            criteria['storeLocation'] = {$in: req.body.location};
        }
        else{
            criteria['storeLocation'] = req.body.location;
        }
    }

    if('couponUsed' in req.body){
        criteria['couponUsed'] = JSON.parse(req.body.couponUsed);
    }

    if('purchaseMethod' in req.body){
        if(Array.isArray(req.body.purchaseMethod)){
            criteria['purchaseMethod'] = {$in: req.body.purchaseMethod};
        }
        else{
            criteria['purchaseMethod'] = req.body.purchaseMethod;
        }
    }

    if('item' in req.body){
        if(Array.isArray(req.body.item)){
            criteria['items.name'] = {$in: req.body.item};
        }
        else{
            criteria['items.name'] = req.body.item;
        }
    }

    if('tags' in req.body){
        if(Array.isArray(req.body.tags)){
            criteria['items.tags'] = {$in: req.body.tags};
        }
        else{
            criteria['items.tags'] = {$in: [req.body.tags]};
        }
    }

    if(req.body.date != ''){//current data from 2013-1-1 to 2017-12-31
        console.log(new Date(req.body.date+'T23:59:59'));
        criteria['saleDate'] = {$gte: new Date(req.body.date),$lt: new Date(req.body.date+'T23:59:59Z')};
    }

    console.log('criteria:',criteria);
    try{
        await findDocument(criteria, function(docs){
        console.log("find:", docs.length);
        res.render('find', {docs});
    }); 
    }catch(error){
        res.render('find');
    }

});

let updateDoc = {}

app.get('/update', async function(req,res){
    try{
        if(typeof req.query.id ==='string'){
            criteria = {};
            criteria['_id'] = new ObjectId(req.query.id);
            await findDocument(criteria, function(doc){
                console.log(doc[0]);
                console.log(doc[0].items[0]);
                updateDoc = doc[0];
                res.status(200).render('update',{doc});
            });
        }
        else{
            res.redirect('find')
        }

    }
    catch(error){
        updateDoc = {}
        console.log(error);
        res.redirect('find');
    }
    
});

app.post('/update', async function(req,res){
    console.log(updateDoc);
    console.log(req.body);
    
    let replacement = {};
    replacement['saleDate'] = updateDoc['saleDate'];

    let items =[];
    
    req.body.item_name.forEach(function(item, index){
        let itemObject = {};

        itemObject['name'] = item;
        
        for(let j = 0;j <taglist.length;j++){
            if(item == taglist[j].name){
                console.log(taglist[j].name);
                console.log(taglist[j].tag);
                item['tags'] = taglist[j].tag;
            }
        }

        itemObject['price'] = parseFloat(req.body.item_price[index]);
        itemObject['quantity'] = parseInt(req.body.item_quantity[index]);

        items.push(itemObject)
    });
    replacement['items'] = items;

    replacement['storeLocation'] = req.body.storeLocation;
    
    let customer = {};
    customer['gender'] = req.body.gender;
    customer['age'] = parseInt(req.body.age);
    customer['email'] = req.body.email;
    customer['satisfaction'] = parseInt(req.body.satisfaction);
    replacement['customer'] = customer;

    replacement['couponUsed'] = JSON.parse(req.body.couponUsed);
    replacement['purchaseMethod'] = req.body.purchaseMethod;

    console.log(replacement);
    console.log(updateDoc._id);
    try{
        updateDocument_id(updateDoc._id,replacement,() =>{
            console.log('update successful')
            res.redirect('home');
        })
    }catch(error){
        console.log(error)
        res.redirect('update?id='+updateDoc._id);
    }
});

app.get('/delete', function (req, res) {
    console.log(new ObjectId(req.query.id));
    try{
        deleteDocument_id(req.query.id, function(){
            console.log('delete successful');
            res.redirect('home');
        })
    }catch(error){
        console.log(error);
        res.redirect('find');
    }
});

//restful
//insert
//test:
/*  curl -X POST -H "ContentType: application/json" -d "{ \"items\": [ { \"name\": 
\"notepad\", \"price\": \"30.08\", \"quantity\": 1 }, { \"name\": \"binder\", \"price\": \"24.68\", 
\"quantity\": 7 } ], \"storeLocation\": \"Denver\", \"customer\": { \"gender\": \"M\" , \"age\": 51, 
\"email\": \"worbiduh@vowbu.cg\", \"satisfaction\": 5 }, \"couponUsed\": false, \"purchaseMethod\":
\"In store\" }" localhost:8099/api/insert  */
app.post('/api/insert',async function( req, res){

    try{

        let document = {};
        document["saleDate"] = new Date().toISOString();

        let items = [];
        //check the key items is vaild or not
        if(req.body.hasOwnProperty('items')){
            if(Array.isArray(req.body.items)){
                req.body.items.forEach(function(item){
                    if(typeof item ==='object'){
                        let item_object = [];
                        item_object['name'] = item.name;

                        for(let j = 0;j <taglist.length;j++){
                            if(item.name == taglist[j].name){
                                item['tags'] = taglist[j].tag;
                            }
                        }

                        item_object['price'] = parseFloat(item.price);
                        item_object['quantity'] = parseFloat(item.quantity);
                        items.push(item_object);
                    }else{
                        return res.send('In the items list all item need to be a object');
                    }
                });
            }else{
                return res.send('the items is not a array');
            }
            
        }else{
            return res.send('your data does not contain items');
        }

        document["items"] = items;
        document["storeLocation"] = req.body.storeLocation;

        let customer = {};
        if(typeof req.body.customer ==='object'){
            customer["gender"] = req.body.customer.gender;
            customer["age"] = req.body.customer.age;
            customer["email"] = req.body.customer.email;
            customer["satisfaction"] = req.body.customer.satisfaction;
        }
        else{
            return res.send('your customer is not a object');
        }

        document["customer"] = customer;

        document["couponUsed"] = req.body.couponUsed;
        document["purchaseMethod"] = req.body.purchaseMethod;
        
        //check is every key have value or not
        
        for (let key in document) {
            console.log(key);  
            if(Array.isArray(document[key])){
                for(let i =0;i<document[key].length;i++){

                    for(let x in document[key][i]){
                        if(document[key][i][x] === undefined){
                            console.log(`Undefined value found for key: ${x}`);
                            res.send(`Undefined value found for key: ${x}`);
                        }
                    }
                }
                
            }else if(typeof document[key] ==="object"){
                
                for(let object_key in document[key]){
                    if(document[key][object_key] === undefined){
                        console.log(`Undefined value found for key: ${object_key}`);
                        res.send(`Undefined value found for key: ${object_key}`);
                    }
                }
            }else{
                if (document[key] === undefined) {
                    res.send(`Undefined value found for key: ${key}`);
                    console.log(`Undefined value found for key: ${key}`);
                }
            }
        }
        console.log(document)
        await dbconnection();
        await database.collection(collectionName).insertOne(document);
        res.send('document created!')
    }catch(error){
        if(error instanceof SyntaxError){
            console.log(error.message);  
            return res.send('your commond have syntax error');
        }else{
            console.log(error.message);
            res.send(error.message);
        }
    }finally{
        closeConnection();
    }
});

//clear session
app.get('/session/destroy', function(req, res) {
    req.session = null;
    res.status(200).send('ok');
});

//find
//find with date
//test:
// curl -X GET localhost:8099/api/find/date/2015-7-22
app.get('/api/find/date/:date', async function(req,res){
    console.log(new Date('1234-12-12T00:00:00.000+00:00'))
    if(isDateValid(req.params.date)){
        let format_date = formatDate(req.params.date)
        console.log(format_date);
        let criteria = {}
        
        criteria['saleDate'] = {$gte: new Date(format_date),$lt: new Date(format_date+'T23:59:59Z')};
        console.log(criteria)

        try{
            await findDocument(criteria,(data)=>{
                res.send(data);
            })
        }catch(err){
            res.send('error');
            console.log(err.message);
        }finally{
            closeConnection();
        }
    }else{
        res.send('invalid date');
    }

});

//find with location
//test:
// curl -X GET localhost:8099/api/find/location/newyork
app.get('/api/find/location/:location', async function(req, res){
    let location = matchLocation(req.params.location);
    let criteria = {}

    criteria['storeLocation'] = {$in: location};

    try{
        await findDocument(criteria,(data)=>{
            res.send(JSON.parse(data));
        })
    }catch(err){
        res.send('error');
        console.log(err.message);
    }finally{
        closeConnection();
    }
});


//find with purchase method
//test url:
//curl -X GET localhost:8099/api/find/purchasemethod/ONline_phone
app.get('/api/find/purchasemethod/:purchasemethod', async function(req,res){
    let purchaseMethod = matchPurchaseMethod(req.params.purchasemethod);
    let criteria = {}


    criteria['purchaseMethod'] = {$in: purchaseMethod};


    try{
        await findDocument(criteria,(data)=>{
            res.send(JSON.parse(data));
        })
    }catch(err){
        res.send('error');
        console.log(err.message);
    }finally{
        closeConnection();
    }
});

//find with item
//test
//curl -X GET localhost:8099/api/find/item/pens
app.get('/api/find/item/:item', async function(req,res){
    let item = matchItem(req.params.item);
    let criteria = {}

    
    criteria['items.name'] = {$in: item};

    try{
        await findDocument(criteria,(data)=>{
            res.send(data);
        })
    }catch(err){
        res.send('error');
        console.log(err.message);
    }finally{
        closeConnection();
    }
});

//update with date
//test
//curl -X PUT -H "Content-Type: application/json" -d "{\"customer\": { \"gender\": \"F\" , \"age\": 70, \"email\": \"s1332954@live.hkmu.edu.hk\", \"satisfaction\": 5 }}" localhost:8099/api/update/date/2016-09-13T16:54:42.141+00:00/customer
app.put('/api/update/date/:date/*', async function(req,res){

    let path = req.path.split('/')
    let target = path[path.length-1];
    //check target and body key is vaild or not
    if(!matchKey(target)){
        return res.send('invalid path target')
    }
    if(!matchKey(Object.keys(req.body)[0])){
        return res.send('invalid data key name')
    }

    let replacedoc = {};
    let customerKey = ['gender', 'age', 'email', 'satisfaction'];

    if(isDateValid(req.params.date)){
        let format_date = req.params.date

        console.log(req.body)
        
        if(target =='customer'){
            for(let key in req.body.customer){
                if(!key in customerKey){
                    res.send('customer does not have correct keys');
                }
            }
            let customer = req.body.customer

            replacedoc = {$set :{customer}}
        }else{
            let setdata = req.body.target;

            replacedoc = {$set: setdata};
        }
        
        try{
            console.log(replacedoc);
            await updateDocument_date(format_date, replacedoc, ()=>{
                console.log('update successful');
                res.send('update successful');
            })
        }catch(err){
            console.log('update incomplete',err);
            res.send('update incomplete');
        }

    }else{
        console.log('not a valid date');
        res.send('not a valid date');
    }
})



//delete with email
//test
//eja@ko.es
//pan@cak.zm
//man@bob.mz
//curl -X DELETE localhost:8099/api/delete/email/man@bob.mz


app.delete('/api/delete/email/:email',async function( req, res){
    try{
        console.log(req.params.email);
        await deleteDocument_email(req.params.email, ()=>{
            console.log('delete successful');
            res.send('delete successful');
        })
    }catch(err){
        console.error(err.message);
        res.send('connection error');
    }
})

const server = app.listen(process.env.PORT || 8099, () => {

    const port = server.address().port;
    console.log(`Server listening at port ${port}`);
});