require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const {
  client,
  findUserByToken,
  fetchProducts,
  fetchProductById,
} = require("./db");

const app = express();
client.connect();

// middleware
app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`- server listening on port ${port}`));

// product routes
app.get("/api/products", async (req, res, next) => {
  try {
    const products = await fetchProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

app.get("/api/products/:id", async (req, res, next) => {
  try {
    const product = await fetchProductById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).send({ message: "Product not found" });
    }
  } catch (err) {
    next(err);
  }
});
