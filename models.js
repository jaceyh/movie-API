const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let movieSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Director: [{ Name: String, Description: String, required:false}],
    ImagePath: {type: String},
    Description: {type: String, required: true},
    Tags: [{ Name: String, Description: String}],
    Featured: {type: Boolean}
}, { collection: 'movies'})

let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthdate: {type: Date},
    FavMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  })

  userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
  
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
  };

let Movie = mongoose.model('movies', movieSchema);
let User = mongoose.model('users', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
