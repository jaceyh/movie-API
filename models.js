const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Mongoose schema for a movie document.
 * @typedef {Object} MovieSchema
 * @property {string} Name - The title of the movie (required).
 * @property {Array.<{Name: string, Description: string}>} Director - An array of director objects with name and description (optional).
 * @property {string} ImagePath - The path to the movie poster image (optional).
 * @property {string} Description - A brief description of the movie (required).
 * @property {Array.<{Name: string, Description: string}>} Tags - An array of tag objects with name and description (optional).
 * @property {boolean} Featured - Whether the movie is featured (optional).
 */
let movieSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Director: [{ Name: String, Description: String, required:false}],
    ImagePath: {type: String},
    Description: {type: String, required: true},
    Tags: [{ Name: String, Description: String}],
    Featured: {type: Boolean}
}, { collection: 'Movie'})

/**
 * Mongoose schema for a user document.
 * @typedef {Object} UserSchema
 * @property {string} Username - The unique username of the user (required).
 * @property {string} Password - The hashed password of the user (required).
 * @property {string} Email - The email address of the user (required).
 * @property {Date} Birthdate - The birthdate of the user (optional).
 * @property {Array.<mongoose.Schema.Types.ObjectId>} FavMovies - An array of movie IDs representing the user's favorite movies (references the Movie collection).
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthdate: {type: Date},
    FavMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  }, { collection: 'User' })

/**
 * Static method for hashing a password before saving a user document.
 * @param {string} password - The plaintext password to be hashed.
 * @returns {string} The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};
 
/**
 * Instance method for comparing a plaintext password with the user's hashed password.
 * @param {string} password - The plaintext password to compare.
 * @returns {boolean} True if the passwords match, false otherwise.
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

/**
 * Mongoose model for the Movie collection and Mongoose model for User collection.
 */
let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
