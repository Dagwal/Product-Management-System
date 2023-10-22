const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create a table to store products in the SQLite database
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, description TEXT, price REAL, stock INTEGER, available BOOLEAN)');
});

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '..', 'app/public/index.html');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Internal Server Error');
      }
    });
});
  

// API to retrieve all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ products: rows });
    });
});


// API to create a new product
app.post('/api/products', (req, res) => {
    const { name, description, price, stock } = req.body;
    const available = true;

    // Check if a product with the same name, description, and price already exists
    db.get('SELECT id FROM products WHERE name = ? AND description = ? AND price = ?', [name, description, price], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (row) {
            res.status(400).json({ error: 'Product with the same details already exists' });
        } else {
            // If no matching product exists, insert the new product
            const stmt = db.prepare('INSERT INTO products (name, description, price, stock, available) VALUES (?, ?, ?, ?, ?)');
            stmt.run(name, description, price, stock, available, (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ message: 'Product added' });
            });
            stmt.finalize();
        }
    });
});

// API to get a product by ID
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;

    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!row) {
            res.status(404).json({ message: 'Product not found' });
        } else {
            res.json(row);
        }
    });
});


// API to update a product by ID
app.put('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const { name, description, price, stock } = req.body;

    const stmt = db.prepare('UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?');
    stmt.run(name, description, price, stock, productId, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({ message: 'Product updated' });
    });
    stmt.finalize();
});


// API to delete a product by ID
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;

    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    stmt.run(productId, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({ message: 'Product deleted' });
    });
    stmt.finalize();
});

// Function to mark a product as out of stock
app.put('/api/products/:id/markOutOfStock', (req, res) => {
    const productId = req.params.id;
    
    // Fetch the product from the database based on the product ID
    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // Check if the product is already out of stock
        if (product.available === 0) {
            res.status(400).json({ message: 'Product is already out of stock' });
            return;
        }

        // Update the product's availability in the database
        db.run('UPDATE products SET available = 0 WHERE id = ?', [productId], (updateErr) => {
            if (updateErr) {
                res.status(500).json({ error: updateErr.message });
                return;
            }

            // Send a success response
            res.status(200).json({ message: 'Product marked as out of stock' });
        });
    });
});


// API to update a product btn?
app.put('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;

    // Update the product in the SQLite database
    db.run(
        'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
        [updatedProduct.name, updatedProduct.description, updatedProduct.price, updatedProduct.stock, productId],
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.status(200).json({ message: 'Product updated successfully' });
        }
    );
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

























































// The first Method

// const express = require('express');
// const sqlite3 = require('sqlite3');
// const path = require('path');

// const app = express();
// const db = new sqlite3.Database('./database.sqlite');

// // Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// // Create a products table in the SQLite database
// db.serialize(() => {
//     db.run('CREATE TABLE IF NOT EXISTS products (name TEXT, description TEXT, price REAL, stock INTEGER)');
// });

// // API endpoint for adding a product
// app.post('/api/products', express.json(), (req, res) => {
//     const { name, description, price, stock } = req.body;

//     db.run('INSERT INTO products VALUES (?, ?, ?, ?)', [name, description, price, stock], (err) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ message: 'Server error' });
//         }
//         res.status(201).json({ message: 'Product added' });
//     });
// });

// // API endpoint for getting all products
// app.get('/api/products', (req, res) => {
//     db.all('SELECT * FROM products', (err, rows) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).json({ message: 'Server error' });
//         }
//         res.json(rows);
//     });
// });

// // Start the server
// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });
