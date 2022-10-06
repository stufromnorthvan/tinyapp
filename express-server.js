const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {};

const urlsForUser = (id) => {
  let userURLS = {};
  for (let url in urlDatabase) {
    if (id === urlDatabase[url].userID) {
      userURLS[url] = urlDatabase[url];
    }
  }
  return userURLS;
};

const getUserByEmail = (userEmail) => {
  for (let user in users) {
    if (userEmail === users[user].email) {
      return users[user];
    }
  }
  return null;
};

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

app.post("/urls", (req, res) => {
  if (!req.cookies["user_ID"]) {
    res.send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to create a URL.</body></html>");
    return;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_ID"] };
  res.redirect(`/urls/${shortURL}`);
  return;
});

app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies["user_ID"]) {
    res.send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to delete a URL.</body></html>");
    return;
  }
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  if (req.cookies["user_ID"]) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies["user_ID"]]
  };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (email === "" || password === "") {
    return res.status(400).send("ERROR (╯°□°)╯ enter e-mail and password please!");
  }
  if (!user) {
    return res.status(404).send("ERROR (╯°□°)╯ an account with that email does not exist!");
  }
  if (user && user.password !== password) {
    return res.status(403).send("ERROR (╯°□°)╯ the password you entered is incorrect!");
  }
  res.cookie("user_ID", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (req.cookies["user_ID"]) {
    return res.redirect('/urls');
  }
  const templateVars = {
    user: users[req.cookies["user_ID"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.status(400).send("ERROR (╯°□°)╯ enter e-mail and password please!");
  } else if (getUserByEmail(email)) {
    return res.status(400).send("ERROR (╯°□°)╯ email already exists!");
  }
  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_ID", id);
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  if (!req.cookies["user_ID"]) {
    res.send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
    return;
  }
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.update;
  res.redirect(`/urls/${id}`);
});

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

app.get("/urls", (req, res) => {
  if (!req.cookies["user_ID"]) {
    return res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
  }
  const templateVars = {
    urls: urlsForUser(req.cookies["user_ID"]),
    user: users[req.cookies["user_ID"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_ID"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  if (!req.cookies["user_ID"]) {
    return res.status(401).send("<html><body>ERROR (╯°□°)╯ please <a href=/login>log in</a> or <a href=/register>register</a> to view URLs.</body></html>");
  }
  let accessibleURLS = urlsForUser(req.cookies["user_ID"]);
  if (!accessibleURLS[req.params.id]) {
    return res.status(401).send("ERROR (╯°□°)╯ you do not have permission to view this url.");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[`${req.params.id}`].longURL,
    user: users[req.cookies["user_ID"]]
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