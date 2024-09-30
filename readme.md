# SSE-Based Global Chat App

This project is a **global chat application** built using **Server-Sent Events (SSE)**. It allows users to join a single chat room (global) and exchange messages in real-time. SSE is used to push new messages to all connected clients, making the chat experience seamless and efficient.

## Features

- **Global Chat Room**: A single chat room where all users can join and participate.

- **Real-time Communication**: Messages are broadcasted to all users using SSE.

- **Lightweight**: No complex WebSocket setup, leveraging the simplicity of SSE.

## Tech Stack

- **Backend**: Node.js (Express.js with SSE)

- **Frontend**: HTML, CSS, JavaScript (SSE client for receiving updates)

- **Transport**: Server-Sent Events (SSE)

## Getting Started

### Prerequisites

To run this project, you need to have the following installed:

- [Node.js](https://nodejs.org/) (v16.x or higher)

- [NPM](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/sse-global-chat-app.git
cd sse-global-chat-app
```

2. Install the dependencies:

```bash
npm install
```

3. Set up environment variables:
   Rename the .env.example file to .env:

```bash
cp  .env.example  .env
```

4.  Open the .env file and configure the environment variables as needed. Example:

```bash
NODE_ENV=development
DB_URI=mongodb://localhost:27017/chat-app
PORT=4000
ORIGIN=http://localhost:4000
```

5.  Start the server:

```bash
npm start
```

The server will start on http://localhost:4000.

## Usage

- Open the app in your browser by navigating to http://localhost:3000.

- Enter a username and start chatting! All users will see messages in real-time.

## Project Structure

```bash

sse-global-chat-app/

├──  public/  # Frontend assets

│  ├──  index.html  # Chat UI

│  └──  main.js  # Client-side JS (SSE)

├──  server.js  # Express server with SSE implementation

├──  .env.example  # Example environment variables

├──  .env  # Your environment configuration

├──  package.json  # NPM dependencies and scripts

└──  README.md  # Project documentation
```

## How It Works

1.  **Server Setup**: The server is set up using Express.js. It creates a single SSE endpoint (`/events`) for clients to connect.

2.  **Client Connection**: When a client connects to the server, it listens for new messages using the a graphql endpoint.

3.  **Broadcasting Messages**: When a new message is sent by a client, the server broadcasts it to all connected clients using the SSE connection.

4.  **Real-time Updates**: All clients receive the new message in real-time and display it on the chat interface.\

## Contributing

Feel free to open issues or submit pull requests if you find bugs or have suggestions to improve the app.

Fork the repository

Create a new branch (git checkout -b feature-branch)

Commit your changes (git commit -m 'Add feature')

Push to the branch (git push origin feature-branch)

Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

This version includes the step for adding the `.env` file from the `.env.example`. Let me know if you need further adjustments!

```

```
