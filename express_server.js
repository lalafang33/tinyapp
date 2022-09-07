const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const generateRandomString = () => {
  let output = Math.random().toString(36).substrint(2,8);
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies &&req.cookies["username"],//bandaid solution resole req.cookie error 
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    id: req.params.id, 
    longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  let id = generateRandomString
  urlDatabase[id] = req.body.longURL; // Log the POST request body to the console
  res.redirect(`/urls/${id}`); // Respond with 'Ok' (we will replace this)
});

app.post('/urls/:id/delete',(req, res) => {
  const id = req.params.id;
  // console.log(urlDatabase);
  delete urlDatabase[id];
  // console.log(urlDatabase);
  res.redirect("/urls");
});

app.post('/urls/:id/edit',(req,res)=>{
  const id = req.params.id;
  urlDatabase[id] = req.body.longURL;
  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  console.log(req.body);
  let username = req.body.username;
  console.log(username);
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post('/logout', (req, res) => {
 res.clearCookie("username");
 res.redirect("/urls");
});

// app.post()



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

