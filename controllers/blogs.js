const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { SECRET } = require('../utils/config')
const { findById } = require('../models/blog')
const blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username:1, name:1})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const {title, author, url, likes, user} = request.body
  console.log(user)

  if (!(user.id)) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const userDocument = await User.findById(user.id)

  if (title && url && userDocument) {
    const newBlog = new Blog({
      title: title,
      author: author,
      url: url,
      likes: likes,
      user: userDocument._id
    })
    const savedNote = await newBlog.save()
    userDocument.blogs = userDocument.blogs.concat(savedNote._id)
    await userDocument.save()

    response.status(201).send(newBlog)
  } else {
    response.status(400).send({
      error: 'Bad Request. Either title or url is missing'
    })
  }
})

blogsRouter.delete(`/:id`, async (request, response) => {
  const blogId = request.params.id
  const { user } = request.body

  if (!user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const blog = await Blog.findById(blogId)

  if (!blog) {
    return response.status(404).send({ error: 'invalid id; blog not found in db' }).end()
  }
  
  if (!( blog.user.toString() === user.id.toString() )) {
    return response.status(401).json({ error: 'user doesn\'t posses the athorization to perform this action' })
  }

  const removedBlog = await Blog.findByIdAndDelete(blogId)
  const userDocument = await User.findById(user.id)
  userDocument.blogs = userDocument.blogs.filter((blog) => blog.id.toString() !== blogId.toString())
  await userDocument.save()

  response.status(200).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const blogId = request.params.id
  const {title, author, url, likes, user} = request.body

  if (!user) {
    return response.status(401).json({error: 'token missing or invalid'})
  }

  const blog = await Blog.findById(blogId)

  if (!(blog.user.toString() === user.id.toString())) {
    return response.status(401).json({error: 'user doesn\'t posses the athorization to perform this action'})
  }

  const userDocument = await User.findById(user.id)

  const modifiedBlog = {
    title: title,
    author: author,
    url: url,
    likes: likes,
    user: userDocument._id
  }

    const updatedNote = await Blog.findByIdAndUpdate(blogId, modifiedBlog, {new:true, runValidators:true, context:'query'})
    response.json(updatedNote)
})

module.exports = blogsRouter