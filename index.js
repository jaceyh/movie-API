const express = require ('express');
    morgan = require('morgan');
    fs = require('fs'), // import built in node modules fs and path 
    path = require('path');
  
const app = express();

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})


let topMovies = [
    {
        title: 'Free Solo',
        director: 'Jimmy Chin Elizabeth Chai Vasarhelyi'
    },
    {
        title: '13th',
        director: 'Ava DuVernay'
    },
    {
        title: 'My Octopus Teacher',
        director: 'Pippa Ehrlich James Reed'
    },
    {
        title: 'Blackfish',
        director: 'Gabriele Cowperthwaite'
      },
    {
        title: 'The Last Breath',
        director: 'Richard da Costa Alex Parkinson'
    },
    {
        title: 'The Volcano: Rescue from Whakaari',
        director: 'Rory Kennedy'
    },
    {
        title: 'The Alpinist',
        director: 'Peter Mortimer Nick Rosen '
    },    
    {
        title: 'Aftershock',
        director: 'Paula Eiselt Tonya Lewis Lee '
    },
    {
        title: 'Challenger: The Final Flight',
        director: 'Daniel Junge Steven Leckart'
    },
    {
        title: 'Citizenfour',
        director: 'Laura Poitras'
    },
  ];

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));



// GET requests
app.get('/', (req, res) => {
    res.send('Welcome to jMDB');
  });

app.get('/movies', (req, res) => {
    res.json(topMovies);
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
