const listHelpers = require('../utils/list_helpers')
const blogs = require('./blogsList')

describe ('test for most liked author', () => {
    test('Among a series of blogs', () => {
        const result = listHelpers.mostLikes(blogs)

        expect(result).toEqual(
            {
                author: "Edsger W. Dijkstra",
                likes: 17
            }
        )
    })
})