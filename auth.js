const express =  require('express');
const router = express.Router();
const mongoose =  require('mongoose');
const User = mongoose.model("User");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const requireLogin = require('../middleware/requireLogin');
const {JWT_SECRET} = require('../keys');


router.get('/',(req,res)=>{
    res.send('Heloo');
});


router.post('/signup',(req,res)=>{
  const {name,email,password} = req.body;
  if(!email || !password || !name){
     return res.status(422).json({error: "Please add all the fields"});
   }
   User.findOne({email: email})
   .then((savedUser)=>{
       if(savedUser){
        return res.status(422).json({error: "User already exist with the given email"});
       }   
       bcrypt.hash(password,10)
        .then(hashedpassword=>{
            const user = new User({
              email,
              password:hashedpassword,
              name,
            });

            user.save()
              .then((user) => {
                 res.json({ message: "Signed up Successfully" });
               })
              .catch((err) => {
                 console.log(error);
              });
        })
   })
   .catch(err=>{
       console.log(err);
   })
});

router.post('/login',(req,res)=>{
    const { email,password } = req.body;
    if(!email || !password){
        return res.status(422).json({error: "Please add email or password"});
    }
    User.findOne({email: email})
     .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error: "Invalid Email or password"});
         }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                // res.json({message: "Successfully signedin"})
                const token = jwt.sign({_id:savedUser._id},JWT_SECRET);
                const {_id,name,email} = savedUser;
                res.json({token,user:{_id,name,email}});
            }
            else{
              return res.status(422).json({error: "Invalid Email or password"});  
            }
        })
        .catch(err=>{
            console.log(err);
        })

     })
});



module.exports = router;