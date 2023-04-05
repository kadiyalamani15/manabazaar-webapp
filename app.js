// ---------------- Loading External Package Requirements ----------------
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

// ---------------- Folder Creation ----------------
const year = new Date().getFullYear();
const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
	new Date()
);
const day = new Date().getDate();

const yearPath = year.toString();
const monthPath = path.join(yearPath, month);
const dayPath = path.join(monthPath, day.toString());

const logsPath = path.join(dayPath, "logs");
const pdfsPath = path.join(dayPath, "pdfs");
const invoicesPath = path.join(pdfsPath, "invoices");
const outOfStockPath = path.join(pdfsPath, "out-of-stock");

const paidPath = path.join(invoicesPath, "paid");
const duePath = path.join(invoicesPath, "due");
const dueClearedPath = path.join(invoicesPath, "due-cleared");
const onePath = path.join(dueClearedPath, "one");
const manyPath = path.join(dueClearedPath, "many");

const makeDirectoryIfNotExists = (directoryPath) => {
	if (!fs.existsSync(directoryPath)) {
		fs.mkdirSync(directoryPath);
	}
};

makeDirectoryIfNotExists(yearPath);
makeDirectoryIfNotExists(monthPath);
makeDirectoryIfNotExists(dayPath);

makeDirectoryIfNotExists(logsPath);
makeDirectoryIfNotExists(pdfsPath);
makeDirectoryIfNotExists(invoicesPath);
makeDirectoryIfNotExists(outOfStockPath);

makeDirectoryIfNotExists(paidPath);
makeDirectoryIfNotExists(duePath);
makeDirectoryIfNotExists(dueClearedPath);
makeDirectoryIfNotExists(onePath);
makeDirectoryIfNotExists(manyPath);

// ---------------- Initializing Node Express App ----------------
const app = express();

// ---------------- Connecting to Manabazaar Test Database ----------------
mongoose.connect("mongodb://localhost:27017/manabazaarTest", {
	useNewUrlParser: true,
});

// ---------------- Configs ----------------
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public")); // all the static files are placed in this path for nodejs to access

// ---------------- Intializing Inventory Schema ----------------

const productsSchema = {
	id: Number,
	name: String,
	price: {
		MRP: Number,
		SP: Number,
		CP: Number,
	},
	quantity: Number,
	units: String,
	category: String,
	sub_category: String,
};

const categoriesSchema = {
	name: String,
	id: Number,
	sub_category: Array,
};

// ----------------  Intitializing Flats Schema ----------------

const flatsSchema = {
	flat: String,
};

// ----------------  Intitializing Invoice Schema ----------------

const invoicesSchema = {
	invoiceCashier: String,
	invoiceId: String,
	invoiceDate: {
		type: Date,
		required: true,
	},
	flat: String,
	contact: String,
	person: Number,
	invoiceItemsCount: Number,
	invoiceQty: Number,
	invoiceSubTotal: Number,
	invoiceTax: Number,
	invoiceDeliveryCharge: Number,
	invoiceDiscount: Number,
	invoiceTotal: Number,
	invoiceItems: Array,
	paymentMode: Number,
	paymentDefault: Boolean,
	paymentDate: Date,
	billTime: {
		start: String,
		end: String,
		taken: String,
	},
};

// ---------------- Intializing / Accessing Collection from Test Database ----------------
const Product = mongoose.model("Product", productsSchema);

const Category = mongoose.model("Category", categoriesSchema);

const Flat = mongoose.model("Flat", flatsSchema);

const Invoice = mongoose.model("Invoice", invoicesSchema);

// * APP ROUTES * //

