// SERVER

// Middleware

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();

app.use(cookieSession({
  name: 'user_id',
  keys: ['modnar', 'edocehtsseug']
}));

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// Port

const PORT = 8080;

// Helper Functions

const { getUserByEmail, generateRandomString, urlsForUser } = require('./helper.js');

// Databases

const { urlDatabase, users } = require('./databases.js');

// ** CRUD BELOW ** WARNING: any changes to the following code could SEVERELY affect functionality.

// Landing Page

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
  }
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

// Login Page

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_login", templateVars);
});

// Register Page

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

// Link to LongURL using ShortURL ID

app.get("/u/:id", (req, res) => {
  for (let url in urlDatabase) {
    if (req.params.id === url) {
      const longURL = urlDatabase[req.params.id].longURL;
      res.redirect(longURL);
      return;
    }
  };
  res.status(404).send('(╯°□°)╯ ID does not exist. Please try again');
});

// Create new URL Page

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

// See ShortURL Page by ID

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
  }
  let accessibleURLS = urlsForUser(req.session.user_id, urlDatabase);
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

// Root redirects to home or login depending on log in status

app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
    return;
  }
  res.redirect("/urls");
});

// JSON details

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Prints Hello World (Test)

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Post New URL

app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to create a URL.</body></html>");
    return;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
  return;
});

// Login Post Information

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (email === "" || password === "") {
    return res.status(400).send("ERROR (╯°□°)╯ enter e-mail and password please!");
  }
  if (!user) {
    return res.status(404).send("ERROR (╯°□°)╯ an account with that email does not exist!");
  }
  const comparePass = bcrypt.compareSync(password, user.password);
  if (user && !comparePass) {
    return res.status(403).send("ERROR (╯°□°)╯ the password you entered is incorrect!");
  }
  req.session.user_id = user.id;;
  res.redirect("/urls");
});

// Register Post Information

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

// Logout User

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});

// Deletes URL

app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to delete a URL.</body></html>");
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Updates with new LongURL and ShortURL

app.post("/urls/:id/update", (req, res) => {
  if (!req.session.user_id) {
    res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
    return;
  }
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.update;
  res.redirect(`/urls/${id}`);
});

// Listens to PORT (view PORT number at top of page)

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});