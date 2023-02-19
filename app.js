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
app.use(express.static('public')); // all the static files are placed in this path for nodejs to access

// ---------------- Intializing Inventory Schema ---------------- 

const productsSchema = {
    id: Number,
    name: String,
    price: {
        MRP: Number,
        SP: Number
    },
    quantity: Number,
    units : String,
    category: String,
    sub_category: String
};

const categoriesSchema = {
    name: String,
    id: Number,
    sub_category: Array
};


// ---------------- Intializing / Accessing Collection from Test Database ---------------- 
const Product = mongoose.model("Product", productsSchema);

const Category = mongoose.model("Category", categoriesSchema);


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
        // Fetching Product Categories
        Category.find({},{name:1, _id:0}).exec((err, categories) => {
            if(!err){
                res.render("inventory", {Categories : categories});
            };
        });
    })

    .post((req, res) => {
        //  Counting the Documents present to compute the new Category ID
        Category.countDocuments().exec((err, count) => {
            if(!err){
                var newCategory = new Category({
                    name : req.body.category,
                    id : (count + 1) * 1000,
                    sub_category : []
                });
                newCategory.save();
                res.redirect("/Inventory");
            };
        });
    });


// ---------------- Inventory:Params ---------------- 
app.route("/Inventory/:Category")
    // ---------------- GET (Completed) ----------------
    .get((req, res) => {
        let query = {category: req.params.Category};
        // Fetching Products of the Category requested
        Product.find(query).sort({'_id':1}).exec((err, products) => {
            if(!err) {
                // Fetchin Category Collection to iterate over Sub Categories
                Category.find({name : req.params.Category}).exec((err,list) => {
                    if(!err) {
                        // Sub Categories attribute from the Categories Collection for the Category requested
                        var subCategory = list[0].sub_category;
                        // Create a dictionary to store the products for each sub-category
                        var productsBySubCategory = {};
                        // Iterating Over Sub Category List
                        subCategory.forEach((sub_category) => {
                            // If there are no products in the Category requested, Empty key:value pair in the dictionary are initialized
                            if (!products.length) {
                                productsBySubCategory[sub_category] = [];
                            } else {
                                // If products are present in the Category requested, Empty key:value pair in the dictionary are intialized
                                if (!productsBySubCategory[sub_category]) {
                                    productsBySubCategory[sub_category] = [];
                                }
                                products.forEach((product) => {
                                    //console.log('Product Sub Category: ', product.sub_category, ', Iter Sub Category: ', sub_category);
                                    // Key:Value are pushed into dictionary based on the Sub Category match criteria
                                    if (product.sub_category === sub_category){
                                        //console.log('reached');
                                        productsBySubCategory[sub_category].push(product);
                                    };
                                });
                            };
                        })
                        //console.log(productsBySubCategory);
                        res.render("category", { categoryTitle : req.params.Category, data: productsBySubCategory, categoryID: list[0].id});;
                    };
                });
            };
        });
    })
    // ---------------- POST (Completed) ---------------- 
    .post((req, res) => {
        // ---------------- Add Products (Completed) ----------------
        if (req.body.formName === "addProduct") {
            //console.log(req.body);
            // body is being converted to array so that it can be sliced
            let data = req.body;
            data = Object.entries(data);
            let start = data.findIndex(([key]) => key === 'id');
            let end = data.findIndex(([key]) => key === 'units');
            let slicedData = data.slice(start, end + 1);
            //console.log(slicedData);
            // after slicing it is being converted to JSON so that it can be pushed at desired location
            let jsonData = Object.fromEntries(slicedData);
            console.log(jsonData);
            Product.create(jsonData, (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Document Saved:', doc);
                }
            });
        // } else if (req.body.formName === "deleteProduct") {
            // ---------------- Delete Product ----------------

        } else if (req.body.formName === "addSubCategory") {
            // ---------------- Add sub_category (Completed) ----------------
            console.log(req.body);
            // New Sub Category is appended into the requested Category
            Category.updateOne({name : req.body.categoryName},{$push : {sub_category : req.body.newSubCategoryName}}, (err, doc) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log(doc);
                }
              });
        } else if (req.body.formName === "deleteSubCategory") {
            // ---------------- Delete sub_category (Completed) ----------------
            //console.log(req.body);
            // Selected Sub Category is deleted from the requested Category
            Category.updateOne({name:req.params.Category},{$pull:{sub_category: req.body.subCategoryName}},(err,doc)=>{
                if(err) {
                    console.log(err);
                } else {
                    console.log('Document Updated: ', doc);
                }
            });
        };
        res.redirect("/Inventory/"+req.params.Category);
    })

    // ---------------- UPDATE (Completed) ----------------
    .patch((req, res) => {
        // ---------------- Sub Category (Completed) ----------------
        if ("old_name" in req.body) {
            let query = { name: 'Fruits & Vegetables', sub_category: req.body.old_name};
            let update = { $set: { "sub_category.$": req.body.sub_name } };
            console.log(query, update);
            // Updating Sub Category Name
            Category.updateOne(query, update, function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Document Updated: ', doc);
                }
            });
        
        // ---------------- Product Info (Completed) ----------------
        } else {
            console.log("Update Prod Details ", req.body);
            // Saving Product Name to filter the query
            let prod_name = req.body.prod_name;
            let data = req.body;
            // Product Name Key:Value Pair is deleted from the Data Dictionary
            delete data.prod_name;
            let query = {name:prod_name};
            let update = { $set: data };
            console.log(query, update);
            // Updating Product Parameter
            Product.updateOne(query, update, (err, doc) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Document Updated: ', doc);
                }
            });
        };
    })


// ---------------- PORT ---------------- 
app.listen(3000, function() {
    console.log("Server started on port 3000");
});