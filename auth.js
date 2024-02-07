/**
 * Secret key used for signing and verifying JWT tokens.
 * This key must be the same as the one used in your JWTStrategy within passport.js.
 * Keep this key secure and avoid hardcoding it in production environments.
 */
const jwtSecret = 'your_jwt_secret'; // must be the same key used in JWTStrategy in passport.js

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // local passport file

/**
 * Generates a JSON Web Token (JWT) for the provided user object.
 * @param {object} user - The user object containing information to be encoded in the JWT.
 * @returns {string} The generated JWT token.
 */
let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //will be encoded
        expiresIn: '30d', //days
        algorithm: 'HS256' //this is the algorithm used to "sign" or encode values in JWT
    });
}

/**
 * POST login route handler.
 * @param {object} router - The Express router object to attach the route to.
 */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user,  {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                /**
                * Generates a JWT token for the logged-in user.
                */
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token});
            });
        })(req, res);
    });
}