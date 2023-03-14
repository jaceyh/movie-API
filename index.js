const express = require ('express'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const  passport = require('passport');
require('./passport');


const Movies = Models.Movie;
const Users = Models.User;
const Tags = Models.Tag;
const Directors = Models.Director;

const app = express();

app.use(bodyParser.json());

//allow mongoose to connect to [cfDB]
mongoose.connect('mongodb://localhost:27017/[cfDB]', { useNewUrlParser: true, useUnifiedTopology: true });

//needs to be before authorization & any middleware (morgan)
const cors = require('cors');
app.use(cors());

//import auth.js
let auth = require('./auth')(app);

// create a write stream (in append mode) (‘log.txt’ file is created in root directory)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use('/documentation.html', express.static('public/documentation.html'));



// GET requests

//landing
app.get('/', (req, res) => {
  res.send('Welcome to jMDB');
  });

//GET Movies
app.get('/movies', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(200).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});  

app.get('/movies/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Name: req.params.Name })
  .then(movie => {
  res.json(movie);
 })
 .catch(err => {
  console.error(err);
  res.status(500).send('Something broke!' + err);
 });
});

//GET directors & tags  
app.get('/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Directors.findOne({ Name : req.params.Name})
  .then(director => {
    res.json(director);
  })
  .catch(err => {
    console.error(err);
    res.status(500).send('Something broke!' + err);
  });
});

app.get('/tags/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
  Tags.findOne({ Name : req.params.Name})
  .then(tag => {
    res.json(tag);
  })
  .catch(err => {
    console.error(err);
    res.status(500).send('Something broke!' + err);
  });
});

// Get all users
app.get('/users', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


//POST requests

//Add a user
//We’ll expect JSON in this format
app.post('/users', (req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username }) //search to see if username already exists
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
        .create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthdate: req.body.Birthday
        })
        .then((user) =>{res.status(201).json(user)})
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error:' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});


//DELETE user account request
app.delete('/user/delete/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
  .then((user) => {
    if (!user) {
      res.status(400).send(req.params.Username + ' was not found');
    } else {
      res.status(200).send(req.params.Username + ' was deleted.');
    }
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//PUT requests (add to favorites and UPDATE user info)

// Update a user's info, by username
/* We’ll expect JSON in this format
{
  Username: String,
  (required)
  Password: String,
  (required)
  Email: String,
  (required)
  Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthdate: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


// Add a movie to a user's list of favorites
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  const MovieID = Movies.ObjectID;
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});


//DELETE Remove from favorites
app.delete('/users/:Username/movies/delete/:MovieID', passport.authenticate('jwt', {session: false}), (req, res) => {
  const MovieID = Movies.ObjectID;
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Delete a user by username
app.delete('/users/:Username', passport.authenticate('jwt', {session: false}), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});



//error handling with express
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  
// listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });