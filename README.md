# Chatterbox

Chatterbox is a real-time chat application built with the MERN (MongoDB, Express, React, Node.js) stack. It allows users to register, log in, and chat with each other in a user-friendly interface. The application also supports features like profile pictures, user search, and unread message notifications.

## Features

- User registration and login
- Profile pictures for users
- Real-time chat functionality using Socket.IO
- Search functionality to find and add new chat users
- Unread message notifications
- Responsive design using Tailwind CSS

## Technologies Used

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-time Communication**: Socket.IO
- **Authentication**: JSON Web Tokens (JWT)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/neha-0428/ChatterBox.git
   ```

2. Navigate to the project directory:
   ```bash
   cd chatterbox
   ```

3. Install the backend dependencies:
   ```bash
   cd Server/
   npm install
   ```

4. Install the frontend dependencies:
   ```bash
   cd Client/
   npm install
   ```

5. Set up environment variables for the backend (e.g., MongoDB URI, JWT secret) in a `.env` file.

6. Run the backend server:
   ```bash
   cd Server
   nodemon start
   ```

7. In another terminal, run the frontend application:
   ```bash
   cd Client
   npm run dev
   ```

## Usage

- Navigate to `http://localhost:3000` in your web browser to access the application.
- Register a new account or log in with an existing account.
- Start chatting with other users by selecting them from the chat list.

