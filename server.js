// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const stripe = require('stripe');
const bcrypt = require('bcrypt');
const session = require('express-session');
const products = require('./products.json');
const path = require('path');
// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeInstance = stripe(stripeSecretKey);

// Middleware to parse JSON
app.use(express.json());
app.use(session({
  secret: 'your_session_secret_key',
  resave: false,
  saveUninitialized: true,
}));

// In-memory user database (for demonstration purposes)
const users = [];
// Serve static files for a basic frontend
app.use(express.static('public'));
// // User registration
// app.post('/api/register', async (req, res) => {
//   const { username, password } = req.body;
//   if (users.find(user => user.username === username)) {
//     return res.status(400).json({ error: 'User already exists' });
//   }
//   const hashedPassword = await bcrypt.hash(password, 10);
//   users.push({ username, password: hashedPassword, tokens: 0 });
//   res.status(201).json({ message: 'User registered successfully' });
// });

// // User login
// app.post('/api/login', async (req, res) => {
//   const { username, password } = req.body;
//   const user = users.find(user => user.username === username);
//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.status(401).json({ error: 'Invalid credentials' });
//   }
//   req.session.user = { username, tokens: user.tokens };
//   res.json({ message: 'Login successful' });
// });

// Award digital tokens to the user
// app.post('/api/award-tokens', (req, res) => {
//   if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
//   const { tokens } = req.body;
//   const user = users.find(user => user.username === req.session.user.username);
//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }
//   user.tokens += tokens;
//   req.session.user.tokens = user.tokens;
//   res.json({ message: 'Tokens awarded', totalTokens: user.tokens });
// });

// Get user profile
app.get('/api/profile', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = users.find(user => user.username === req.session.user.username);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ username: user.username, tokens: user.tokens });
});

// Endpoint to get product list
app.get('/api/products', (req, res) => {
  //do pagination if products greater than 100.
  //default to showing 50 products per page.

  res.json(products);
});

app.get("/product", (req, res) => {
  res.sendFile(path.join(__dirname, 'public/product.html'));
});

// serve JSON for the product
app.get("/api/product/:id", (req, res) => {
  const productId = req.params.id;
  console.log(req.params.id)
  const product = products.find((i) => i.id == productId)
  console.log(product)
  res.json(product);
});

// Endpoint to create a Stripe Checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  const { productId } = req.body;

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  try {
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});


app.get('/contact', (req, res) => {
  console.log(path.join(__dirname, 'public/contact.html'));
  res.sendFile(path.join(__dirname, 'public/contact.html'));
});

app.get('/catalog', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/catalog.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`E-commerce app listening at http://localhost:${port}`);
});

// Example directory structure:
// - server.js (this file)
// - .env (for STRIPE_SECRET_KEY)
// - public/
//   - index.html (frontend UI for product listing and purchase)
