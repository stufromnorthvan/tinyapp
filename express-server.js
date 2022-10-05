const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

const cookieLookup = (userIDCookie) => {
  for (let user in users) {
    if (userIDCookie === user) {
      return users[user];
    }
  }
};

const emailLookup = (userEmail) => {
  for (let user in users) {
    if (userEmail === users[user].email) {
      return true;
    }
  }
  return false;
};


const generateRandomString = function() {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let randoString = '';
  let randoInt = function(max) {
    return Math.floor(Math.random() * max);
  };
  for (let r = 0; r < 5; r++) {
    randoString += chars[randoInt(63)];
  }
  return randoString;
};

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/login", (req, res) => {
  const username = req.body.username;
  // res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/urls/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/urls");
});

app.get("/urls/register", (req, res) => {
  const templateVars = {
    user: cookieLookup(req.cookies["user_ID"])
  };
  res.render("urls_register", templateVars);
});

app.post("/urls/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  console.log(email);
  console.log(emailLookup(email));
  if (email === "" || password === "") {
    return res.status(400).send("ERROR (╯°□°)╯ enter e-mail and password please!");
  } else if (emailLookup(email)) {
    return res.status(400).send("ERROR (╯°□°)╯ email already exists!");
  }
  users[id] = {
    id,
    email,
    password
  };
  console.log(users);
  res.cookie("user_ID", id);
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.update;
  res.redirect(`/urls/${id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: cookieLookup(req.cookies["user_ID"])
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: cookieLookup(req.cookies["user_ID"])
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[`${req.params.id}`],
    user: cookieLookup(req.cookies["user_ID"])
  };
  res.render("urls_show", templateVars);
});


app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});