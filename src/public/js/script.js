const apiUrl = window.location.origin + '/graphql';
let user = {
  _id: null,
  username: null,
};

const regForm = document.getElementById('register');
regForm.addEventListener('submit', register);

const loginForm = document.getElementById('login');
loginForm.addEventListener('submit', login);

const messageForm = document.getElementById('message-form');
messageForm.addEventListener('submit', sendMessage);

// Function to register a new user
async function register(e) {
  e.preventDefault();
  const username = regForm.elements['register-username'].value;
  const password = regForm.elements['register-password'].value;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
                mutation {
                    createUser(username: "${username}", password: "${password}") {
                        _id
                        username
                    }
                }
            `,
      }),
    });

    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat').style.display = 'block';

    const data = await response.json();
    alert(`Logged in as: ${data.data.createUser.username}`);
    user = data.data.createUser;
    displayUser();

    await getLastMessages();
    // Start receiving SSE events
    startListening();
  } catch (error) {
    console.error(error);
    alert('An error occurred. Please try again.');
  }
}

// Function to log in
async function login(e) {
  e.preventDefault();
  const username = loginForm.elements['login-username'].value;
  console.log('🚀 ~ login ~ username:', username);
  const password = loginForm.elements['login-password'].value;
  console.log('🚀 ~ login ~ password:', password);

  // Simple login simulation (replace with real authentication in a production app)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
                mutation {
                    loginUser(username: "${username}", password: "${password}") {
                        _id
                        username
                    }
                }
            `,
      }),
    });

    const data = await response.json();
    alert(`Logged in as: ${data.data.loginUser.username}`);
    user = data.data.loginUser;
    displayUser();

    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat').style.display = 'block';
    await getLastMessages();
    // Start receiving SSE events
    startListening();
  } catch (error) {
    console.error(error);
    alert('An error occurred. Please try again.');
  }
}

function toggleRegister() {
  if (document.getElementById('register').style.display === 'flex') {
    document.getElementById('register').style.display = 'none';
    document.getElementById('login').style.display = 'flex';
    return;
  }
  document.getElementById('register').style.display = 'flex';
  document.getElementById('login').style.display = 'none';
}

// Function to send a message
async function sendMessage(e) {
  e.preventDefault();
  const content = e.target.elements['message-input'].value;

  if (!content) return;

  await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
                mutation {
                    sendMessage(userId: "${user._id}", content: "${content}") {
                        _id
                        content
                        timestamp
                    }
                }
            `,
    }),
  });

  e.target.elements['message-input'].value = ''; // Clear input after sending
}

async function getLastMessages() {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
            query {
                getLastMessages(limit: 10) {
                    _id
                    content
                    timestamp
                    user {
                        _id
                        username
                    }
                }
            }
        `,
      }),
    });

    const data = await response.json();
    const messages = data.data.getLastMessages;
    messages.reverse().forEach((message) =>
      displayMessage({
        ...message,
        timestamp: new Date(Number(message.timestamp)),
      }),
    );
    // startListening();
  } catch (error) {
    console.error(error);
    alert('An error occurred. Please try again.');
  }
}

function startListening() {
  let eventSource = new EventSource('/events'); // Update with your server URL

  eventSource.onmessage = function (event) {
    try {
      const message = JSON.parse(event.data);
      displayMessage(message);
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  eventSource.onerror = function (error) {
    console.error('Error with SSE connection:', error);

    if (eventSource.readyState === EventSource.CLOSED) {
      console.log('Connection closed by server. Attempting to reconnect...');
      reconnect();
    } else if (eventSource.readyState === EventSource.CONNECTING) {
      console.log('Reconnecting to the server...');
    }
  };

  function reconnect() {
    setTimeout(() => {
      console.log('Reconnecting...');
      startListening(); // Reinitiate the listening process
    }, 5000); // Retry after 5 seconds
  }
}

// Function to display a message in the chat container
function displayMessage(message) {
  const chatContainer = document.getElementById('chat-container');
  const messageElement = document.createElement('div');
  messageElement.className = 'message';
  messageElement.textContent = `>> ${message?.user?.username ?? 'anonymous'}: ${new Date(
    message.timestamp,
  ).toLocaleString({
    timezone: 'kolkata',
  })}: ${message.content}`;
  chatContainer.appendChild(messageElement);
}

function displayUser() {
  const loginDetailsBox = document.getElementById('login-details');
  loginDetailsBox.style.display = 'block';
  loginDetailsBox.textContent = `Logged in as: ${user.username}`;
}
