const mongoose = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')
const blogs = require('./blogsList')

const blogsInDB = async () => {
    const blogs = await Blog.find({}).populate('user', { name:1, username:1 })
    return blogs.map(blog => blog.toJSON())
}

const usersInDB = async ()=>{
    const users = await User.find({}).populate('blogs', { title:1, author:1, url:1, })
    return users.map(user => user.toJSON())
}

module.exports = {
    blogsInDB,
    usersInDB
}