// * INVOICE ROUTES * //
// TODO: 1.1. GET: '/', Get products, process the template to show case products and invoice, today's sales count and amount
// * COMPLETED * //
app
	.route("/")
	.get((req, res) => {
		Product.find((err, products) => {
			if (!err) {
				//console.log(products);
				Category.find((err, categories) => {
					if (!err) {
						//console.log(categories);
						let productsByCategory = {};
						categories.forEach((category) => {
							if (!productsByCategory[category.name]) {
								productsByCategory[category.name] = [];
							}
							products.forEach((product) => {
								if (product.category === category.name) {
									productsByCategory[category.name].push(product);
								}
							});
						});
						//console.log(productsByCategory);
						const today = new Date();
						const startOfDay = new Date(
							today.getFullYear(),
							today.getMonth(),
							today.getDate(),
							0,
							0,
							0
						);
						const endOfDay = new Date(
							today.getFullYear(),
							today.getMonth(),
							today.getDate(),
							23,
							59,
							59
						);
						Invoice.countDocuments(
							{ invoiceDate: { $gte: startOfDay, $lte: endOfDay } },
							(err, noOfSalesToday) => {
								if (err) {
									console.log(err);
								}
								Invoice.aggregate(
									[
										{
											$match: {
												invoiceDate: { $gte: startOfDay, $lte: endOfDay },
											},
										},
										{ $group: { _id: null, total: { $sum: "$invoiceTotal" } } },
									],
									(err, salesAmountToday) => {
										if (err) {
											console.error(err);
										}
										// console.log(noOfSalesToday, salesAmountToday);
										res.render("home", {
											inventory: productsByCategory,
											todaySalesCount: noOfSalesToday,
											todaySalesAmountTotal:
												salesAmountToday.length != 0
													? salesAmountToday[0].total
													: 0,
										});
									}
								);
							}
						);
					} else {
						console.log(err);
					}
				});
			} else {
				console.log(err);
			}
		});
		//res.render("home");
	})
	// TODO: 1.2. POST: '/', Submit the Invoice Order, Generate Invoice PDF, store it in datewise folder in local system, in future send it to the customer's Whatsapp Account or App Account
	// * COMPLETED * //
	.post(async (req, res) => {
		// TODO: Compute the timestamp and the elapsed time of submissions
		// * COMPLETED * //
		const now = new Date();
		const options = {
			timeZone: "Asia/Kolkata",
			hour12: false,
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
		};
		const dateTimeFormat = new Intl.DateTimeFormat("en-IN", options);
		var [time] = dateTimeFormat.format(now).split(", ");
		req.body["billTime.end"] = time;
		// Convert the time values to milliseconds since midnight
		const startTimeMs = Date.parse(`01/01/1970 ${req.body["billTime.start"]}`);
		const endTimeMs = Date.parse(`01/01/1970 ${req.body["billTime.end"]}`);
		//calculate the time taken in milliseconds
		const timeTakenMs = endTimeMs - startTimeMs;
		// conver the time taken back to hh:mm:ss format
		const timeTaken = new Date(timeTakenMs).toISOString().substr(11, 8);
		req.body["billTime.taken"] = timeTaken;
		req.body.paymentDate = "";
		req.body.paymentDefault = true;
		var currentInvoicePath = duePath;
		if (req.body.paymentMode == "2" || req.body.paymentMode == "3") {
			req.body.paymentDefault = false;
			req.body.paymentDate = new Date();
			currentInvoicePath = paidPath;
		}
		req.body.invoiceItems = JSON.parse(req.body.invoiceItems);
		req.body.invoiceDate = new Date();
		// console.log(req.body);
		// TODO: Submit data to the database
		// * COMPLETED * //
		Invoice.create(req.body, async (err, doc) => {
			if (err) {
				console.log(err);
			} else {
				console.log("Document Saved:", doc);
				try {
					req.body.invoiceSubTotal = parseFloat(req.body.invoiceSubTotal);
					req.body.invoiceTax = parseFloat(req.body.invoiceTax);
					req.body.invoiceDeliveryCharge = parseFloat(
						req.body.invoiceDeliveryCharge
					);
					req.body.invoiceDiscount = parseFloat(req.body.invoiceDiscount);
					req.body.invoiceTotal = parseFloat(req.body.invoiceTotal);
					const template = fs.readFileSync(
						"./views/invoice-template.ejs",
						"utf8"
					);
					const html = ejs.render(template, { invoice: req.body });

					// Launch Puppeteer and create a new page
					const browser = await puppeteer.launch();
					const page = await browser.newPage();

					// Set page content and options
					await page.setContent(html);
					await page.emulateMediaType("screen");
					await page.setViewport({
						width: 595,
						height: 842,
						deviceScaleFactor: 1,
					});

					// Generate PDF from page content and save to file
					await page.pdf({
						path: currentInvoicePath + "/" + req.body.invoiceId + ".pdf",
						format: "A4",
						printBackground: true,
						margin: {
							top: "20mm",
							right: "20mm",
							bottom: "20mm",
							left: "20mm",
						},
					});

					// Close the browser
					await browser.close();

					console.log("PDF generated successfully!");
					res.redirect("/");
				} catch (err) {
					console.log(err);
				}
				req.body.invoiceItems.forEach((prod) => {
					console.log(prod);
					Product.findOne({ name: prod.name }, (err, item) => {
						if (err) {
							console.error(err);
						}
						item.quantity -= prod.qty;
						item.save((err) => {
							if (!err) {
								console.log("Document Updated: " + item);
							} else {
								console.log(err);
							}
						});
					});
				});
			}
		});
	});

