import mongoose from 'mongoose';
import dns from 'dns';

// Override system DNS with Google Public DNS to bypass querySrv SRV lookup issues (local dev only)
if (!process.env.VERCEL) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    if (dns.setDefaultResultOrder) {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (dnsError) {
    console.warn('Warning: Could not configure custom DNS servers:', dnsError.message);
  }
}

// Cache the connection across serverless invocations so each request doesn't reconnect.
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .then((conn) => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = null; // allow a retry on the next request
        console.error(`Error connecting to MongoDB: ${error.message}`);
        throw error;
      });
  }
  return connectionPromise;
};

export default connectDB;
