const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const SECRET = require('../utils/config')

usersRouter.post('/', async (request, response, next) => {
    const {username, name, password} = request.body

    try {
        if(username && password) {
            if(!(username.length >= 3)) {
                return response.status(400).json({error: 'username must be at least 3 characters long'})
            } else if (!(password.length >= 3)) {
                return response.status(400).json({error: 'password must be at least 8 characters long'})
            }
        } else if (!username) {
            return response.status(400).json({error: 'username must be provided'})
        } else if (!password) {
            return response.status(400).json({error: 'password must be provided'})
        }

        const existingUser = await User.findOne({ username })
        console.log(existingUser)
        if(existingUser) {
            return response.status(400).json({error: 'username already taken'})
        }

        const salt = 10
        console.log(password, salt)
        const passwordHash = await bcrypt.hash(password, salt)

        const user = new User({
            username: username,
            name: name,
            passwordHash: passwordHash,
        })

        const savedUser = await user.save()
        response.status(201).send(savedUser)

    } catch (exception) {
        next(exception)
    }
})

usersRouter.get('/', async (request, response, next) => {
    try {
        const users = await User.find({}).populate('blogs', { title:1, author:1, url:1, })
        const formattedUsers = users.map((user) => {
            return user.toJSON()
        })
        response.status(200).json(formattedUsers)
    } catch (exception) {
        next(exception)
    }
})

module.exports = usersRouter