// TODO: 1.3. GET: '/getFlats', Gets all flats
// * COMPLETED * //
app.post("/getFlats", async (req, res) => {
	let payload = req.body.payload.trim();
	let regex1 = /([a-zA-Z]+)(\d+)/;
	let regex2 = /^([a-zA-Z])\s+[0-9]+$/;
	if (regex1.test(payload)) {
		// console.log("Match! " + payload);
		payload = payload.replace(/^([a-zA-Z])(\d+)/, "$1 $2");
		// console.log("Regex: " + payload);
	} else if (regex2.test(payload)) {
		// console.log("Match! " + payload);
		payload = payload.replace(/([a-zA-Z])(\s+)?(\d+)/, "$1 $3");
		// console.log("Regex: " + payload);
	} else {
		// console.log("No Match! " + payload);
	}
	let search = await Flat.find({
		flat: { $regex: new RegExp(payload, "i") },
	})
		.limit(3)
		.exec();
	// console.log(search);
	res.send({ payload: search });
});

// * ORDERS ROUTES * //
// TODO: 2.1. GET: '/orders' --> invoices, Get all orders in descending order sorted on date, render the template
// * COMPLETED * //
app.get("/invoices", (req, res) => {
	Invoice.find()
		.sort({ invoiceDate: -1 })
		.exec((err, invoice) => {
			if (!err) {
				res.render("invoices", { invoices: invoice });
				// console.log(invoice);
			} else {
				console.log(err);
			}
		});
});
// TODO: 2.2. POST: '/invoices/due/clearOne/:invoiceID', To clear orders that is default
// * COMPLETED * //
app.post("/invoices/due/clearOne/:invoiceID", (req, res) => {
	// console.log("#" + req.params.invoiceId);
	console.log(req.params, req.body);
	req.params.invoiceID = "#" + req.params.invoiceID;
	Invoice.updateOne(
		{ invoiceId: req.params.invoiceID },
		{
			paymentDefault: false,
			paymentDate: new Date(),
			paymentMode: req.body.paymentMode,
		}
	).exec((err, inv) => {
		if (!err) {
			console.log("Document Updated: ", inv);
			Invoice.findOne(
				{ invoiceId: req.params.invoiceID },
				async (err, bill) => {
					if (err) {
						console.log(err);
					} else {
						try {
							const template = fs.readFileSync(
								"./views/invoice-template.ejs",
								"utf8"
							);
							const html = ejs.render(template, { invoice: bill });
							// Launch Puppeteer and create a new page
							const browser = await puppeteer.launch();
							const page = await browser.newPage();

							// Set page content and options
							await page.setContent(html);
							await page.emulateMediaType("screen");
							await page.setViewport({
								width: 595,
								height: 842,
								deviceScaleFactor: 1,
							});

							/// Generate PDF from page content and save to file
							await page.pdf({
								path: onePath + "/" + bill.invoiceId + ".pdf",
								format: "A4",
								printBackground: true,
								margin: {
									top: "20mm",
									right: "20mm",
									bottom: "20mm",
									left: "20mm",
								},
							});

							// Close the browser
							await browser.close();

							console.log("PDF generated successfully!");
							console.log("Previous Route: " + req.headers.referer.slice(21));
							if (req.headers.referer.slice(21) !== "/invoices") {
								res.redirect("/invoices/due");
							} else {
								res.redirect("/invoices");
							}
						} catch (err) {
							console.log(err);
						}
					}
				}
			);
		} else {
			console.log(err);
		}
	});
});

