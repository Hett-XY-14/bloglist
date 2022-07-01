const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response, next) => {
  const newBlog = request.body
  try{
    if (newBlog.title && newBlog.url) {
      const newBlog = new Blog(request.body)
      newBlog.save()
      response.status(201).send(newBlog)
    } else {
      response.status(400).send({
        error: 'Bad Request. Either title or url is missing'
      })
    }
  } catch (exception) {
    next(exception)
  }
})

module.exports = blogsRouter