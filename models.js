const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let movieSchema = mongoose.Schema({
    Name: {type: String, required: true},
    Director: [{type: mongoose.Schema.Types.ObjectId, ref: 'Director'},
    {type: mongoose.Schema.Types.ObjectId, ref: 'Director', required:false}],
    ImagePath: {type: String},
    Description: {type: String, required: true},
    Tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'},
    {type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    Featured: {type: Boolean}
});

let tagSchema = mongoose.Schema({
    Name: {type: String},
    Description: {type: String}
})

let dirSchema = mongoose.Schema({
    Name: {type: String},
    Bio: {type: String},
    Born: Date
})


let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthdate: Date,
    FavMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });

  userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
  };
  
  userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
  };

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Tag = mongoose.model('Tag', tagSchema);
let Director = mongoose.model('Director', dirSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Tag = Tag;
module.exports.Director = Director;