// * CREDIT ROUTES * //
// TODO: 3.1. GET: '/invoices/due', Group Invoices on Flat, sort in descending order on total due amount, render the template
// * COMPLETED * //
app.get("/invoices/due", (req, res) => {
	Invoice.aggregate(
		[
			{ $match: { paymentDefault: true } },
			{
				$group: {
					_id: "$flat",
					totalDues: { $sum: 1 },
					totalDueItems: { $sum: "$invoiceItemsCount" },
					totalDueQty: { $sum: "$invoiceQty" },
					totalDueSubTotal: { $sum: "$invoiceSubTotal" },
					totalDueTax: { $sum: "$invoiceTax" },
					totalDueDeliveryCharges: { $sum: "$invoiceDeliveryCharge" },
					totalDueDiscount: { $sum: "$invoiceDiscount" },
					totalDueAmount: { $sum: "$invoiceTotal" },
					dueInvoices: { $push: "$$ROOT" },
				},
			},
			{
				$sort: { totalDueAmount: -1 },
			},
		],
		(err, dueFlats) => {
			if (err) {
				console.error(err);
			}
			// console.log(dueFlats);
			res.render("credits", { dueFlats: dueFlats });
		}
	);
});
// TODO: 3.2. POST: '/invoices/due/clearOne/:invoiceID', To clear order that is default and also generate an invoice saying paid, save it in the local system and that particular date
// * COMPLETED : 2.2 for pdf * //

// TODO: 3.3. POST: '/invoices/due/clearMany/:flat', To clear orders that are default on selected flat and also generate an invoice saying paid, save it in the local system and that particular date
// * COMPLETED * //
app.post("/invoices/due/clearMany/:flat", (req, res) => {
	// console.log(req.params.flat);
	Invoice.aggregate(
		[
			{ $match: { flat: req.params.flat, paymentDefault: true } },
			{
				$group: {
					_id: null,
					totalDueItems: { $sum: "$invoiceItemsCount" },
					totalDueQty: { $sum: "$invoiceQty" },
					totalDueSubTotal: { $sum: "$invoiceSubTotal" },
					totalDueTax: { $sum: "$invoiceTax" },
					totalDueDeliveryCharges: { $sum: "$invoiceDeliveryCharge" },
					totalDueDiscount: { $sum: "$invoiceDiscount" },
					totalDueAmount: { $sum: "$invoiceTotal" },
					dueInvoices: { $push: "$$ROOT" },
				},
			},
		],
		async (err, dues) => {
			if (err) {
				console.log(err);
			} else {
				try {
					// console.log(dues, dues[0].dueInvoices);
					const template = fs.readFileSync(
						"./views/credits-invoice.ejs",
						"utf8"
					);
					const html = ejs.render(template, {
						flat: req.params.flat,
						dues: dues,
					});
					// Launch Puppeteer and create a new page
					const browser = await puppeteer.launch();
					const page = await browser.newPage();

					// Set page content and options
					await page.setContent(html);
					await page.emulateMediaType("screen");
					await page.setViewport({
						width: 595,
						height: 842,
						deviceScaleFactor: 1,
					});

					// Generate PDF from page content and save to file
					await page.pdf({
						path: manyPath + "/" + req.params.flat + ".pdf",
						format: "A4",
						printBackground: true,
						margin: {
							top: "20mm",
							right: "20mm",
							bottom: "20mm",
							left: "20mm",
						},
					});

					// Close the browser
					await browser.close();

					console.log("PDF generated successfully!");
					Invoice.updateMany(
						{ flat: req.params.flat, paymentDefault: true },
						{
							paymentDefault: false,
							paymentDate: new Date(),
							paymentMode: req.body.paymentMode,
						}
					).exec((err, inv) => {
						if (!err) {
							console.log("Documents Updated: ", inv);
						} else {
							console.log(err);
						}
					});

					res.redirect("/invoices/due");
				} catch (err) {
					console.log(err);
				}
			}
		}
	);
});

