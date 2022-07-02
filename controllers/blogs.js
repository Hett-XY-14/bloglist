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