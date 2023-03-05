
const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const { SECRET } = require('../utils/config') 

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body
    const user = await User.findOne({ username })
    
    const passwordCorrect = !user ? false : await bcrypt.compare(password, user.passwordHash)

    if( !(user && passwordCorrect) ) {
        return response.status(401).send({error: 'username or password value is incorrect'})
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }

    // we sign the token to encode the user and the secret word, also it is set to expire in 3600 seconds
    token = jwt.sign(
        userForToken,
        SECRET,
    )
    
    response
        .status(200)
        .send({
            token,
            username: user.username, 
            id: user._id,
        })
})

module.exports = loginRouter

