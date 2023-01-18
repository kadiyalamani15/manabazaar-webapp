// ---------------- Loading External Package Requirements ---------------- 
const express = require("express");
const ejs = require('ejs');
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const axios = require('axios');

// ---------------- Initializing Node Express App ---------------- 
const app = express();

// ---------------- Connecting to Manabazaar Test Database ---------------- 
mongoose.connect("mongodb://localhost:27017/manabazaarTest", {useNewUrlParser : true});

// ---------------- Configs ---------------- 
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(express.static('public'));

// ---------------- Intializing Inventory Schema ---------------- 
const inventorySchema = {
    category_name : String,
    index : Number,
    sub_category : [
        {
            sub_name : String,
            products : [
                {
                    id : Number,
                    prod_name : String,
                    stock : Number,
                    price : 
                        {
                            MRP : Number,
                            SP : Number
                        },
                    units : String
                }
            ]
        }
    ]
};


// ---------------- Intializing / Accessing Collection from Test Database ---------------- 
const Grocery = mongoose.model("Grocery", inventorySchema);


// ---------------- APP ROUTES ---------------- 

// ---------------- Billing ---------------- 
app.route("/")
    .get((req, res) => {
        res.render("home");
    }
);

// ---------------- Orders ---------------- 
app.route("/Orders")
    .get((req, res) => {
        res.render("orders");
    }
);

// ---------------- Credits ---------------- 
app.route("/Credits")
    .get((req, res) => {
        res.render("credits");
    }
);

// ---------------- Dahsboard ---------------- 
app.route("/Dashboard")
    .get((req, res) => {
        res.render("dashboard");
    }
);

// ---------------- Inventory ---------------- 
app.route("/Inventory")
    .get((req, res) => {
        Grocery.find().sort({'_id' : 1}).exec((err, groceries) => {
            if(!err){
                res.render("inventory", {inventoryList : groceries})
            }
        });
    }
);

// ---------------- Inventory:Params ---------------- 
app.route("/Inventory/:Category")
    // ---------------- GET (Completed) ----------------
    .get((req, res) => {
        Grocery.find().sort({'_id':1}).exec((err, groceries) => {
            if(!err) {
                var i = 0;
                groceries.forEach(function(list) {
                    if (list.category_name === req.params.Category) {
                        res.render("category", {categoryTitle : req.params.Category, subCategory : list.sub_category, ID : (i+1)*1000, Position : i});
                    };
                    i++;
                });
            }
        });
        
    })
    // ---------------- POST ---------------- 
    .post((req, res) => {
        // ---------------- Add Products (Completed) ----------------
        if (req.body.formName === "addProduct") {
            // body is being converted to array so that it can be sliced
            let data = req.body;
            data = Object.entries(data);
            let start = data.findIndex(([key]) => key === 'id');
            let end = data.findIndex(([key]) => key === 'units');
            let slicedData = data.slice(start, end + 1);
            // after slicing it is being converted to JSON so that it can be pushed at desired location
            let jsonData = Object.fromEntries(slicedData);
            console.log(jsonData);
            Grocery.updateOne({ "sub_category.sub_name": req.body.subCategoryName }, {$push: {"sub_category.$.products": jsonData}}, (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
        } else if (req.body.formName === "deleteProduct") {
            // ---------------- Delete Product ----------------

        } else if (req.body.formName === "addSubCategory") {
            // ---------------- Add sub_category (Completed) ----------------
            console.log(req.body);
            Grocery.updateOne({category_name : req.body.categoryName},{$push : {sub_category : {sub_name : req.body.newSubCategoryName, products : []}}}, (err, doc) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(doc);
                }
              });
        } else if (req.body.formName === "deleteSubCategory") {
            // ---------------- Delete sub_category ----------------
            console.log(req.body);
        };
        res.redirect("/Inventory/"+req.params.Category);
    })

    // ---------------- UPDATE ----------------
    .patch((req, res) => {
        console.log("Patch route is hit successfully");
        console.log(req.body);
    })


// ---------------- PORT ---------------- 
app.listen(3000, function() {
    console.log("Server started on port 3000");
});