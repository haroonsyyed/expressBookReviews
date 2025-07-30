const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  // Get username and password from request body
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Validate user credentials
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    
    // Store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(401).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;
  
  // Get the review from the request query
  const review = req.query.review;
  
  // Get the username from the session
  const username = req.session.authorization.username;
  
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Check if review is provided
  if (!review) {
    return res.status(400).json({message: "Review is required"});
  }
  
  // Check if user is logged in
  if (!username) {
    return res.status(401).json({message: "User not logged in"});
  }
  
  // Initialize reviews object if it doesn't exist
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }
  
  // Add or modify the review for the current user
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({message: "Review added/modified successfully"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;
  
  // Get the username from the session
  const username = req.session.authorization.username;
  
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // Check if user is logged in
  if (!username) {
    return res.status(401).json({message: "User not logged in"});
  }
  
  // Check if reviews exist for this book
  if (!books[isbn].reviews) {
    return res.status(404).json({message: "No reviews found for this book"});
  }
  
  // Check if the user has a review for this book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "No review found for this user"});
  }
  
  // Delete the user's review
  delete books[isbn].reviews[username];
  
  return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
