Supply Management System

Group: 59

Name: Ng Ka Yu (13329549)

Application link: https://supply-management-system-project.onrender.com/
github page: https://github.com/Cerulean-Dragon7/ServerSideProject


********************************************
# Login
Through the login interface, each user can access the restaurant information management system by entering their username and password.

Each user has a userID and password;
[
    {name: 'user1', password: 'usertest1'},
	{name: 'user2', password: 'usertest2'}
]

After successful login, username  is stored in seesion.

********************************************

# Logout

In the ervery page, user can logout their account by clicking logout button.

********************************************

# CRUD service
- Create
- Click the create button to do create service
- A order document may contain the following attributes with an example:
    1) _id: Ojectid form mongodb
    2) sale date: with ISODate
    3) items: an array contain a object, each object contain name, tags, price and quantity
            object: {"name":"printer paper",
            "tags":["office","stationary"],
            "price": 17.61,
            "quantity":1},
    4) store Location: show the cutomer store location
    5) customer: a object contain the customer information like: gender, age, email and satisfaction
    6) couponUsed: does the customer used coupon or not
    7) purchase Method: customer used what method to order (in store, online, phone)

- A formated document:
    {"_id": Ojectid,
    "saleDate": ISODate,
    "items":[{name, tags, price, quantity}, {name, tags, price, quantity}],
    "storeLocation": string,
    "customer":{"gender": M/F,"age": number,"email": string,"satisfaction": number(1-10)},"couponUsed": boolean,
    "purchaseMethod": string}

All attributes are mandatory.

Create operation is post request, and all information is in body of request.
If successfully insert to the database it will direct to home page.

********************************************
# CRUD service
- Read
- Click the find button to do read service

In the find page there are a list of checkbox for user to find the documents.

1) When the user click search button without click any checkbox, it will search all the document from the database.

2) When the user click more then one checkbox, it will search all the document which match with any clicked checkbox.

********************************************
# CRUD service
- Update
- The user can update the oreder information by click the edit button on each document
- When you click the edit button it when show a form for you the change the data
- Only the Ojectid and the sale date is fixed
- you also can add a new item or delete a item

# CRUD service
- Delete
-	The user can click delete button to delete the specific document

********************************************
# Restful
In this project, there are four HTTP request types, post, get, put, delete

- Post
    Post request is used for insert.
    Path URL: /api/insert
    test: curl -X POST -H "ContentType: application/json" -d "{ \"items\": [ { \"name\": 
    \"notepad\", \"price\": \"30.08\", \"quantity\": 1 }, { \"name\": \"binder\", \"price\": \"24.68\", 
    \"quantity\": 7 } ], \"storeLocation\": \"Denver\", \"customer\": { \"gender\": \"M\" , \"age\": 51, 
    \"email\": \"s1332954@live.hkmu.edu.hk\", \"satisfaction\": 5 }, \"couponUsed\": false, \"purchaseMethod\":
    \"In store\" }" localhost:8099/api/insert

-Get
    Get request is used for find.

    Find with date
    Path URL: /api/find/date/:date
    Test: curl -X GET localhost:8099/api/find/date/2015-7-22

    Find with location
    Path URL: /api/find/location/:location
    test:// curl -X GET localhost:8099/api/find/location/newyork

    Find with purchase method
    Path URL: /api/find/purchasemethod/:purchasementhod
    test url: //curl -X GET localhost:8099/api/find/purchasemethod/ONline_phone


    Find with item name
    Path URL: /api/find/item/:item
    test: curl -X GET localhost:8099/api/find/item/pens

- Update
    Put request is used for update.

    update with ISOdate
    path URL api/update/date/:date/*
    Test: curl -X PUT -H "Content-Type: application/json" -d "{\"customer\": { \"gender\": \"F\" , \"age\": 34, \"email\": \"s1332954@gmail.com\", \"satisfaction\": 5 }}" localhost:8099/api/update/date/2016-09-13T16:54:42.141+00:00/customer

    Path: '/*' mean what you want to update in the document. The Path name and the request body key name should same as the formated document above. Otherwise, it can not be update.


-delete
    delete request is used for delete.

    Path URL: /api/delete/email/:email
    Test: curl -X DELETE localhost:8099/api/delete/email/man@bob.mz

    //eja@ko.es
    //pan@cak.zm
    //man@bob.mz
    above email is existing email that can be delete

For all restful CRUD services, login should be done at first.