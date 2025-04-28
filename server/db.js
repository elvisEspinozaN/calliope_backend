require("dotenv").config();
const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret-key";

const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/calliope_backend_db"
);

async function createTables() {
  await client.query(`
    DROP TABLE IF EXISTS user_products;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(49) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      is_admin BOOLEAN DEFAULT FALSE,
      name VARCHAR(255) NOT NULL,
      email_address VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      shipping_address VARCHAR(255) NOT NULL,
      mailing_address VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE products(
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL CHECK (price > 0),
      image_url VARCHAR(255),
      stock INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE user_products(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      UNIQUE(user_id, product_id)
    );
  `);
}

// user methods
async function createUser({
  username,
  password,
  name,
  email_address,
  phone,
  shipping_address,
  mailing_address,
}) {
  const hashed_password = await bcrypt.hash(password, 10);
  const {
    rows: [user],
  } = await client.query(
    `
    INSERT INTO users (id, username, password, name, email_address, phone, shipping_address, mailing_address)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, username, name, email_address, phone, is_admin
    `,
    [
      uuid.v4(),
      username,
      hashed_password,
      name,
      email_address,
      phone,
      shipping_address,
      mailing_address,
    ]
  );
  return user;
}

async function fetchUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, email_address, phone, mailing_address FROM users`
  );
  return rows;
}

// products method
async function createProduct({ name, description, price, image_url, stock }) {
  const {
    rows: [product],
  } = await client.query(
    `
    INSERT INTO products (id, name, description, price, image_url, stock)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [uuid.v4(), name, description, price, image_url, stock]
  );

  return product;
}

async function fetchProducts() {
  const { rows } = await client.query(`
    SELECT id, name, description, price, image_url, stock FROM products
  `);
  return rows;
}

async function fetchProductById(productId) {
  const {
    rows: [product],
  } = await client.query(
    `
    SELECT id, name, description, price, image_url, stock 
    FROM products
    WHERE id = $1
  `,
    [productId]
  );
  return product;
}

// auth methods
async function authenticate(username, password) {
  const {
    rows: [user],
  } = await client.query(
    `
    SELECT * FROM users WHERE username = $1
    `,
    [username]
  );

  if (user && (await bcrypt.compare(password, user.password))) {
    return user;
  }

  return null;
}

async function findUserByToken(token) {
  const { id } = jwt.verify(token, JWT_SECRET);
  const {
    rows: [user],
  } = await client.query(
    `SELECT id, username, name, is_admin FROM users WHERE id = $1`,
    [id]
  );
  return user;
}

// cart methods
async function getCart(userId) {
  const { rows } = await client.query(
    `
    SELECT user_products.id, products.*, user_products.quantity
    FROM user_products
    JOIN products ON products.id = user_products.product_id
    WHERE user_products.user_id = $1
    `,
    [userId]
  );

  return rows;
}

async function addToCart(userId, productId, quantity = 1) {
  const {
    rows: [item],
  } = await client.query(
    `
    INSERT INTO user_products (id, user_id, product_id, quantity)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, product_id) DO UPDATE 
    SET quantity = user_products.quantity + $4
    RETURNING *
    `,
    [uuid.v4(), userId, productId, quantity]
  );

  return item;
}

async function updateCartItem(cartItemId, quantity) {
  const {
    rows: [item],
  } = await client.query(
    `
    UPDATE user_products SET quantity = $2
    WHERE id = $1 
    RETURNING *
    `,
    [cartItemId, quantity]
  );

  return item;
}

async function removeFromCart(cartItemId) {
  await client.query(`DELETE FROM user_products WHERE id = $1`, [cartItemId]);
}

module.exports = {
  client,
  createTables,
  createUser,
  fetchUsers,
  createProduct,
  fetchProducts,
  authenticate,
  findUserByToken,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  fetchProductById,
};
