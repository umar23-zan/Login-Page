# # Login System with "Remember Me" & Forgot Password Functionality

This project implements a **Login System** with session management that includes a "Remember Me" feature and a **Forgot Password** functionality. Users can log in, choose to be remembered for 30 days, and reset their password if forgotten. Auto-logout occurs after 15 minutes of inactivity if "Remember Me" is not checked.

## Features
- **User Authentication**: Secure login using session management.
- **Remember Me**: Option to stay logged in for 30 days.
- **Session Timeout**: Users are automatically logged out after 15 minutes if "Remember Me" is not selected.
- **Password Reset**: Users can reset their password by receiving an email with a reset link.
- **Password Hashing**: (Optional) Passwords are securely stored using hashing techniques.
- **User-Friendly UI**: Simple, responsive design with validation.

## Technologies Used

Node.js: Backend server
Express.js: Web framework for handling requests and sessions
MySQL: Database for storing user credentials and reset tokens
Nodemailer: To send emails for password reset
HTML/CSS: Frontend UI and styles
Sessions & Cookies: To manage user authentication and "Remember Me" functionality
Crypto: For generating secure reset tokens

## Setup Instructions
## Prerequisites
Node.js
MySQL

## Installation Steps:
Install Dependencies
Run the following command to install the required Node.js packages:
```
npm install
```
Set Up MySQL Database
Create a database in MySQL named nodejs. Then, use the following SQL query to create a table for storing user login details:
```
CREATE TABLE loginDetails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  resetToken VARCHAR(255),
  resetTokenExpire DATETIME
);
```
Configure MySQL Connection
Modify the MySQL connection settings in log.js:
```
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodejs"
});
```
Run the Application
Start the server using the following command:
```
node log.js
```
Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```
## How It Works

Login Page:
Users enter their username/email and password.
Users can opt for "Remember Me" to stay logged in for 30 days, otherwise, the session expires after 15 minutes.

Forgot Password:
If a user forgets their password, they can click "Forgot Password" to receive a reset link via email.
The user receives a reset token with an expiration time of 1 hour.

Password Reset:
Users can reset their password by visiting the reset link and entering a new password.

## conclusion
So, That's all about the project and the source code have been attaches. Check it out! 
