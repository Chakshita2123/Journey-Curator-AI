import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;

// Defer the error to runtime (request time) rather than module load / build time.
// On Render, env vars are available at runtime but the build step may not have them.
function getMongoClient(): Promise<MongoClient> {
  if (!uri) {
    return Promise.reject(
      new Error(
        "MONGODB_URI environment variable is not set. " +
        "Add it in the Render dashboard under Environment Variables."
      )
    );
  }

  const options: MongoClientOptions = {
    serverSelectionTimeoutMS: 10_000,
  };

  const client = new MongoClient(uri, options);
  return client.connect();
}

// In development, use a global variable so the MongoClient is not
// re-created on every hot-reload (Next.js dev mode).
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = getMongoClient();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each module instance.
  clientPromise = getMongoClient();
}

export default clientPromise;
