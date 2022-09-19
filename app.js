//jshint esversion:6
require('dotenv').config()
const express= require('express');
const bodyParser= require('body-parser');
const app= express();
const ejs= require('ejs');
const mongoose=require('mongoose');
const encrypt=require('mongoose-encryption')


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.listen(3000);
mongoose.connect('mongodb://localhost:27017/userDB',{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email:String, 
    password:String
})

var secret = "abcdefghijklmnopqrstuvwxyz"


userSchema.plugin(encrypt, { secret: secret,encryptedFields: ['password']});

const user=mongoose.model('User',userSchema);


app.get('/', (req, res) => {
    res.render('home',{});
})
app.get('/register',(req, res)=>{
    res.render('register',{});
})

app.get('/login',(req, res)=>{
    res.render('login',{});
})
app.post('/register',(req, res)=>{
    var data=new user({
        email:req.body.username,
        password:req.body.password
    })
    data.save((err)=>{
        if(err){
            console.log('error in storng data');
        }
        else{
            res.render('secrets',{});
        }
    });
})
app.post('/login',(req, res)=>{
    const username=req.body.username;
    const password=req.body.password;
    user.findOne({email:username},(err,users)=>{
        if(err){
            res.send('error');
        }
        else{
            if(users){
                if(users.password===password){
                    res.render('secrets');
                }
                else{
                    res.send('password incorrect')
                }
            }
            else{
                res.send('user not found');
            }
            

        }
    })
})