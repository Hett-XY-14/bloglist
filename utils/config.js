require('dotenv').config()

const MONGODB_URI = process.env.NODE_ENV === 'test' ?
    process.env.TEST_MONGODB_URI :
    process.env.MONGODB_URI

const PORT = process.env.PORT
const SECRET = process.env.SECRET
const SALT = Number(process.env.SALT)

module.exports = {
    MONGODB_URI,
    PORT,
    SECRET,
    SALT
}