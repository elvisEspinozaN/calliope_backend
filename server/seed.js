const { client, createTables } = require("./db");

async function seed() {
  await client.connect();
  await createTables();
  console.log("- Tables created");
  await client.end();
}

seed();
