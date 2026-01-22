const services = require('./services');
const AppError = require('./utils/AppError');

exports.getPosts = async (req, res, next) => {
  try {
    const { q, limit = 10, offset = 0 } = req.query;
    const posts = await services.getPosts({ q, limit: Number(limit), offset: Number(offset) });
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await services.getPost(req.params.id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const post = await services.createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await services.updatePost(req.params.id, req.body);
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const deleted = await services.deletePost(req.params.id);
    if (!deleted) {
      throw new AppError('Post not found', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await services.getComments(req.params.postId);
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const comment = await services.createComment({
      ...req.body,
      postId: req.params.postId
    });
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const deleted = await services.deleteComment(req.params.id);
    if (!deleted) {
      throw new AppError('Comment not found', 404);
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};