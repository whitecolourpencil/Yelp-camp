const express = require('express');
const router=express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const User=require('../models/user');
const passport = require('passport');

router.get('/register',(req,res)=>{

    res.render('users/register');

});

router.post('/register', async(req,res)=>{
    try{
        const {email,username,password}=req.body;
        const user=new User({email,username});
        const registerdUser= await User.register(user,password);
        req.login(registerdUser,err=>{
            if(err) 
            console.log(err);

            res.redirect('/');
        })        
    }
    catch(e)
    {
        req.flash('error',e.message);
        res.redirect('register');
    }

});

router.get('/login',(req,res)=>{
    res.render('users/login');   
});

router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
     //if we have reached this point, the person is aloready auth by passport

     const redirectURL=req.session.returnTo || '/campgrounds';
     delete req.session.returnTo;
     res.redirect(redirectURL)



})

router.get('/logout',(req,res)=>{
    req.logout();//pasport helped
    req.flash('success',"Logged out!")
    res.redirect('/campgrounds')
})


//the error msg is nice cause its from passport.oorg


module.exports=router;