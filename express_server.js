const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {getUserByEmail} = require('./helper')
const app = express();
const PORT = 8080; // default port 8080
// helper
const urlsForUser = (userId, data) => {
let result = {};
for (let shortURL in data){
  if(data[shortURL].userId === userId) {
    result[shortURL] = data[shortURL].longURL;
  }
}
return result; 
}; 


app.set("view engine", "ejs"); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["Keys[0]"],
}))

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
  const templateVars = { 
    urls: urlsForUser(req.session.userId, urlDatabase),
    user: users[req.session.userId]

   };
   if(!req.session.userId){
    const templateVars = {errorMessage: "Please login before you can see your URLs."
    }
    return res.render("error", templateVars);
  };


  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if(!req.session.userId){
    return res.redirect("/login");
  }
  const templateVars = { 
    user: users[req.session.userId]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const sessionUserId = req.session.userId;
  const ownURL = urlsForUser(sessionUserId , urlDatabase);
  console.log("ownURL:", ownURL);
  console.log("URLDatabase:", urlDatabase);
if (!urlDatabase[req.params.id]){
     const templateVars = {user: users[req.session.userId], errorMessage: "URL you have entered does not exist."};
      return res.render("error", templateVars);
    }

  if(sessionUserId  && !urlDatabase[req.params.id][sessionUserId] && !ownURL[req.params.id]){
    const templateVars = {user: users[req.session.userId], errorMessage: "You are not authorized to view this URL page."};
      return res.render("error", templateVars);
  }
   
      const templateVars = {
        id: req.params.id,
        longURL: ownURL[req.params.id],
        user:users[req.session.userId]
      };

    
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const shortURLObject = urlDatabase[req.params.id];
  if(!shortURLObject){
    const templateVars = {user: users[req.session.userId], errorMessage: "This tiny URL does not exist."};
      return res.render("error", templateVars);
  }
  res.redirect(shortURLObject.longURL);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/registration", (req, res) => {
  const userId = req.session.userId
  if(userId){
    return res.redirect('/urls');
  };
  res.render("registration")
});

app.get("/login", (req, res) => {
  if(req.session.userId){
    return res.redirect('/urls');
  };
res.render("login");
// res.redirect("/urls");
});


// APP POST BELOW

app.post("/urls", (req, res) => {
  let id = generateRandomString()
  urlDatabase[id] = {longURL: req.body.longURL, userId: req.session.userId,}; // Log the POST request body to the console
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
  const sessionUserId = req.session.userId;
  const ownURL = urlsForUser(sessionUserId , urlDatabase);
  const id = req.params.id;
  if(!sessionUserId){
    res.send("Not logged in! Cannot shorten URL.");
  }  
  if(!urlDatabase[id][sessionUserId] && !ownURL[id]){
    const templateVars = {user: users[req.session.userId], errorMessage: "You are not authorized to edit this Tiny URL."};
      return res.render("error", templateVars);
  }
  urlDatabase[id].longURL = req.body.longURL;

  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const {email,password} = req.body

  if(email === "" || password === "" ) {
    const templateVars = {errorMessage: "Email or Password not valid"};
    res.status(400);
   return res.render("error", templateVars)
  };

  const userObject = getUserByEmail(email, users);

  if(!userObject){
    const templateVars = {
      errorMessage: "Email not registered in our Database! Please try again. "
    }
    res.status(403);
    return res.render("error",templateVars)
  }
   if(!bcrypt.compareSync(password,userObject.password)){
    const templateVars = { errorMessage: "Incorrect password, please try again"}
    res.status(403);
    return res.render("error", templateVars);
  }
  console.log("userObject:", userObject);
  req.session.userId = userObject.id;
  res.redirect('/urls');
  
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


app.post('/register', (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const userId = generateRandomString();

  if(email === "" || password === "" ) {
    const templateVars = {errorMessage: "Email or Password not valid"};
    res.status(400);
   return res.render("error", templateVars)
  };

  if(getUserByEmail(email, users)){
    const templateVars = { errorMessage: "Email is taken, please try using another one. "};
    res.status(400);
    return res.render("error", templateVars)
  }
  const hashPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: userId,
    email: email,
    password: hashPassword,
  }; 
  users[userId] = newUser;
  console.log(users);
  req.session.userId = userId;
  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

