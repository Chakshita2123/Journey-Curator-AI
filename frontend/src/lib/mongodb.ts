import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI!;

if (!uri || uri === "PASTE_YOUR_ATLAS_URI_HERE") {
  throw new Error(
    "Please set MONGODB_URI in your .env.local file.\n" +
    "Format: mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/journey_curator?retryWrites=true&w=majority"
  );
}

// Windows + Node.js bundled OpenSSL sometimes fails TLS handshake with Atlas
// (SSL alert number 80 — internal_error). These options work around it.
const options: MongoClientOptions = {
  serverSelectionTimeoutMS: 10000,
  tls: true,
  tlsAllowInvalidCertificates: true,   // ← fixes ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR on Windows
};

// In development, use a global variable so the MongoClient is not
// re-created on every hot-reload (Next.js dev mode).
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
