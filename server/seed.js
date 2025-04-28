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
  await seededUsers();
  console.log("\n- Users seeded: ");
  const users = await fetchUsers();
  console.table(users.slice(0, 3));

  await seedProducts();
  console.log("\n- Products seeded: ");
  const products = await fetchProducts();
  console.table(products.slice(0, 3));

  const userTest = users[0];
  const productTest = products[0];
  const cartItem = await addToCart(userTest.id, productTest.id, 5);
  console.log("\n- Cart item added: ");
  console.table(cartItem);

  const updatedCartItem = await updateCartItem(cartItem.id, 2);
  console.log("\n- Cart item updated: ");
  console.table(updatedCartItem);

  await removeFromCart(cartItem.id);
  const cart = await getCart(userTest.id);
  console.log("\n- Cart item removed: ");
  console.table(cart);

  await client.end();
}

async function seededUsers() {
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
