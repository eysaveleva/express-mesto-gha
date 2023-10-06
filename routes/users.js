const userRouter = require('express').Router();

const {
  getUsers,
  getUserById,
  addUser,
  updateProfileInfo,
  updateProfileAvatar,
} = require('../controllers/users');
// вернуть всех пользователей
userRouter.get('/', getUsers);
// вернуть пользователя по _id
userRouter.get('/:userId', getUserById);
// добавить пользователя
userRouter.post('/', addUser);
// обновить профиль
userRouter.patch('/me', updateProfileInfo);
// обновить аватар
userRouter.patch('/me/avatar', updateProfileAvatar);

module.exports = { userRouter };
