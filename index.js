const express = require ('express'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Tags = Models.Tag;
const Directors = Models.Director

const app = express();

app.use(bodyParser.json());

//allow mongoose to connect to [cfDB]
mongoose.connect('mongodb://localhost:27017/[cfDB]', { useNewUrlParser: true, useUnifiedTopology: true });

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

/*
let movies = [
    {
      title: 'Free Solo',
      director: 'Jimmy Chin Elizabeth Chai Vasarhelyi',
      tags: 'action',
    },
    {
      title: '13th',
      director: 'Ava DuVernay',
      tags: 'socio-cultural, history'
    },
    {
      title: 'My Octopus Teacher',
      director: 'Pippa Ehrlich James Reed',
      tags: 'animals',
    },
    {
      title: 'Blackfish',
      director: 'Gabriele Cowperthwaite',
      tags: 'socio-cultural, animals',
    },
    {
      title: 'The Last Breath',
      director: 'Richard da Costa Alex Parkinson',
      tags: 'action',
    },
    {
      title: 'The Volcano: Rescue from Whakaari',
      director: 'Rory Kennedy',
      tags: 'action, natural disaster',
    },
    {
      title: 'The Alpinist',
      director: 'Peter Mortimer Nick Rosen ',
      tags: 'action',
    },    
    {
      title: 'Aftershock',
      director: 'Paula Eiselt Tonya Lewis Lee ',
      tags: 'action, natural disaster',
    },
    {
      title: 'Challenger: The Final Flight',
      director: 'Daniel Junge Steven Leckart',
      tags: 'action, historical',
    },
    {
      title: 'Citizenfour',
      director: 'Laura Poitras',
      tags: 'socio-cultural',
    },
  ];

let users = [
  {
    id: "1",
    username: "jaceyh",
    favoriteMovies: [],
    watchlistMovies: [],
  },
  {
    id: "2",
    username: "leetj",
    favoriteMovies: [],
    watchlistMovies: [],
  }
];
*/

// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to jMDB');
  });

app.get('/movies', (req, res) => {
    res.status(200).json(movies);
  });

app.get('/movies/:title', (req, res) => {
  res.json(movies.find((movie) =>
    { return movie.title === req.params.title }));
  });

app.get('/movies/director/:director', (req, res) => {
  res.json(movies.find((movie) =>  
    { return movie.director === req.params.director }));
  });

app.get('/movies/tags/:tags', (req, res) => {
    res.json(movies.find((movie) =>
      { return movie.tags === req.params.tags }));
  });
  
app.use('/documentation.html', express.static('public/documentation.html'));

// Get all users
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
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
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
        .create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
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
app.delete('/user/delete/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter( user => user.id != id );
    res.status(201).send('User was deleted.');
  } else {
    res.status(400).send('User not found.')
  }
});


//PUT requests (add to favorites, add to watchlist, UPDATE user info)

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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
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

/*
app.put('/user/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.username = updatedUser.username;
    res.status(200).json(user);
  } else {
    res.status(400).send('User not found.')
  }
});

app.put('/user/:id/favorites/:title', (req, res) => {
  const { id, movieTitle } = req.params;
  
  let user = users.find(user => user.id == id);

    user.favoriteMovies.push(movieTitle);
    res.status(200).send('Movie was added to your favorites.');
  }
);

app.put('/user/:id/watchlist/:title', (req, res) => {
  const { id, movieTitle } = req.params;
  
  let user = users.find(user => user.id == id);

    user.watchlistMovies.push(movieTitle);
    res.status(200).send('Movie was added to your watchlist.');
  }
);
*/

//DELETE Remove from favorites or watchlist
app.delete('/user/:id/favorites/delete/:title', (req, res) => {
  const { id, movieTitle } = req.params;
  
  let user = users.find(user => user.id == id);

  user.favoriteMovies.filter(title => title !== movieTitle);
  res.status(200).send('The movie was deleted from your favorites.');
});

app.delete('/user/:id/watchlist/delete/:title', (req, res) => {
  const { id, movieTitle } = req.params;
  
  let user = users.find(user => user.id == id);

  user.watchlistMovies.filter(title => title !== movieTitle);
  res.status(200).send('The movie was deleted from your favorites.');
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
