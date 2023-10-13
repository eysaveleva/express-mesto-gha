const signinRouter = require('express').Router();
const { validateLogin } = require('../middlewares/validation');
const { login } = require('../controllers/users');

signinRouter.post('/signin', validateLogin, login);

module.exports = { signinRouter };
