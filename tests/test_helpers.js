const mongoose = require('mongoose')
const Blog = require('../models/blog')

const blogsInDB = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    blogsInDB
}