// ---------------- Dahsboard ----------------
app.get("/dashboard", (req, res) => {
	res.render("dashboard");
});

// * INVENTORY ROUTES * //
// TODO: 5.1. GET: 'inventory', Get all inventory categories, render the template
// * COMPLETED * //
app.get("/inventory", (req, res) => {
	// Fetching Product Categories
	Category.find({}, { name: 1, _id: 0, id: 1 }).exec((err, categories) => {
		if (!err) {
			res.render("inventory", { Categories: categories });
		}
	});
});

// TODO: 5.2. POST: '/inventory/category/crud', Create, update, and delete category from inventory and corresponding products
app.post("/inventory/category/crud", (req, res) => {
	console.log(req.body);
	if (req.body.crud === "create") {
		//  Counting the Documents present to compute the new Category ID
		Category.countDocuments().exec((err, count) => {
			if (!err) {
				var newCategory = new Category({
					name: req.body.category,
					id: (count + 1) * 1000,
					sub_category: [],
				});
				newCategory.save();
				res.redirect("/Inventory");
			}
		});
	}
	// Update the Category
	// Delete the Category
});

// TODO: 5.3. GET: '/inventory/category/:categoryID/products', Get all products corresponding to category
// * COMPLETED * //
app.get("/inventory/category/:categoryID/products", (req, res) => {
	Category.find({ id: req.params.categoryID }).exec((err, category) => {
		if (!err) {
			let query = { category: category[0].name };
			// Fetching Products of the Category requested
			Product.find(query)
				.sort({ _id: 1 })
				.exec((err, products) => {
					if (!err) {
						// Sub Categories attribute from the Categories Collection for the Category requested
						// console.log(category[0].sub_category);
						var subCategory = category[0].sub_category;
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
									if (product.sub_category === sub_category) {
										//console.log('reached');
										productsBySubCategory[sub_category].push(product);
									}
								});
							}
						});
						//console.log(productsBySubCategory);
						res.render("category", {
							categoryTitle: category[0].name,
							data: productsBySubCategory,
							categoryID: parseInt(req.params.categoryID),
						});
					}
				});
		}
	});
});

