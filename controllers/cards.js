const Card = require('../models/card');

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
      } else {
        res.status(500).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  if (req.params.cardId.length === 24) {
    Card.findByIdAndRemove(req.params.cardId)
      .then((card) => {
        if (!card) {
          res.status(404).send({ message: 'Карточка не найдена' });
          return;
        }
        if (!card.owner.equals(req.user._id)) {
          res.status(403).send({ message: 'Невозможно удалить чужую карточку' });
          return;
        }
        res.send({ message: 'Карточка удалена' });
      })
      .catch(() => res.status(404).send({ message: 'Карточка не найдена' }));
  } else {
    res.status(400).send({ message: 'Некорректнй _id карточки' });
  }
};

const updateLikes = (req, res, newData) => {
  if (req.params.cardId.length === 24) {
    Card.findByIdAndUpdate(
      req.params.cardId,
      newData,
      { new: true },
    )
      .populate(['owner', 'likes'])
      .then((card) => {
        if (!card) {
          res.status(404).send({ message: 'Карточка с указанным _id не найдена' });
          return;
        }
        res.send({ data: card });
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          res.status(400).send({ message: err.message });
        } else {
          res.status(500).send({ message: 'На сервере произошла ошибка' });
        }
      });
  } else {
    res.status(400).send({ message: 'Некорректный _id карточки' });
  }
};

module.exports.likeCard = (req, res) => {
  const countLikes = { $addToSet: { likes: req.user._id } };
  return updateLikes(req, res, countLikes);
};

module.exports.dislikeCard = (req, res) => {
  const countLikes = { $pull: { likes: req.user._id } };
  return updateLikes(req, res, countLikes);
};
