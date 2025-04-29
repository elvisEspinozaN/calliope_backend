# calliope backend

![seed file](https://i.imgur.com/i230LLi.png)

## Overview

A RESTful API for Calliope's e-commerce platform built with Express.js and PostgreSQL. Provides complete product management, user authentication, shopping cart functionality, and admin controls.

## Features

- **User Authentication**: Secure JWT-based registration/login
- **Product Catalog**: Browse all products or view individual details
- **Shopping Cart**: Persistent cart with add/update/remove functionality
- **Admin Dashboard**: Manage products and users (admin-only)
- **Checkout Simulation**: Simple order confirmation system

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Postman (for API testing)

## Database Schema

```sql
users (
  id UUID PRIMARY KEY,
  username VARCHAR(49) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  ...
);

products (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  ...
);

user_products (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL
);
```

## Base URL

`http://localhost:3000/api`

## Routes Overview

### Public Routes (No Authentication)

| Method | Endpoint       | Description                |
| ------ | -------------- | -------------------------- |
| GET    | /products      | Get all products           |
| GET    | /products/:id  | Get single product details |
| POST   | /auth/register | Register new user          |
| POST   | /auth/login    | Login existing user        |

### Authorized Routes (Require JWT)

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | /cart             | Get user's cart           |
| POST   | /cart             | Add item to cart          |
| PUT    | /cart/:cartItemId | Update cart item quantity |
| DELETE | /cart/:cartItemId | Remove item from cart     |

### Admin Routes (Require Admin Privileges)

| Method | Endpoint            | Description             |
| ------ | ------------------- | ----------------------- |
| GET    | /admin/users        | Get all users           |
| POST   | /admin/products     | Create new product      |
| PUT    | /admin/products/:id | Update existing product |
| DELETE | /admin/products/:id | Delete product          |

## Contact

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue)](https://www.linkedin.com/in/elvis-espinoza/)

✉️ elvis.espinoza.navarrete@outlook.com

## Acknowledgments

- Fullstack Academy instructors
