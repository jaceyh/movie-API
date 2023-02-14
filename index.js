const express = require ('express');
    morgan = require('morgan');
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path');
  
const app = express();

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


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

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));



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

app.get('/movies/:director', (req, res) => {
  res.json(movies.find((movie) =>
    { return movie.director === req.params.director }));
  });

app.get('/movies/:tags', (req, res) => {
    res.json(movies.find((movie) =>
      { return movie.tags === req.params.tags }));
  });
  
app.use('/documentation.html', express.static('public/documentation.html'));
  

//error handling with express
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });


  
// listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
