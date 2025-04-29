require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret";

const {
  client,
  findUserByToken,
  fetchProducts,
  fetchProductById,
  createUser,
  authenticate,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  fetchUsers,
  createProduct,
  updateProduct,
  deleteProduct,
  checkoutCart,
} = require("./db");

const app = express();
client.connect();

// middleware
app.use(express.json());
app.use(morgan("dev"));

// authentication middleware
app.use(async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (token) {
      const user = await findUserByToken(token);

      if (!user?.id) {
        return res.status(401).json({
          error: "Invalid or expired token",
        });
      }
      req.user = user;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// admin middleware
function isAdmin(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

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
      res.status(404).send({ error: "Product not found" });
    }
  } catch (err) {
    next(err);
  }
});

// auth routes
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await authenticate(username, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

// user/cart routes
app.get("/api/cart", async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const cart = await getCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
});

app.post("/api/cart", async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const item = await addToCart(
      req.user.id,
      req.body.productId,
      req.body.quantity
    );
    res.json(item);
  } catch (err) {
    next(err);
  }
});

app.put("/api/cart/:cartItemId", async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const updatedItem = await updateCartItem(
      req.params.cartItemId,
      req.body.quantity
    );
    res.json(updatedItem);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/cart/:cartItemId", async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    await removeFromCart(req.params.cartItemId);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// admin routes
app.get("/api/admin/users", isAdmin, async (req, res, next) => {
  try {
    const users = await fetchUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.post("/api/admin/products", isAdmin, async (req, res, next) => {
  try {
    const product = await createProduct(req.body);
    res.json(product);
  } catch (err) {
    next(err);
  }
});

app.put("/api/admin/products/:id", isAdmin, async (req, res, next) => {
  try {
    const updatedProduct = await updateProduct(req.params.id, req.body);
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
});

app.delete("/api/admin/products/:id", isAdmin, async (req, res, next) => {
  try {
    await deleteProduct(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// checkout routes
app.post("api/checkout", async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    await checkoutCart(req.user.id);
    res.json({ message: "Checkout successful!" });
  } catch (err) {
    next(err);
  }
});
