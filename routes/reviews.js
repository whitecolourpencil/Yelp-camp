const express = require('express');
const router=express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review=require("../models/review");
const {validateReview,isLoggedIn,isReviewAuthor}=require("../middleware")

//middleware , we call this as an attributr in post

router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); //pull takes out from our array of reviews, the element w the revireID
    await Review.findByIdAndDelete(reviewId);
    req.flash('doneSucessfully',"Deleted review.");
    res.redirect('/campgrounds/'+id);
}))


router.post('/', validateReview,isLoggedIn, catchAsync(async(req,res)=>{
    const campground= await Campground.findById(req.params.id);// to access the params in app.js we did {mergeParams:true}
    const review=new Review(req.body.review);
    review.author=req.user._id;
    campground.reviews.push(review);
    review.save();
    campground.save();
    req.flash('doneSucessfully',"Created new review!");
    res.redirect("/campgrounds/"+campground._id);
}))

module.exports=router;