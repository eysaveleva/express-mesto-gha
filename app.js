const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const app = express();

const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '651fea446c4d5babe3956ab9',
  };

  next();
});

// подключаем мидлвары, роуты и всё остальное...
app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.listen(PORT);
