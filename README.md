# ManaBazaar - Grocery Store's Web App

[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)](https://www.mongodb.com/)
[![ExpressJS](https://img.shields.io/badge/Server-ExpressJS-blue)](https://expressjs.com/)
[![NodeJS](https://img.shields.io/badge/Backend-NodeJS-green)](https://nodejs.org/en/)
[![EJS](https://img.shields.io/badge/Template-EJS-orange)](https://ejs.co/)
[![Bootstrap](https://img.shields.io/badge/Frontend-Bootstrap-purple)](https://getbootstrap.com/)

ManaBazaar is a Web App for invoice generation and inventory management for a grocery store. It is built using the MongoDB database, Express JS with Node.js server, and EJS for rendering templates, HTML, and CSS. Bootstrap is used for UI/UX design.

## Table of Contents
- [App Routes](#app-routes)
- [Folder Management System](#folder-management-system)
- [ToDo List](#todo-list)
- [Installation](#installation)
- [Usage](#usage)
- [Contributions](#contributions)
- [Credits](#credits)

## App Routes

### 1. Invoice
- `GET: '/'`
  - Get products, process the template to showcase products and invoice, today's sales count and amount.
- `POST: '/'`
  - Submit the Invoice Order, Generate Invoice PDF, store it in datewise folder in local system, in future send it to the customer's Whatsapp Account or App Account.
- `GET: '/getFlats'`
  - Gets all flats.

### 2. Invoices
- `GET: '/invoices'`
  - Get all orders in descending order sorted on date, render the template.
- `POST: '/invoices/due/clearOne/:invoiceID'`
  - To clear orders that are default and update the old PDF with Paid On info in the current date due paid one folder.

### 3. Credits
- `GET: '/invoices/due'`
  - Group Invoices on Flat, sort in descending order on total due amount, render the template.
- `POST: '/invoices/due/clearOne/:invoiceID'`
  - To clear orders that are default and also generate an invoice saying paid, save it in the local system and that particular date.
- `POST: '/invoices/due/clearMany/:flat'`
  - To clear orders that are default on selected flat and also generate an invoice saying paid, save it in the local system on that particular date.

### 4. Dashboard
- Under development.

### 5. Inventory
- `GET: '/inventory'`
  - Get all inventory categories, render the template.
- `POST: '/inventory/category/:categoryID/:crud'`
  - Create, update, and delete category from inventory and corresponding products.
- `GET: '/inventory/category/:categoryID/products'`
  - Get all products corresponding to category.
- `POST: '/inventory/category/:categoryID/subcategory/crud'`
  - Create, Update, Delete sub category & corresponding products.
- `POST: '/inventory/category/:categoryID/product/:productID/crud'`
  - Create, update, and delete products.
- `GET: '/inventory/noStock'`
  - Should generate a PDF for the list of products which are out of stock.

## Folder Management System
ManaBazaar has a folder management system as follows:

- Date (dd/mm/yyyy)
  - Logs
    - Error
    - Combined
    - Stock Update log
  - PDFs
    - Invoices
      - Paid
        - example: flat-invoiceID.pdf
      - Due
        - example: flat-invoiceID.pdf
      - Due Cleared
        - One
          - example: flat-invoiceID.pdf
        - Many
          - example: flat-invoiceID.pdf
    - Out of Stock
      - example: outOfStock.pdf

## To Do List

1. [ ] Dashboard
2. [ ] Product Image
3. [ ] Logo
4. [ ] Navbar Revamp
5. [ ] UI/UX Revamp
6. [ ] Code Refactoring
7. [ ] Go For Production
8. [ ] Make Mobile Friendly Version
9. [ ] Setup WhatsApp Business API to send invoices to customers
10. [ ] Input Validations
11. [ ] Stock Update logs to be stored
12. [ ] Product Duplicate Check
13. [ ] Validation Logic: Cost Price < Selling Price < Market Retail Price and
14. [ ] Authentication
15. [ ] Include Screenshots in Github Readme
16. [ ] Explain Mongoose Models

## Installation

1. Clone the repository and navigate into the project directory.
2. Install the dependencies using `npm install`.
3. Start the server using `npm start`.

## Usage

1. Navigate to `http://localhost:3000/` to access the invoice system.
2. Use the app routes listed above to access different features of the system.
3. Use the templates provided in the project to customize the look and feel of the system.

## Contributions

Contributions are welcome! If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Write your code and add tests if necessary.
4. Commit your changes and push your branch to your fork.
5. Submit a pull request with a detailed description of your changes.

## Credits

This project was created by Kadiyala Mani with the help of Udemy's Coursework: `The Complete 2023 Web Development Bootcamp by Dr. Angela Yu`.
