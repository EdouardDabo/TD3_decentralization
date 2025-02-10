const express = require('express');
const bodyParser = require('body-parser');
const { Low, JSONFile } = require('lowdb');

const app = express();
const PORT = 3002;

// Set up lowdb
const db = new Low(new JSONFile('db.json'));
const mirrorDb = new Low(new JSONFile('mirrorDb.json')); // Second database for mirroring
db.data ||= { products: [], orders: [], carts: {} };
mirrorDb.data ||= { products: [], orders: [], carts: {} };

app.use(bodyParser.json());

// Products Routes
app.post('/products', async (req, res) => {
    const newProduct = { id: Date.now(), ...req.body };
    db.data.products.push(newProduct);
    await db.write();

    // Synchronous mirroring
    mirrorDb.data.products.push(newProduct);
    await mirrorDb.write();

    res.json(newProduct);
});

app.get('/products/:id', (req, res) => {
    const product = db.data.products.find(p => p.id === parseInt(req.params.id));
    res.json(product || { message: 'Product not found' });
});

app.post('/products', (req, res) => {
    const newProduct = { id: Date.now(), ...req.body };
    db.data.products.push(newProduct);
    db.write();
    res.json(newProduct);
});

app.put('/products/:id', (req, res) => {
    const index = db.data.products.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        db.data.products[index] = { ...db.data.products[index], ...req.body };
        db.write();
        res.json(db.data.products[index]);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.delete('/products/:id', (req, res) => {
    const index = db.data.products.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        db.data.products.splice(index, 1);
        db.write();
        res.json({ message: 'Product deleted' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// Orders Routes
app.post('/orders', (req, res) => {
    const newOrder = { id: Date.now(), ...req.body };
    db.data.orders.push(newOrder);
    db.write();
    res.json(newOrder);
});

app.get('/orders/:userId', (req, res) => {
    const userOrders = db.data.orders.filter(order => order.userId === req.params.userId);
    res.json(userOrders);
});

// Cart Routes
app.post('/cart/:userId', (req, res) => {
    const { productId, quantity } = req.body;
    if (!db.data.carts[req.params.userId]) {
        db.data.carts[req.params.userId] = {};
    }
    db.data.carts[req.params.userId][productId] = (db.data.carts[req.params.userId][productId] || 0) + quantity;
    db.write();
    res.json(db.data.carts[req.params.userId]);
});

app.get('/cart/:userId', (req, res) => {
    res.json(db.data.carts[req.params.userId] || {});
});

app.delete('/cart/:userId/item/:productId', (req, res) => {
    if (db.data.carts[req.params.userId]) {
        delete db.data.carts[req.params.userId][req.params.productId];
        db.write();
    }
    res.json(db.data.carts[req.params.userId]);
});

app.listen(PORT, () => {
    console.log(`E-commerce API is running on http://localhost:${PORT}`);
});
