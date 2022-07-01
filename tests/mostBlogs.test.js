const listHelpers = require('../utils/list_helpers')
const blogs = require('./blogsList')

describe('Author with more blogs written', () => {
    test('from a series of blogs', () => {
        const result = listHelpers.mostBlogs(blogs)

        expect(result).toEqual(
            {
                author: "Robert C. Martin",
                blogs: 3
            }
        )
    })
})