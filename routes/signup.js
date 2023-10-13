const signupRouter = require('express').Router();
const { validateAddUser } = require('../middlewares/validation');
const { addUser } = require('../controllers/users');

signupRouter.post('/signup', validateAddUser, addUser);

module.exports = { signupRouter };
