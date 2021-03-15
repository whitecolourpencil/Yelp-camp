if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}// while we are in the deveopment phase(not deployed)
//take the variables defined in .env and put in process.envs

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');//layout
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session')
const User=require("./models/user")

const flash=require("connect-flash");
const passport=require("passport"); 
const LocalStrategy=require('passport-local');

const userRoutes=require("./routes/users");
const campgroundsRoutes=require("./routes/campgrounds");
const reviewsRoutes=require("./routes/reviews");


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
});

const db = mongoose.connection;

const app = express();

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const sessionConfig={
    secret:"mylittlesecret",
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now()+ 1000*60*60*44*7,//1 week
        maxAge:1000*60*60*44*7
    }
}
app.use(session(sessionConfig));
app.use(flash());
//////////////////////////////////////////////////////////////////////////////////////////////

app.use(passport.initialize());
app.use(passport.session()); //needed by passport
passport.use(new LocalStrategy(User.authenticate() ));//passport should use the localStratage whose auth method(function) is located in the User modle and its called authenticate
//all this info is in passport documentation
passport.serializeUser(User.serializeUser());//store
passport.deserializeUser(User.deserializeUser());//remove


app.use((req,res,next)=>{
res.locals.success=req.flash('doneSucessfully');//key is doneSuccessfully
res.locals.error=req.flash('error');//key is error
res.locals.currentUser=req.user;//provided bt passport, it gives info abt logged in user like name email. undefined if not loggedin
next();
})//have access to success in all routes


app.get('/', (req, res) => {
    res.render('home')
});

app.use('/campgrounds',campgroundsRoutes);//campground route

app.use('/campgrounds/:id/reviews',reviewsRoutes);//reviews route

app.use('/',userRoutes);


//if none of the ^ get post have worked, then this is used
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


//when next is called it goes here-
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

 