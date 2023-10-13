const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const {
  RIGHT_CODE,
  CREATED_CODE,
  SALT_COUNT,
  KEY,
} = require('../config/config');

const ConflictError = require('../errors/ConflictError');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(RIGHT_CODE).send({ data: users }))
    .catch(next);
};

module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.status(RIGHT_CODE).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Неверный _id'));
      }
      return next(err);
    });
};

/* module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.status(RIGHT_CODE).send(user);
    })
    .catch(next);
}; */

module.exports.getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail(() => {
      throw new NotFoundError('Пользователь с таким id не найден');
    })
    .then((user) => {
      res.status(RIGHT_CODE).send({ data: user });
    })
    .catch(next);
};

module.exports.addUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, SALT_COUNT)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(CREATED_CODE).send({
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные пользователя'));
      } if (err.code === 11000) {
        return next(new ConflictError('Такой пользователь уже существует'));
      }
      return next(err);
    });
};

const updateProfile = (req, res, next, newData) => {
  User.findByIdAndUpdate(
    req.user._id,
    newData,
    {
      new: true,
      runValidators: true,
      upsert: false,
    },
  ).orFail(() => {
    throw new NotFoundError('Пользователь с указанным _id не найден');
  })
    .then((user) => {
      res.status(RIGHT_CODE).send({ data: user });
    })
    .catch(next);
};

module.exports.updateProfileInfo = (req, res, next) => {
  const { name, about } = req.body;
  return updateProfile(req, res, next, { name, about });
};

module.exports.updateProfileAvatar = (req, res, next) => {
  const { avatar } = req.body;
  return updateProfile(req, res, next, { avatar });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, KEY, { expiresIn: '7d' });
      res.status(RIGHT_CODE).send({ token });
    })
    .catch(next);
};
