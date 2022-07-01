const listHelpers = require('../utils/list_helpers')
const blogs = require('./blogsList')

describe('total of likes', () => {
    test('of an empty blog list', () => {
        const result = listHelpers.totalLikes([])
        expect(result).toBe(0)
    })

    test('of all blogs', () => {
        const result = listHelpers.totalLikes(blogs)
        expect(result).toBe(36)
    })

    test('of one blog with 7 likes', () => {
        const blog =  [
            {
              _id: "5a422a851b54a676234d17f7",
              title: "React patterns",
              author: "Michael Chan",
              url: "https://reactpatterns.com/",
              likes: 7,
              __v: 0
            }
        ]

        const result = listHelpers.totalLikes(blog)

        expect(result).toBe(7)
    })
})