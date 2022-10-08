require('dotenv').config()
const express= require('express');
const bodyParser= require('body-parser');
const app= express();
const ejs= require('ejs');
const mongoose=require('mongoose');

const session=require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate')
app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(session({
    secret: 'ek gav me ek kisan ragu thatha',
    resave: false,
    saveUninitialized: false,
  }))

app.use(passport.initialize());
app.use(passport.session());


app.listen(3000);
mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    username:String, 
    password:String,
    googleId:String,
    secret:String
})

var secret='';
userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate);
const user=mongoose.model('User',userSchema);
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile)
    user.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


passport.use(user.createStrategy());
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username });
    });
  });
  
passport.deserializeUser(function(user, cb) {
process.nextTick(function() {
    return cb(null, user);
});
});


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }))

app.get('/auth/google/secrets', 
passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        // Successful authentication, redirect secrets.
        res.redirect('/');
});
app.get('/', (req, res) => {
    res.render('home',{});
})
app.get('/register',(req, res)=>{
    res.render('register',{});
})

app.get('/login',(req, res)=>{
    res.render('login',{});
})

app.get('/secrets',(req, res)=>{
    if(req.isAuthenticated() )
    {
      user.findById(req.user.id,(err,User)=>{
        if(err){
          console.log(err);
        }
        else{
          if(User){ 
            res.render('secrets',{secret:User.secret});
          }
        }
      })
        
    }
    else{
        res.redirect('/login')
    }
})

app.get('/submit',(req, res)=>{
  if(req.isAuthenticated() )
  {
      res.render('submit');
  }
  else{
      res.redirect('/login')
  }
})

app.post('/submit',(req, res)=>{
  console.log(req.user);
  user.findById(req.user.id,(err,User)=>{
    if(err){
      console.log(err);
    }
    else{
      if(User){ 
        User.secret=req.body.secret;
        User.save(()=>{
          res.redirect('/secrets');
        })
      }
    }
  })
})


app.post('/register',(req, res)=>{
    user.register({username:req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err)
            res.redirect('/register')
        }      
        else{
            passport.authenticate('local')(req,res,()=>{
                res.redirect('/secrets')
            })
        }
      });
    
})
app.post("/login", passport.authenticate("local",{
    successRedirect: "/secrets",
    failureRedirect: "/login"
}), function(req, res){
    
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });