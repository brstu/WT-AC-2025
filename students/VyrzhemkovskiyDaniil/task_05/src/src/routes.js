const express = require('express');
const router = express.Router();
const controllers = require('./controllers');
const { validatePost, validatePostUpdate, validateComment } = require('./middlewares');

router.get('/posts', controllers.getPosts);
router.get('/posts/:id', controllers.getPost);
router.post('/posts', validatePost, controllers.createPost);
router.put('/posts/:id', validatePostUpdate, controllers.updatePost);
router.delete('/posts/:id', controllers.deletePost);

router.get('/posts/:postId/comments', controllers.getComments);
router.post('/posts/:postId/comments', validateComment, controllers.createComment);
router.delete('/comments/:id', controllers.deleteComment);

module.exports = router;