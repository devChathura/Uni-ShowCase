require("dotenv").config();
const mongoose = require("mongoose");

require("./src/models/User");
require("./src/models/Project");
require("./src/models/Invitation");
require("./src/models/Like");
require("./src/models/Follower");
require("./src/models/Notification");

async function initializeDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables",
      );
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log(" Connected to MongoDB.");

    console.log("Initializing collections and building indexes...");

    const models = mongoose.modelNames();

    for (const modelName of models) {
      const Model = mongoose.model(modelName);

      console.log(
        `Processing model: ${modelName} (Collection: ${Model.collection.name})`,
      );

      await Model.createCollection().catch((err) => {
        if (err.code !== 48) {
          throw err;
        }
      });

      await Model.syncIndexes();

      console.log(` - Collection and indexes ready.`);
    }

    console.log(" Database initialization complete!");
  } catch (error) {
    console.error(" Database initialization failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log(" Disconnected from MongoDB.");
    process.exit(0);
  }
}

initializeDatabase();
