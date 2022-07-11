const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../utils/config')
const { findById } = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username:1, name:1})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const {title, author, url, likes, token} = request.body
  console.log(token)
  const decodedToken = jwt.verify(token, SECRET)

  if (!(decodedToken.id)) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

  if (title && url && user) {
    const newBlog = new Blog({
      title: title,
      author: author,
      url: url,
      likes: likes,
      user: user._id
    })
    const savedNote = await newBlog.save()
    user.blogs = user.blogs.concat(savedNote._id)
    await user.save()

    response.status(201).send(newBlog)
  } else {
    response.status(400).send({
      error: 'Bad Request. Either title or url is missing'
    })
  }
})

blogsRouter.delete(`/:id`, async (request, response) => {
  const blogId = request.params.id
  const { token } = request.body
  const decodedToken = jwt.verify(token, SECRET)
  const userId = decodedToken.id

  if (!userId) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(blogId)

  if (!blog) {
    return response.status(404).send({ error: 'blog not found in db' }).end()
  }
  
  if (!( blog.user.toString() === userId.toString() )) {
    return response.status(401).json({ error: 'you don\'t have the rights to delete this blog' })
  }

  const removedBlog = await Blog.findByIdAndDelete(blogId)
  const user = await User.findById(userId)
  user.blogs = user.blogs.filter((blog) => blog.id.toString() !== blogId.toString())
  await user.save()

  response.status(200).end()

  // Blog.findByIdAndDelete(id)
  //   .then((result) => {
  //     if(!result) {
  //       return response.status(404).end()
  //     } 
  //     response.status(200).end()
  //   })
  //   .catch((error) => {
  //     next(error)
  //   })
})

blogsRouter.put('/:id', async (request, response, next) => {
  const id = request.params.id
  const {title, author, url, likes} = request.body
  const modifiedBlog = {
    title: title,
    author: author,
    url: url,
    likes: likes
  }
  try {
    const updatedNote = await Blog.findByIdAndUpdate(id, modifiedBlog, {new:true, runValidators:true, context:'query'})
    response.json(updatedNote)
  } catch (exception) {
    next(exception)
  }

  // ----------------------------------------------
  // Blog.findByIdAndUpdate(id, modifiedBlog, {new:true, runValidators:true, context:'query'})
  // .then(updatedNote => {
  //   response.json(updatedNote)
  // })
  // .catch(error => next(error))
  // ----------------------------------------------
})

module.exports = blogsRouter