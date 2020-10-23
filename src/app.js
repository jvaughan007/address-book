require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const { v4: uuid } = require('uuid');

const app = express();

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';


const users = [
    {
        firstName: 'josh',
        lastName: 'vaughan',
        address1: '1234 somestreet',
        address2: 'apt xyz',
        city: 'somewhere',
        state: 'somestate',
        zip: 12345
    }
];

// Standard Middleware
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());

// this is the bearer token validation
function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN;
    console.log(apiToken);
    const authToken = req.get("Authorization");

    if (!authToken || authToken.split(" ")[1] !== apiToken) {
        return res
            .status(401)
            .json({ error: 'Unauthorized request' });
    }
    // move to the next middleware
    next();
}

// Routes
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/address', (req, res) => {
    res
        .json(users);
});

app.post('/address', validateBearerToken, (req, res) => {
    
    

    const { firstName, lastName, address1, address2, city, state, zip } = req.body;
    

    if ( !firstName || !lastName || !address1 || !city || !state || !zip ) {
        return res
            .status(400)
            .send('Please enter all required fields');
    }

    if (state.length !== 2) {
        return res
            .status(400)
            .send('State must be abbreviated to 2 characters');
    }

    if (zip.toString().length !== 5) {
        return res
            .status(400)
            .send(`Your zipcode is ${zip}, your zipcode length is ${zip.length}`); 
    }

    if (typeof zip !== 'number') {
        return res
            .status(400)
            .send('Zip must be a number');
    }
    
    const newAddress = {id: uuid(), ...req.body};

    users.push(newAddress);

    return res
        .send(newAddress);
});

app.delete('/address/:id', validateBearerToken, (req, res) => {
    const { id } = req.params;
    const index = users.findIndex(u => u.id === id);

    // make sure we actually find a user with that id
  if (index < 0) {
    return res
      .status(404)
      .send('User not found');
  }

  const deletedUser = users.splice(index, 1);
  

  res
    .status(200)
    .json({ message: 'Successfully deleted address',
            user: deletedUser
        });
});

// Error handlers
app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = { message: 'Internal error' };
    } else {
        response = { error, message: error.message };
    }

    res.status(500).json(response);
});



module.exports = app;