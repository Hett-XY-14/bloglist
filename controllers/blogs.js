const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username:1, name:1})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const {title, author, url, likes} = request.body
  const randomUser = await User.findOne()

  if (title && url) {
    const newBlog = new Blog({
      title: title,
      author: author,
      url: url,
      likes: likes,
      user: randomUser._id
    })
    const savedNote = await newBlog.save()
    randomUser.blogs = randomUser.blogs.concat(savedNote._id)
    await randomUser.save()

    response.status(201).send(newBlog)
  } else {
    response.status(400).send({
      error: 'Bad Request. Either title or url is missing'
    })
  }
})

blogsRouter.delete(`/:id`, async (request, response, next) => {
  const id = request.params.id

  try {
    const result = await Blog.findByIdAndDelete(id)
    if (!result) {
      return response.status(404).send({error: 'blog not found in db'}).end()
    }
    response.status(200).end()
  } catch (exception) {
    next(exception)
  }

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