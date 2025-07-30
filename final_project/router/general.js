const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  // Get username and password from request body
  const username = req.body.username;
  const password = req.body.password;
  
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  // Check if username already exists
  if (users.find(user => user.username === username)) {
    return res.status(409).json({message: "Username already exists"});
  }
  
  // Add new user to the users array
  users.push({username: username, password: password});
  
  // Return success message
  return res.status(201).json({message: "User successfully registered"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Return all books in the shop
  return res.status(200).json(JSON.stringify(books, null, 2));
});

// Get the book list available in the shop using async-await with Axios
public_users.get('/async', async function (req, res) {
  try {
    // Simulate an async operation (in real scenario, this might be a database call)
    const getBooksAsync = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(books);
        }, 100);
      });
    };
    
    // Use async-await to get books
    const bookList = await getBooksAsync();
    
    // Return the books using async-await
    return res.status(200).json(JSON.stringify(bookList, null, 2));
  } catch (error) {
    return res.status(500).json({message: "Error retrieving books", error: error.message});
  }
});

// Get the book list using Axios to make HTTP request (demonstrates actual Axios usage)
public_users.get('/axios', async function (req, res) {
  try {
    // Use Axios to make an HTTP request to our own API endpoint
    const response = await axios.get('http://localhost:5001/');
    
    // Return the response data
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({message: "Error retrieving books via Axios", error: error.message});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Retrieve the ISBN from the request parameters
  const isbn = req.params.isbn;
  
  // Check if the book exists in the database
  if (books[isbn]) {
    // Return the book details
    return res.status(200).json(JSON.stringify(books[isbn], null, 2));
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found"});
  }
 });

// Get book details based on ISBN using async-await with Promise
public_users.get('/isbn/:isbn/async', async function (req, res) {
  try {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;
    
    // Simulate an async operation to get book details
    const getBookDetailsAsync = (isbn) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (books[isbn]) {
            resolve(books[isbn]);
          } else {
            reject(new Error("Book not found"));
          }
        }, 100);
      });
    };
    
    // Use async-await to get book details
    const bookDetails = await getBookDetailsAsync(isbn);
    
    // Return the book details using async-await
    return res.status(200).json(JSON.stringify(bookDetails, null, 2));
  } catch (error) {
    return res.status(404).json({message: error.message});
  }
});

// Get book details based on ISBN using Axios
public_users.get('/isbn/:isbn/axios', async function (req, res) {
  try {
    // Retrieve the ISBN from the request parameters
    const isbn = req.params.isbn;
    
    // Use Axios to make an HTTP request to our own API endpoint
    const response = await axios.get(`http://localhost:5001/isbn/${isbn}`);
    
    // Return the response data
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "Book not found"});
    }
    return res.status(500).json({message: "Error retrieving book details via Axios", error: error.message});
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  // Obtain the author from the request parameters
  const author = req.params.author;
  
  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);
  
  // Array to store books by the specified author
  const booksByAuthor = [];
  
  // Iterate through the 'books' array & check the author matches
  for (let key of bookKeys) {
    if (books[key].author.toLowerCase() === author.toLowerCase()) {
      booksByAuthor.push({
        isbn: key,
        ...books[key]
      });
    }
  }
  
  // Check if any books were found
  if (booksByAuthor.length > 0) {
    // Return the books by the specified author
    return res.status(200).json(JSON.stringify(booksByAuthor, null, 2));
  } else {
    // Return error if no books found for the author
    return res.status(404).json({message: "No books found for this author"});
  }
});

// Get book details based on author using async-await with Promise
public_users.get('/author/:author/async', async function (req, res) {
  try {
    // Obtain the author from the request parameters
    const author = req.params.author;
    
    // Simulate an async operation to get books by author
    const getBooksByAuthorAsync = (author) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Obtain all the keys for the 'books' object
          const bookKeys = Object.keys(books);
          
          // Array to store books by the specified author
          const booksByAuthor = [];
          
          // Iterate through the 'books' array & check the author matches
          for (let key of bookKeys) {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
              booksByAuthor.push({
                isbn: key,
                ...books[key]
              });
            }
          }
          
          if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
          } else {
            reject(new Error("No books found for this author"));
          }
        }, 100);
      });
    };
    
    // Use async-await to get books by author
    const booksByAuthor = await getBooksByAuthorAsync(author);
    
    // Return the books by the specified author using async-await
    return res.status(200).json(JSON.stringify(booksByAuthor, null, 2));
  } catch (error) {
    return res.status(404).json({message: error.message});
  }
});

// Get book details based on author using Axios
public_users.get('/author/:author/axios', async function (req, res) {
  try {
    // Obtain the author from the request parameters
    const author = req.params.author;
    
    // Use Axios to make an HTTP request to our own API endpoint
    const response = await axios.get(`http://localhost:5001/author/${encodeURIComponent(author)}`);
    
    // Return the response data
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "No books found for this author"});
    }
    return res.status(500).json({message: "Error retrieving books by author via Axios", error: error.message});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  // Obtain the title from the request parameters
  const title = req.params.title;
  
  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);
  
  // Array to store books with the specified title
  const booksByTitle = [];
  
  // Iterate through the 'books' array & check the title matches
  for (let key of bookKeys) {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle.push({
        isbn: key,
        ...books[key]
      });
    }
  }
  
  // Check if any books were found
  if (booksByTitle.length > 0) {
    // Return the books with the specified title
    return res.status(200).json(JSON.stringify(booksByTitle, null, 2));
  } else {
    // Return error if no books found for the title
    return res.status(404).json({message: "No books found for this title"});
  }
});

// Get book details based on title using async-await with Promise
public_users.get('/title/:title/async', async function (req, res) {
  try {
    // Obtain the title from the request parameters
    const title = req.params.title;
    
    // Simulate an async operation to get books by title
    const getBooksByTitleAsync = (title) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Obtain all the keys for the 'books' object
          const bookKeys = Object.keys(books);
          
          // Array to store books with the specified title
          const booksByTitle = [];
          
          // Iterate through the 'books' array & check the title matches
          for (let key of bookKeys) {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
              booksByTitle.push({
                isbn: key,
                ...books[key]
              });
            }
          }
          
          if (booksByTitle.length > 0) {
            resolve(booksByTitle);
          } else {
            reject(new Error("No books found for this title"));
          }
        }, 100);
      });
    };
    
    // Use async-await to get books by title
    const booksByTitle = await getBooksByTitleAsync(title);
    
    // Return the books with the specified title using async-await
    return res.status(200).json(JSON.stringify(booksByTitle, null, 2));
  } catch (error) {
    return res.status(404).json({message: error.message});
  }
});

// Get book details based on title using Axios
public_users.get('/title/:title/axios', async function (req, res) {
  try {
    // Obtain the title from the request parameters
    const title = req.params.title;
    
    // Use Axios to make an HTTP request to our own API endpoint
    const response = await axios.get(`http://localhost:5001/title/${encodeURIComponent(title)}`);
    
    // Return the response data
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({message: "No books found for this title"});
    }
    return res.status(500).json({message: "Error retrieving books by title via Axios", error: error.message});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  // Get the ISBN from the request parameters
  const isbn = req.params.isbn;
  
  // Check if the book exists in the database
  if (books[isbn]) {
    // Return the book reviews
    return res.status(200).json(JSON.stringify(books[isbn].reviews, null, 2));
  } else {
    // Return error if book not found
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
