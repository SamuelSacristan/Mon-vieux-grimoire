const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [{
    userId: { type: String, required: true },
    grade: { type: Number, required: true }
    }],
  averageRating: { type: Number, required: true }
});

bookSchema.pre('save', function (next) {
  const ratings = this.ratings.map((rating) => rating.grade)
  if (ratings.length === 0) {
    this.averageRating = 0
  } else {
    const sumOfRatings = ratings.reduce((sum, value) => sum + value, 0)
    this.averageRating = Math.round(sumOfRatings / ratings.length)
  }
  next()
})

module.exports = mongoose.model('Book', bookSchema);