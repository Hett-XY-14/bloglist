const listHelpers = require('../utils/list_helpers')
const blogs = require('./blogsList')

describe('The favourite blog', () => {
    test('of a series of blogs', () => {
        const result = listHelpers.favoriteBlog(blogs)

        expect(result).toEqual(
            {
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 12,
            }
        )
    })
})