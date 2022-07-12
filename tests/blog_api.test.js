const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const blogs = require('./blogsList')
const helpers = require('./test_helpers')
const bcrypt = require('bcrypt')
const config = require('../utils/config')

var loggedInToken = ''

beforeEach( async () => {

    await User.deleteMany({})

    const password = 'firstUserPassword'
    const passwordHash = await bcrypt.hash(password, config.SALT)
    const initialUser = new User({
        username: 'firstUser',
        name: 'aRandomGuy',
        passwordHash: passwordHash
    })
    await initialUser.save()
    
    const user = await User.findOne({ username: initialUser.username })

    await Blog.deleteMany({})

    const blogArray = blogs.map( blog => {
        blog.user = user._id    
        return blog
    })

    const blogObjectsArray = blogArray.map( blog => new Blog( blog ))
    const blogPromisesArray = blogObjectsArray.map( blog => blog.save())
    await Promise.all(blogPromisesArray)

    const result = await api
        .post('/api/login')
        .send({
            username: initialUser.username,
            password: password
        })
    loggedInToken = `bearer ${result.body.token}`
})

describe('Api tests: ', () => {
    describe('Blog model tests -----------', () => {
    
        test('get all the blogs in the bloglist', async () => {
            const blogDBResponse = await api
                .get('/api/blogs')
                .expect(200)
                .expect('Content-Type', /application\/json/)

            const blogsInDB = await helpers.blogsInDB()
            const processedBlogsInDB = JSON.parse(JSON.stringify(blogsInDB))
            expect(blogDBResponse.body).toHaveLength(blogsInDB.length)
            expect(blogDBResponse.body).toEqual(processedBlogsInDB)
        })

        test('the unique identifies is defined as id and not the defauld _id', async () => {
            const blogsInDB = await helpers.blogsInDB()
            blogsInDB.forEach(blog => {
                expect(blog.id).toBeDefined()
            })
        })

        

        test('blog property "likes" default to 0 if not specified', async () => {
            const newBlog = {
                title: 'test blog with no likes property',
                author: 'test author',
                url: 'http://foo.com'
            }

            await api.post('/api/blogs')
                .set('Authorization', loggedInToken)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsInDB = await helpers.blogsInDB()
            const filteredBlogsByTitle = blogsInDB.filter(blog => {
                return blog.title === newBlog.title
            })

            filteredBlogsByTitle.forEach(blog => {
                expect(blog.likes).toBe(0)
            })
        })

        describe('creating a new blog', () => {
            test('a new post can be created', async () => {
                const randomUser = await User.findOne()
                const newBlog = {
                    title: "Test blog",
                    author: "The tester xD",
                    url: 'https://falsetesturl.com',
                    likes: 100
                }
                await api.post('/api/blogs')
                    .set('Authorization', loggedInToken)
                    .send(newBlog)
                    .expect(201)
                    .expect('Content-Type', /application\/json/)
                    console.log("------------------|| posted")
    
                const blogsInDB = await helpers.blogsInDB()
                const blogsInDBIdAndUserRemoved = blogsInDB.map(blog => {
                    return ({
                        title: blog.title,
                        author: blog.author,
                        url: blog.url,
                        likes: blog.likes,
                    })
                })
    
                expect(blogsInDB).toHaveLength(blogs.length + 1)
                const formattedBlogsInDB = JSON.parse(JSON.stringify(blogsInDBIdAndUserRemoved))
                expect(formattedBlogsInDB).toContainEqual(newBlog)
            })

            test('title and url are strictly necessary to create a new blog', async () => {
                const newBlog = {
                    title : undefined,
                    author: 'Arthur Shopenhauer',
                    url: undefined,
                }
    
                api.post('/api/blogs')
                    .set('Authorization', loggedInToken)
                    .send(newBlog)
                    .expect(400)
            })
        })

        describe('deleting a blog', () => {
            test('succeeds with status code 200 if the given id is valid', async () => {
                const blogsInDB = await helpers.blogsInDB()
                const id = blogsInDB[0].id
                await api.delete(`/api/blogs/${id}`)
                    .set('Authorization', loggedInToken)
                    .expect(200)

                const blogsInDBPostDeletion = await helpers.blogsInDB()
                expect(blogsInDBPostDeletion).toHaveLength(blogs.length - 1)
            })

            test('fails with a 404 status code if the id is invalid', async () => {
                const validId = "62cc6e0433fd4e80287b8d08"
                const invalidId = "62cc6e0433fd4e80287b8d00"
                const blogsInDBAtStart = await helpers.blogsInDB()

                await api.delete(`/api/blogs/${invalidId}`)
                    .set('Authorization', loggedInToken)
                    .expect(404)
                    .expect('Content-Type', /application\/json/)

                const blogsinDBAtEnd = await helpers.blogsInDB()
                expect(blogsinDBAtEnd).toHaveLength(blogsInDBAtStart.length)
            })

            test('fails with a proper status code if the token is invalid', async () => {
                const validId = "62cc6e0433fd4e80287b8d08"
                const invalidToken = "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IkFkcmVpIiwiaWQiOiI2MmNhNTFhYzdkZjgwZGYwOTljOGI3MTAiLCJpYXQiOjE2NTc1NDg5ODR9.9mDaxw8JS1Wx-QVSGfw59EkfupR4zUjariaYgQuwviu"
                const blogsInDBAtStart = await helpers.blogsInDB()

                await api.delete(`/api/blogs/${validId}`)
                    .set('Authorization', invalidToken)
                    .expect(401)
                    .expect('Content-Type', /application\/json/)

                const blogsinDBAtEnd = await helpers.blogsInDB()
                expect(blogsinDBAtEnd).toHaveLength(blogsInDBAtStart.length)
            })
        })

        describe('updating a blog', () => {

            test('succeed with a valid id and token', async () => {
                const blogsInDB = await helpers.blogsInDB()
                const testBlog = blogsInDB[0]
                const modifiedBlog = {
                    title: testBlog.title,
                    author: 'modified author',
                    url: testBlog.url,
                    likes: testBlog.likes +1
                }

                const updatedBlog = await api.put(`/api/blogs/${testBlog.id}`)
                    .send(modifiedBlog)
                    .set('Authorization', loggedInToken)
                    .expect(200)
                    .expect('Content-Type', /application\/json/)
                
                const blogsInDBAfterUpdating = await helpers.blogsInDB()
                expect(blogsInDBAfterUpdating).toHaveLength(blogs.length)  
                expect(updatedBlog.body.author).toBe(modifiedBlog.author)
                expect(updatedBlog.body.likes).toBe(modifiedBlog.likes)
            })
        })
    })

    describe('User model tests ----------- ', () => {
        describe('create a new user', () => {
            
            test('succeeds with valid data', async () => {
                const usersInDBAtStart = await helpers.usersInDB()
                const newUser = {
                    username: 'mommo',
                    name: 'momo ommo',
                    password: 'genericPassword2'
                }
                
                await api.post('/api/users')
                    .send(newUser)
                    .expect(201)
                    .expect('Content-Type', /application\/json/)
                
                const usersInDBAtEnd = await helpers.usersInDB()
                expect(usersInDBAtEnd).toHaveLength(usersInDBAtStart.length + 1)
                const usernames = usersInDBAtEnd.map((user) => user.username)
                expect(usernames).toContain(newUser.username)
            })

            test('fails with a proper status code if given invalid username', async () => {
                const usersInDBAtStart = await helpers.usersInDB()

                const newUser = {
                    username: "",
                    name:"Eleaz Aburi",
                    password: 'Blauteinomo'
                }

                await api.post('/api/users')
                    .send(newUser)
                    .expect(400)
                    .expect('Content-Type', /application\/json/)

                const usersInDBAtEnd = await helpers.usersInDB()
                expect(usersInDBAtEnd).toHaveLength(usersInDBAtStart.length)
            })

            test('fails with a proper status code if given invalid password', async () => {
                const usersInDBAtStart = await helpers.usersInDB()

                const newUser = {
                    username: "TheWorldConquer",
                    name: "Stevio Kontos",
                    password: ""
                }

                await api.post('/api/users')
                    .send(newUser)
                    .expect(400)
                    .expect('Content-Type', /application\/json/)

                const usersInDBAtEnd = await helpers.usersInDB()
                expect(usersInDBAtEnd).toHaveLength(usersInDBAtStart.length)
            })

            test('fails with a proper status code if name is less than 3 characters long', async () => {
                const usersInDBAtStart = await helpers.usersInDB()
                 
                const newUser = {
                    username: "hj",
                    name: "Cornelius Ghrams",
                    password: "Athalound3"
                }

                await api.post('/api/users')
                    .send(newUser)
                    .expect(400)
                    .expect('Content-Type', /application\/json/)

                const usersInDBAtEnd = await helpers.usersInDB()
                expect(usersInDBAtEnd).toHaveLength(usersInDBAtStart.length)
            })

            test('fails with a proper status code if password is less than 3 characters long', async () => {
                const usersInDBAtStart = await helpers.usersInDB()
                 
                const newUser = {
                    username: "helicobacter6",
                    name: "Cornelius Ghrams",
                    password: "A3"
                }

                await api.post('/api/users')
                    .send(newUser)
                    .expect(400)
                    .expect('Content-Type', /application\/json/)

                const usersInDBAtEnd = await helpers.usersInDB()
                expect(usersInDBAtEnd).toHaveLength(usersInDBAtStart.length)
            })
        })
    })
})



afterAll(() => {
    mongoose.connection.close()
})