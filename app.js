const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const { errors } = require('celebrate');

const { ERROR_DEFAULT_CODE } = require('./config/config');
const NotFoundError = require('./errors/NotFoundError');

const { addUser, login } = require('./controllers/users');
const { validateLogin, validateAddUser } = require('./middlewares/validation');

const auth = require('./middlewares/auth');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const app = express();
app.use(express.json());
app.use(helmet());

const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');

// подключаемся к серверу mongo
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use(express.json());

app.post('/signin', validateLogin, login);
app.post('/signup', validateAddUser, addUser);

app.use(auth);

app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = ERROR_DEFAULT_CODE, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === ERROR_DEFAULT_CODE
        ? 'На сервере произошла ошибка'
        : message,
    });

  next();
});

app.listen(PORT);
