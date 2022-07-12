const logger = require('./logger')
const jwt = require('jsonwebtoken')
const { SECRET } = require('./config')

const requestLogger = (request, response, next) => {
    logger.info('Method: ', request.method)
    logger.info('Path: ', request.path)
    logger.info('Body: ', request.body)
    logger.info('--  -- ------- --  --')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(400).send({
        error: 'unknown endpoint'
    })
} 

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    
    if (error.name === "CastError") {
        return response.status(400).send({ 
            error: 'malformated id' 
        })
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ 
            error: error.message 
        })
    } else if (error.name === "JsonWebTokenError") {
        return response.status(401).json({ 
            error: 'invalid token'
        })
    }
    next(error)
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if ( authorization && authorization.toLowerCase().startsWith('bearer ') ) {
        request.body.token = authorization.substring(7)
    } else {
        request.body.token = null
    }
    next()
}

const userExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if ( authorization && authorization.toLowerCase().startsWith('bearer ') ) {
        const token = authorization.substring(7)
        request.body.user = jwt.verify( token, SECRET )
    } else {
        request.body.user = null
    }
    next()
}

module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
}