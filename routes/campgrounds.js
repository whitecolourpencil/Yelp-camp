const express = require('express');
const router=express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const {isLoggedIn,isAuthor,validateCampground}=require('../middleware')
//multer, upload images
const multer  = require('multer');
const {storage}=require('../cloudinary/index')// if you dont specify, then node direstly looks for index.js
const upload = multer({ storage })

const campgrounds=require('../controllers/campgrounds')

//all functionality in controler
//order matters
router.get('/', catchAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.newForm );

router.post('/', isLoggedIn,upload.array('image'), validateCampground,catchAsync(campgrounds.PostNewForm))


router.get('/:id', catchAsync(campgrounds.showCampground))

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campgrounds.editForm))

router.put('/:id', isLoggedIn, isAuthor,upload.array('image'),validateCampground, catchAsync(campgrounds.PostEditedForm));

router.delete('/:id',isLoggedIn, isAuthor, catchAsync(campgrounds.delete));//this also triggers a midlleware in campground.js that deletes the reviews



module.exports=router;