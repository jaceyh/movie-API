const express = require ('express'),
  fs = require('fs'), // import built in node modules fs and path 
  path = require('path'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  morgan = require('morgan');
  
const app = express();

app.use(bodyParser.json());

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

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
    username: "jaceyh",
    password: "test123"
  }
];


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


//POST requests
app.post('/user', (req, res) => {
  //res.send('You want to create an account.  Great!  Idk how to code that yet.')});
const newUser = req.body;
  if (!newUser.username === '') {
    const message = 'Missing "username" in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  }
});


//DELETE user account request
app.delete('/user/delete/:id', (req, res) => {
  users.find((user) => { return user.id === req.params.id });

  if (user) {
    users = users.filter((obj) => { return obj.id !== req.params.id });
    res.status(201).send('User ' + req.params.id + ' was deleted.');
  }
});


//PUT requests (add to favorites, add to watchlist, UPDATE user info)
app.put('/user/:id', (req, res) => {
  //res.send('You want to create an account.  Great!  Idk how to code that yet.')});
  const { id } = req.params
  const updatedUser = req.body;

  let user = user.find(user => user.id == id);

  if (user) {
    user.username = updatedUser.username;
    res.status(200).json(user);
  } else {
    res.status(400).send('User not found.')
  }
});

/*app.put('/user/:id/favorites/:title', (req, res) => {
  let newFavorite = movies.find((movie) => { return movie.title === req.params.title });
    users[id].push(newFavorite);
    res.status(201).send(newFavorite + 'was added to your favorites.');
  }
);
*/
app.put('/user/:id/watchlist/:title', (req, res) => {
  let newWatchlist = movies.find((movie) => { return movie.title === req.params.title });
    users.push(newWatchlist);
    res.status(201).send(newWatchlist + 'was added to your watchlist.');
  }
);

app.put('/user/update/:id', (req, res) => {
  res.send('Would you like to update your username or password?');
});


//DELETE Remove from favorites or watchlist
app.delete('/user/:id/favorites/delete/:title', (req, res) => {
  res.status(201).send(title + ' was deleted from your favorites.');
});

app.delete('/user/:id/watchlist/delete/:title', (req, res) => {
  res.status(201).send(title + ' was deleted from your favorites.');
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
