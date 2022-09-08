const express = require("express");
const cookieParser = require('cookie-parser')
const {getUserByEmail} = require('./helper')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
};


const generateRandomString = () => {
  let output = Math.random().toString(36).substring(2,8);
  return output; 
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id
  const templateVars = { 
    username: users[userId],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id
  const templateVars = { 
    username: users[userId]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies.user_id
  const templateVars = { 
    username: users[userId],
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

app.get("/registration", (req, res) => {
  const userId = req.cookies.user_id
  const templateVars = { 
    username: users[userId]};
  res.render("registration")
});

app.get("/login", (req, res) => {

res.render("login")
});


// APP POST BELOW

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
  const email = req.body.email;
  let userObject = getUserByEmail(email, users);
  let username = req.body.username;
  const userId = req.cookies.user_id;

  if(email !== userObject){
    const templateVars = {
      errorMessage: "Email not registered in our Database! Please try again. "
    }
    res.status(403);
    res.render("error",templateVars)
  }
   if(email === userObject && (password !== userObject.password)){
    const templateVars = { errorMessage: "Incorrect password, please try again"}
    rest.status(403);
    res.render("error", templateVars);
  }else {
  users[userId] = newUser;
  console.log(users);
  res.cookie("user_id", userId )
  res.redirect('/urls');
  };
  
});

app.post('/logout', (req, res) => {
  const userId = req.cookies.user_id;
 res.clearCookie("user_id", userId);
 res.redirect("/urls");
});


app.post('/register', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const userId = generateRandomString();
  const newUser = {
    userId: userId,
    email: email,
    password: password,
  }; 

  if(email === "" || password === "" ) {
    const templateVars = {errorMessage: "Email or Password not valid"};
    res.status(400);
    res.render("error", templateVars)
  };

  if(getUserByEmail(email, users) !== null){
    const templateVars = { errorMessage: "Email is taken, please try using another one. "};
    res.status(400);
    res.render("error", templateVars)
  }

  users[userId] = newUser;
  console.log(users);
  res.cookie("user_id", userId )
  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

