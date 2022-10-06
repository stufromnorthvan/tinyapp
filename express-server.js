// Required Middleware
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
// Mount Middleware Functions for Use
app.use(cookieSession({
  name: 'user_id',
  keys: ['modnar', 'edocehtsseug']
}));
app.use(express.urlencoded({ extended: true }));
// Port Number
const PORT = 8080;
// Set View Engine
app.set("view engine", "ejs");
// Helper Functions
const getUserByEmail = require('./helper.js');
// Database of URLS
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
};
// Database of Users
const users = {};
// Function to get URLs made by a particular user
const urlsForUser = (id) => {
  let userURLS = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLS[url] = urlDatabase[url];
    }
  }
  return userURLS;
};
// Function to Generate Random String
const generateRandomString = function() {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let randoString = '';
  let randoInt = function(max) {
    return Math.floor(Math.random() * max);
  };
  for (let r = 0; r < 6; r++) {
    randoString += chars[randoInt(62)];
  }
  return randoString;
};

// ** CRUD BELOW ** WARNING: any changes to the following code could SEVERELY affect functionality.

//Homepage
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
  }
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to create a URL.</body></html>");
    return;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
  return;
});
//Login
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  const comparePass = bcrypt.compareSync(password, user.password);
  if (email === "" || password === "") {
    return res.status(400).send("ERROR (╯°□°)╯ enter e-mail and password please!");
  }
  if (!user) {
    return res.status(404).send("ERROR (╯°□°)╯ an account with that email does not exist!");
  }
  if (user && !comparePass) {
    return res.status(403).send("ERROR (╯°□°)╯ the password you entered is incorrect!");
  }
  req.session.user_id = user.id;;
  res.redirect("/urls");
});
//Register
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashPass = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    return res.status(400).send("ERROR (╯°□°)╯ enter e-mail and password please!");
  } else if (getUserByEmail(email, users)) {
    return res.status(400).send("ERROR (╯°□°)╯ email already exists!");
  }
  users[id] = {
    id,
    email,
    password: hashPass
  };
  req.session.user_id = id;
  res.redirect("/urls");
});
//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//Delete URL
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    res.send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to delete a URL.</body></html>");
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});
//Update URL
app.post("/urls/:id/update", (req, res) => {
  if (!req.session.user_id) {
    res.send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
    return;
  }
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.update;
  res.redirect(`/urls/${id}`);
});
//Redirect to LongURL Link
app.get("/u/:id", (req, res) => {
  for (let url in urlDatabase) {
    if (req.params.id === url) {
      const longURL = urlDatabase[req.params.id].longURL;
      res.redirect(longURL);
      return;
    }
  };
  res.send('(╯°□°)╯ ID does not exist. Please try again');
});
//Create new URL, posts go to Homepage
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});
//View TinyApp ShortURL Page by ID
app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
  }
  let accessibleURLS = urlsForUser(req.session.user_id);
  if (!accessibleURLS[req.params.id]) {
    return res.status(401).send("ERROR (╯°□°)╯ you do not have permission to view this url.");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[`${req.params.id}`].longURL,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});
//Root redirects to homepage
app.get("/", (req, res) => {
  res.redirect("/urls");
});
//JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//Prints Hello World
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
//Starts page on PORT 8080
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});