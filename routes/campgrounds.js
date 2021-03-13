const express = require('express');
const router=express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware')



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new', isLoggedIn, (req, res) => {
   
        res.render('campgrounds/new');
})


router.post('/', validateCampground, isLoggedIn, catchAsync(async (req, res, next) => {

    const campground = new Campground(req.body.campground);
    campground.author=req.user._id;
   await campground.save();

    req.flash('doneSucessfully',"Successfully made a campground!")
    res.redirect(`campgrounds/${campground._id}`)

}))

router.get('/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:"reviews",
        populate:{path:'author' }   //to ptopulate the revoew and then populate the author of each review
            //of the campground
     } ).populate('author');
        //populate the author of capmground
    
   
    if(!campground){
       req.flash('error',"Cannot find that Campground");//if a camp existed and then was deleted
      return res.redirect('/campgrounds');
   }
   
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(async (req, res) => {
    const {id}=req.params;

    const campground = await Campground.findById(req.params.id)
   if(!campground){
       req.flash('error','cannot find campground');
       return res.redirect('/campgrounds')
   }
    res.render('campgrounds/edit', { campground });
}))

router.put('/:id', isLoggedIn, isAuthor,validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    //this is to prevent someone who isint the author from editing
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('doneSucessfully',"Successfully edited your campground!")
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id',isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('doneSucessfully',"Deleted Campground")

    res.redirect('/campgrounds');
    
}));//this also triggers a midlleware in campground.js that deletes the reviews



module.exports=router;