const {
  client,
  createTables,
  createUser,
  fetchUsers,
  createProduct,
  fetchProducts,
} = require("./db");
const { faker } = require("@faker-js/faker");

async function seed() {
  await client.connect();
  await createTables();
  console.log("- Tables created");

  await seededUsers();
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
  console.log("- Users seeded");
  console.log(await fetchUsers());

  await seedProducts();
  console.log(await fetchProducts());

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
  for (let i = 0; i < 25; i++) {
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