// TODO: 5.4. POST: '/inventory/category/:categoryID/subcategory/crud', Create, Update, Delete sub category & corresponding products
// * COMPLETED * //
app.post("/inventory/category/:categoryID/subcategory/crud", (req, res) => {
	console.log(req.params, req.body);
	if (req.body.crud === "create") {
		Category.updateOne(
			{ id: req.params.categoryID },
			{ $push: { sub_category: req.body.newSubCategoryName } },
			(err, doc) => {
				if (err) {
					console.log(err);
				} else {
					console.log("Document Updated: ", doc);
				}
			}
		);
	} else if (req.body.crud === "update") {
		let query = {
			id: req.params.categoryID,
			sub_category: req.body.oldSubCategoryName,
		};
		let update = { $set: { "sub_category.$": req.body.newSubCategoryName } };
		console.log(query, update);
		// Updating Sub Category Name
		Category.updateOne(query, update, function (err, doc) {
			if (err) {
				console.log(err);
			} else {
				console.log("Document Updated: ", doc);
			}
		});
		// TODO: Update Product's sub category info
		// * COMPLETED * //
		Product.updateMany(
			{ sub_category: req.body.oldSubCategoryName },
			{ sub_category: req.body.newSubCategoryName },
			(err, doc) => {
				if (err) {
					console.log(err);
				} else {
					console.log("Document Updated: ", doc);
				}
			}
		);
	} else if (req.body.crud === "del") {
		Category.updateOne(
			{ id: req.params.categoryID },
			{ $pull: { sub_category: req.body.oldSubCategoryName } },
			(err, doc) => {
				if (err) {
					console.log(err);
				} else {
					console.log("Document Updated: ", doc);
				}
			}
		);
		// TODO: Delete corresponding sub_category products from products collection
		// * COMPLETED * //
		Product.deleteMany(
			{ sub_category: req.body.subCategoryName },
			(err, doc) => {
				if (err) {
					console.log(err);
				} else {
					console.log("Document Updated: ", doc);
				}
			}
		);
	}
	res.redirect("/inventory/category/" + req.params.categoryID + "/products");
});

// TODO: 5.5. POST: '/inventory/category/:categoryID/product/:productID/:crud', Create, update, and delete products
// * COMPLETED * //
app.post("/inventory/category/:categoryID/product/:id/crud", (req, res) => {
	console.log(req.params, req.body);
	if (req.body.crud === "create") {
		req.body.id = req.params.id;
		delete req.body.crud;
		Category.find({ id: req.params.categoryID }, (err, category) => {
			if (!err) {
				req.body.category = category[0].name;
				// console.log(req.body);
				Product.create(req.body, (err, doc) => {
					if (err) {
						console.log(err);
					} else {
						console.log("Document Saved:", doc);
					}
				});
			} else {
				console.log(err);
			}
		});
	} else if (req.body.crud === "update") {
		req.body.id = req.params.id;
		delete req.body.crud;
		Category.find({ id: req.params.categoryID }, (err, category) => {
			if (!err) {
				req.body.category = category[0].name;
				Product.updateOne(
					{ id: req.params.id },
					{ $set: req.body },
					(err, doc) => {
						if (err) {
							console.log(err);
						} else {
							console.log("Document Updated: ", doc);
						}
					}
				);
			} else {
				console.log(err);
			}
		});
	} else if (req.body.crud === "del") {
		Product.deleteOne({ id: req.params.id }, (err, doc) => {
			if (!err) {
				console.log("Document Updated: ", doc);
			} else {
				console.log(err);
			}
		});
	}
	res.redirect("/inventory/category/" + req.params.categoryID + "/products");
});

// TODO: 5.6. GET: '/inventory/outOfStock', Should generate a PDF for the list of products which are out of stock
// * COMPLETED * //
app.get("/inventory/outOfStock", async (req, res) => {
	try {
		const products = await Product.find({ quantity: 0 }).exec();

		if (!products || products.length === 0) {
			res.send("No products out of stock.");
			return;
		}

		const html = await ejs.renderFile("./views/out-of-stock.ejs", { products });

		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		await page.setContent(html);
		await page.emulateMediaType("screen");
		await page.setViewport({
			width: 595,
			height: 842,
			deviceScaleFactor: 1,
		});
		const pdfBuffer = await page.pdf({
			path: outOfStockPath + "/out-of-stock.pdf",
			format: "A4",
			printBackground: true,
			margin: {
				top: "20mm",
				right: "20mm",
				bottom: "20mm",
				left: "20mm",
			},
		});
		await browser.close();
		res.set({
			"Content-Type": "application/pdf",
			"Content-Disposition": "attachment; filename=outOfStock.pdf",
		});
		res.send(pdfBuffer);
	} catch (err) {
		console.error(err);
		res.status(500).send("Error generating out of stock report.");
	}
});

// ---------------- PORT ----------------
app.listen(3000, function () {
	console.log("Server started on port 3000");
});
