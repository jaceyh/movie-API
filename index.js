const express = require ('express'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js'),
  dotenv = require('dotenv').config();

const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

app.use(bodyParser.json());


//allow mongoose to connect to jMDB
//CONNECTION_URI is defined in .env file (and as a config variable in Heroku)
mongoose.connect(process.env.CONNECTION_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((err) => console.error('MongoDb connection failed: ' + err));
  mongoose.connection.on('error', (err) => {
    console.error('MongoDb connection error: ' + err);
  });


//needs to be before authorization & any middleware (morgan)
const cors = require('cors');
app.use(cors());

//import auth.js
let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

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


//check URI
console.log("Connection URI:", process.env.CONNECTION_URI);

//GET Movies
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
    .then((movies) => {
        console.log('Movies fetched:', movies);
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
  res.status(500).send(err);
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
app.post('/users', 
//Validation logic for request goes here
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
],
(req, res) => {
  //check validation object for errors here
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

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
          Birthdate: req.body.Birthdate
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
// We’ll expect JSON in this format
app.put('/users/:Username', passport.authenticate('jwt', {session: false}), 
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], 
(req, res) => {
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthdate: req.body.Birthdate
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
const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});