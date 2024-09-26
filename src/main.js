import { MessageModel } from './models/message.js';
import { graphqlHTTP } from 'express-graphql';
import { UserModel } from './models/user.js';
import { buildSchema } from 'graphql';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';

const app = express();
app.use(
  cors({
    origin: '*',
  }),
);

// SSE clients array
const clients = [];

// SSE route
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers

  clients.push(res);

  req.on('close', () => {
    clients.splice(clients.indexOf(res), 1); // Remove client when connection is closed
  });
});

// Function to send messages to all connected SSE clients
function sendToClients(message) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(message)}\n\n`);
  });
}

// GraphQL Schema Definition
const schema = buildSchema(`
  type User {
    _id: ID!
    username: String!
  }

  type Message {
    _id: ID!
    userId: ID!
    content: String!
    timestamp: String!
    user: User
  }

  type Query {
    messages: [Message]
    getAllUsers: [User]
    getLastMessages(limit: Int): [Message]
  }

  type Mutation {
    sendMessage(userId: ID!, content: String!): Message
    createUser(username: String!, password: String!): User
    loginUser(username: String!, password: String!): User
  }
`);

// GraphQL Resolvers
const root = {
  messages: async () => {
    return await MessageModel.find().populate('userId').sort({ timestamp: -1 }).lean();
  },

  sendMessage: async ({ userId, content }) => {
    const newMessage = new MessageModel({ userId, content });
    await newMessage.save();
    // const populatedMessage = await MessageModel.findById(newMessage._id).populate('userId').lean();
    const populatedMessage = await MessageModel.findById(newMessage._id)
      .populate({
        path: 'userId', // Populates the userId with only the ID
        select: '_id',
      })
      .populate({
        path: 'user', // Populates the virtual field user with user details
        select: 'username', // Only include the username field
      })
      .lean();

    sendToClients(populatedMessage); // Notify all SSE clients about the new message
    return populatedMessage;
  },

  getLastMessages: async (limit) => {
    return await MessageModel.find()
      .populate({
        path: 'userId', // Populates userId with only the ID
        select: '_id', // Ensure only user ID is included in userId
      })
      .populate({
        path: 'user', // Populates the virtual field user with user details
        select: 'username', // Only include the username field
      })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  },

  createUser: async ({ username, password }) => {
    const newUser = new UserModel({ username, password });
    await newUser.save();
    return newUser;
  },

  getAllUsers: async () => {
    return await UserModel.find().lean();
  },

  loginUser: async ({ username, password }) => {
    const user = await UserModel.findOne({ username });
    console.log('🚀 ~ loginUser: ~ user:', user);

    // Check if user exists and verify password
    if (!user || password !== user.password) {
      throw new Error('Invalid credentials');
    }

    // Generate a token (you can include user ID or other data as needed)
    return user;
  },
};

// Connect to MongoDB
mongoose.connect(process.env.DB_URI);

// GraphQL Middleware
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  }),
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// // Serve the HTML page
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html")); // Update the path as needed
// });

// Start Express Server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

setInterval(() => {
  const memoryUsage = process.memoryUsage();
  console.log('Memory Usage:');
  console.log(`RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB`);
  console.log(`Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`);
  console.log(`Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`);
  console.log(`External: ${Math.round(memoryUsage.external / 1024 / 1024)} MB`);
  console.log('-------------');
}, 10000); // Logs memory usage every 10 seconds
