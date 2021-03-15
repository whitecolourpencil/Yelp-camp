const mongoose = require('mongoose');
const Review = require('./review')

const Schema = mongoose.Schema;

const imageSchema= new Schema({
    url:String,
    filename:String
})

//https://res.cloudinary.com/dfokh7ald/image/upload/v1615838948/YelpCamp/uzypi8yr3dicyc5ogbat.jpg
//virtual from mongoose
imageSchema.virtual('thumbnail').get(function() {
   return this.url.replace('/upload','/upload/w_200')
})//we can change width of image in givein url by using w_200 . this is 200 pixles

const CampgroundSchema = new Schema({
    title: String,
    images:[imageSchema],
    price: Number,
    description: String,
    location: String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Review'
    }]
});

//it deletes form the collection Review any review that has the id review,,,which is   in   that perticular campground doc's reviews
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})



module.exports = mongoose.model('Campground', CampgroundSchema);