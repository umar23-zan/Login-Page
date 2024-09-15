const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
const encoder = bodyParser.urlencoded();

app.use(cookieParser());

// Session configuration
app.use(session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 15 * 60 * 1000 // 15 minutes by default
    }
}));

app.use("/assets", express.static("assets"));

// Database connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodejs"
});

connection.connect(function (error) {
    if (error) throw error;
    else console.log("Connected to Database Successfully!");
});

// Serve login page
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

// Handle login
app.post("/", encoder, function (req, res) {
    const username1 = req.body.username1;
    const password1 = req.body.password1;
    const rememberMe = req.body.rememberMe;

    connection.query("SELECT * FROM loginDetails WHERE username = ? AND password = ?", [username1, password1], function (error, results) {
        if (results.length > 0) {
            req.session.username = username1;

            // Check if "Remember Me" is checked
            if (rememberMe) {
                // Set a cookie to last for 30 days
                res.cookie('username', username1, { maxAge: 30 * 24 * 60 * 60 * 1000 }); // 30 days
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Session also lasts 30 days
            }

            res.redirect("/Welcome");
        } else {
            res.redirect("/");
        }
        res.end();
    });
});

// Welcome page with session check
app.get("/Welcome", function (req, res) {
    if (req.session.username) {
        res.sendFile(__dirname + "/home.html");
    } else {
        res.redirect("/");
    }
});

// Auto-logout after session expiration
app.use((req, res, next) => {
    if (req.session) {
        if (req.session.cookie.maxAge <= 0) {
            req.session.destroy();
        }
    }
    next();
});

const nodemailer = require('nodemailer');
const crypto = require('crypto'); // For generating reset token

// Handle Forgot Password
app.get("/forgot-password", function (req, res) {
    res.sendFile(__dirname + "/forgot-password.html");
});

app.post("/forgot-password", encoder, function (req, res) {
    const email = req.body.email;

    // Check if the email exists in the database
    connection.query("SELECT * FROM loginDetails WHERE email = ?", [email], function (error, results) {
        if (results.length > 0) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetURL = `http://localhost:5000/reset-password/${resetToken}`;

            // Save token and set expiry time (1 hour)
            connection.query("UPDATE loginDetails SET resetToken = ?, resetTokenExpire = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?", [resetToken, email], function (err) {
                if (err) throw err;

                // Send email with reset link
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'your-email@gmail.com',
                        pass: 'your-email-password'
                    }
                });

                const mailOptions = {
                    from: 'your-email@gmail.com',
                    to: email,
                    subject: 'Password Reset',
                    text: `You requested a password reset. Click the following link to reset your password: ${resetURL}`
                };

                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        console.error('Error sending email: ', err);
                        res.send("There was an error sending the email.");
                    } else {
                        res.send("Password reset link has been sent to your email.");
                    }
                });
            });
        } else {
            res.send("No account found with that email.");
        }
    });
});

// Reset Password Page
app.get("/reset-password/:token", function (req, res) {
    const token = req.params.token;

    // Check if token exists and is still valid
    connection.query("SELECT * FROM loginDetails WHERE resetToken = ? AND resetTokenExpire > NOW()", [token], function (error, results) {
        if (results.length > 0) {
            res.sendFile(__dirname + "/reset-password.html");
        } else {
            res.send("Password reset link is invalid or has expired.");
        }
    });
});

// Handle Password Reset Submission
app.post("/reset-password/:token", encoder, function (req, res) {
    const token = req.params.token;
    const newPassword = req.body.password;

    // Validate token and update password
    connection.query("SELECT * FROM loginDetails WHERE resetToken = ? AND resetTokenExpire > NOW()", [token], function (error, results) {
        if (results.length > 0) {
            const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex'); // Example hashing

            // Update password and clear reset token
            connection.query("UPDATE loginDetails SET password = ?, resetToken = NULL, resetTokenExpire = NULL WHERE resetToken = ?", [hashedPassword, token], function (err) {
                if (err) throw err;
                res.send("Your password has been reset successfully. You can now log in.");
            });
        } else {
            res.send("Password reset link is invalid or has expired.");
        }
    });
});

app.listen(5000, function () {
    console.log("Server is running on Port 5000");
});
