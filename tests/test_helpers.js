const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const blogs = require('./blogsList')

const blogsInDB = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDB = async ()=>{
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    blogsInDB,
    usersInDB
}