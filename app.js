require('dotenv').config()
const express= require('express');
const bodyParser= require('body-parser');
const app= express();
const ejs= require('ejs');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt')
const saltRounds = 10;

const session=require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose')
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
    password:String
})

userSchema.plugin(passportLocalMongoose)


const user=mongoose.model('User',userSchema);
passport.use(user.createStrategy());
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());



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
        res.render('secrets');
    }
    else{
        res.redirect('/login')
    }
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
    successRedirect: "/secret",
    failureRedirect: "/login"
}), function(req, res){
    
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });