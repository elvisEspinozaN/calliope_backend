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

async function findUserByToken(token) {
  const { id } = jwt.verify(token, JWT_SECRET);
  const {
    rows: [user],
  } = await client.query(
    `
    SELECT id, username, name, is_admin from user WHERE id=$1
    `,
    [id]
  );
  return user;
}

module.exports = {
  client,
  createTables,
  createUser,
  fetchUsers,
};
