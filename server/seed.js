const {
  client,
  createTables,
  createUser,
  fetchUsers,
  createProduct,
  fetchProducts,
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
} = require("./db");
const { faker } = require("@faker-js/faker");

async function seed() {
  await client.connect();
  await createTables();
  console.log("\n- Tables created");

  await createUser({
    username: "admin",
    password: "test123",
    name: "Elvis Esp",
    is_admin: true,
    email_address: "email@test.com",
    phone: "1234567890",
    shipping_address: "123 Test Street",
    mailing_address: "123 Test Street",
  });
  await seedUsers();
  console.log("\n- Users seeded:");
  const users = await fetchUsers();
  console.table(users.slice(0, 3));

  await seedProducts();
  console.log("\n- Products seeded:");
  const products = await fetchProducts();
  console.table(products.slice(0, 3));

  const userTest = users[0];
  const product1 = products[0];
  const product2 = products[1];
  await addToCart(userTest.id, product1.id, 2);
  await addToCart(userTest.id, product2.id, 3);

  let cart = await getCart(userTest.id);
  console.log("\n- Cart after adding two products:");
  console.table(
    cart.map((item) => ({
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
      cart_item_id: item.cart_item_id,
    }))
  );

  const cartItem1 = cart[0];
  await updateCartItem(cartItem1.cart_item_id, 5);
  cart = await getCart(userTest.id);
  console.log("\n- Cart after updating quantity of first product:");
  console.table(
    cart.map((item) => ({
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
      cart_item_id: item.cart_item_id,
    }))
  );

  await removeFromCart(cartItem1.cart_item_id);
  cart = await getCart(userTest.id);
  console.log("\n- Cart after removing the first product:");
  console.table(
    cart.map((item) => ({
      product_name: item.name,
      price: item.price,
      quantity: item.quantity,
      cart_item_id: item.cart_item_id,
    }))
  );

  await client.end();
}

async function seedUsers() {
  for (let i = 0; i < 10; i++) {
    await createUser({
      username: faker.internet.username(),
      password: "test123",
      name: faker.person.fullName(),
      email_address: faker.internet.email(),
      phone: faker.string.numeric(10),
      shipping_address: faker.location.streetAddress(),
      mailing_address: faker.location.streetAddress(),
    });
  }
}

async function seedProducts() {
  for (let i = 0; i < 50; i++) {
    await createProduct({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: faker.commerce.price({ min: 1, max: 250 }),
      image_url: faker.image.url(),
      stock: faker.number.int({ min: 1, max: 20 }),
    });
  }
}

seed();
