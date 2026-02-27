// Import necessary modules
const fs = require("fs/promises");
const express = require('express');
const dotenv = require('dotenv');
const stripe = require('stripe');
//const bcrypt = require('bcrypt');
const session = require('express-session');
const products = require('./productImages.json');
const categories = [...new Set(products.map(item => item.category))].sort();

const images = require('./siteImages.json');
const path = require('path');
//const sqrl = require('squirrelly');
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

// Serve static files for a basic frontend
app.use(express.static('public'));

app.set("view engine", "squirrelly")
app.set("views", "./public/views")

//sqrl.templates.define('header', sqrl.compile(path.join(__dirname, 'public/views/header.squirrelly')));
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


//==========chat gpt said this was the best way to reliably write to a json flat file reducing data corruption ===//
async function atomicWrite(filePath, data) {
  /*usage
    atomicWrite("products.json", db)
  .then(() => console.log("Database saved safely!"))
  .catch(err => console.error("Save failed:", err));

  */
  const tmpPath = filePath + ".tmp";
  const jsonString = JSON.stringify(data, null, 2);

  // Step 1: Write to temporary file
  await fs.writeFile(tmpPath, jsonString, "utf8");

  // Step 2: Atomically rename
  await fs.rename(tmpPath, filePath);
}
const calculateOrderAmount = (items) => {
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  let total = 0;
  items.forEach((item) => {
    total += item.amount;
  });
  return total;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});


app.get('/', (req, res) => {
  res.render('index', {categories:categories});
});
// // Get user profile
// app.get('/api/profile', (req, res) => {
//   if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
//   const user = users.find(user => user.username === req.session.user.username);
//   if (!user) return res.status(404).json({ error: 'User not found' });
//   res.json({ username: user.username, tokens: user.tokens });
// });

// Endpoint to get product list
app.get('/api/products', (req, res) => {
  //do pagination if products greater than 100.
  //default to showing 50 products per page.

  res.json(products);
});

app.get("/product", (req, res) => {
  res.render('product');
});

// serve JSON for the product
app.get("/api/product/:id", (req, res) => {
  const productId = req.params.id;
  console.log(req.params.id)
  const product = products.find((i) => i.id == productId)
  console.log(product)
  res.json(product);
});

app.get('/api/products/:category', (req, res) => {
  //do pagination if products greater than 100.
  //default to showing 50 products per page.
  const productId = req.params.category;
  console.log(req.params.category)
  const product = products.find((i) => i.category == productId)

  res.json(products);
});
// // Endpoint to create a Stripe Checkout session
// app.post('/api/create-checkout-session', async (req, res) => {
//   const { productId } = req.body;

//   const product = products.find((p) => p.id === productId);
//   if (!product) {
//     return res.status(404).json({ error: 'Product not found' });
//   }

//   try {
//     const session = await stripeInstance.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price_data: {
//             currency: 'usd',
//             product_data: {
//               name: product.name,
//             },
//             unit_amount: product.price,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: 'payment',
//       success_url: `${req.headers.origin}/success`,
//       cancel_url: `${req.headers.origin}/cancel`,
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error('Error creating Stripe session:', error);
//     res.status(500).json({ error: 'Failed to create checkout session' });
//   }
// });

// Checkout endpoint
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;

    // Validate the cart
    const line_items = cart.map(item => {
      console.log(item)
      const product = products[item.id - 1];
      console.log(product)
      if (!product) throw new Error("Invalid product: " + item.id);

      return {
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.price,
        },
        quantity: item.qty,
      };
    });

    // Create Stripe checkout session
    const session = await stripeInstance.checkout.sessions.create({
      mode: "payment",
      line_items,
      // ✅ Collect addresses
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"], // customize as needed
      },

      // Optional shipping rates (flat rate example)
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Free Shipping",
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "usd" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ],
      //this will need to be put into an .env
      success_url: `https://sarawrart.vfpmedia.com/success`,
      cancel_url: "https://sarawrart.vfpmedia.com/cancel",
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/success', (req,res) => {
  res.render('success');
});

app.get('/cancel', (req,res) => {
  res.render('cancel');
});
app.get('/about', (req, res) => {
  res.render('about');
})

// app.get('/contact', (req, res) => {
//   res.render('contact');
// });

app.get('/catalog', (req, res) => {
  res.render('catalog');
});

app.get('/cart',(req,res) => {
  res.render('cart')
});
app.use( ( req, res, next ) => {
  res.status( 404 ).render("404");
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
