# ManaBazaar - Grocery Store's Web App

System designed for invoice generation and inventory management for ManaBazaar grocery store. It uses MongoDB for database and runs on Express JS with Node.js server. The system uses EJS for rendering templates and HTML and CSS, Bootstrap for styling.

## App Routes

### 1. Invoice

- `GET: '/'`: Get products, process the template to showcase products and invoice, today's sales count and amount.
- `POST: '/'`: Submit the Invoice Order, Generate Invoice PDF, store it in the datewise folder in the local system, in the future send it to the customer's Whatsapp Account or App Account.
- `GET: '/getFlats'`: Gets all flats.

### 2. Invoices

- `GET: '/orders'`: Get all orders in descending order sorted on date, render the template.
- `POST: '/invoices/due/clearOne/:invoiceID'`: To clear orders that is default and update the old PDF with Paid On info in the current date due paid one folder.

### 3. Credits

- `GET: '/invoices/due'`: Group Invoices on Flat, sort in descending order on total due amount, render the template.
- `POST: '/invoices/due/clearOne/:invoiceID'`: To clear order that is default and also generate an invoice saying paid, save it in the local system and that particular date.
- `POST: '/invoices/due/clearMany/:flat'`: To clear orders that are default on selected flat and also generate an invoice saying paid, save it in the local system on that particular date.

### 4. Dashboard

### 5. Inventory

- `GET: '/inventory'`: Get all inventory categories, render the template.
- `POST: '/inventory/category/:categoryID/:crud'`: Create, update, and delete category from inventory and corresponding products.
- `GET: '/inventory/category/:categoryID/products'`: Get all products corresponding to category.
- `POST: '/inventory/category/:categoryID/subcategory/crud'`: Create, Update, Delete sub category & corresponding products.
- `POST: '/inventory/category/:categoryID/product/:productID/crud'`: Create, update, and delete products.
- `GET: '/inventory/noStock'`: Should generate a PDF for the list of products which are out of stock.

## Folder Management System
    Date (dd/mm/yyyy)
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
