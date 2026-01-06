const { v4: uuidv4 } = require('uuid');
const AppError = require('./utils/AppError');

let posts = [
  {
    id: '1',
    title: 'Первый пост',
    content: 'Это мой первый пост в микроблоге!',
    author: 'Иван Иванов',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

let comments = [
  {
    id: '1',
    postId: '1',
    author: 'Петр Петров',
    content: 'Отличный пост!',
    createdAt: '2024-01-15T11:00:00Z'
  }
];

exports.getPosts = async ({ q, limit, offset }) => {
  let filtered = [...posts];
  
  if (q) {
    const search = q.toLowerCase();
    filtered = filtered.filter(p => 
      p.title.toLowerCase().includes(search) || 
      p.content.toLowerCase().includes(search) ||
      p.author.toLowerCase().includes(search)
    );
  }
  
  const paginated = filtered.slice(Number(offset), Number(offset) + Number(limit));
  return {
    data: paginated,
    total: filtered.length,
    limit: Number(limit),
    offset: Number(offset)
  };
};

exports.getPost = async (id) => {
  return posts.find(p => p.id === id);
};

exports.createPost = async (data) => {
  const newPost = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  posts.push(newPost);
  return newPost;
};

exports.updatePost = async (id, data) => {
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  posts[index] = {
    ...posts[index],
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  return posts[index];
};

exports.deletePost = async (id) => {
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  posts.splice(index, 1);
  comments = comments.filter(c => c.postId !== id);
  return true;
};

exports.getComments = async (postId) => {
  return comments.filter(c => c.postId === postId);
};

exports.createComment = async (data) => {
  const post = posts.find(p => p.id === data.postId);
  if (!post) throw new AppError('Post not found', 404);
  
  const newComment = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString()
  };
  comments.push(newComment);
  return newComment;
};

exports.deleteComment = async (id) => {
  const index = comments.findIndex(c => c.id === id);
  if (index === -1) return false;
  
  comments.splice(index, 1);
  return true;
};