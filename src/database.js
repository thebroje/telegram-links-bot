const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'telegramBot';
const collectionName = 'allowedLinks';

let db;
let collection;

async function connectDB() {
  try {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    collection = db.collection(collectionName);
    console.log(`Connected to the database: ${dbName}`);
  } catch (error) {
    console.error(`Error connecting to the database: ${error.message}`);
  }
}

async function addLink(link) {
  if (!collection) {
    await connectDB(); // Intenta conectar a la base de datos si no está conectado
  }
  try {
    const result = await collection.insertOne({ url: link });
    console.log(`Link inserted in the database: ${link}`);
    return result;
  } catch (error) {
    console.error(`Error adding link ${link}:`, error.message);
  }
}

async function isLinkRegistered(link) {
  if (!collection) {
    await connectDB(); // Intenta conectar a la base de datos si no está conectado
  }
  try {
    const result = await collection.findOne({ url: link });
    console.log(`Link search result: ${result}`);
    return !!result;
  } catch (error) {
    console.error(`Error verifying link ${link}:`, error.message);
  }
}

async function addUserWarning(userId) {
  if (!collection) {
    await connectDB(); // Intenta conectar a la base de datos si no está conectado
  }

  try {
    const user = await collection.findOne({ userId });
    if (user) {
      const updatedUser = await collection.updateOne(
        { userId },
        { $inc: { warnings: 1 } }
      );
      return updatedUser.matchedCount ? user.warnings + 1 : 1;
    } else {
      const newUser = await collection.insertOne({ userId, warnings: 1 });
      return 1;
    }
  } catch (error) {
    console.error(`Error adding user warning  ${userId}:`, error.message);
  }
}

async function removeLink(link) {
  if (!collection) {
    await connectDB(); // Intenta conectar a la base de datos si no está conectado
  }
  try {
    const result = await collection.deleteOne({ url: link });
    if (result.deletedCount > 0) {
      console.log(`Link removed from database: ${link}`);
      return true;
    } else {
      console.log(`The link ${link} was not found in the database..`);
      return false;
    }
  } catch (error) {
    console.error(`Error deleting link ${link}:`, error.message);
  }
}

module.exports = {
  addLink,
  isLinkRegistered,
  addUserWarning,
  removeLink,
};