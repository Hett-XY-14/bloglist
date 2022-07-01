const listHelpers = require('../utils/list_helpers')
const blogs = require('./blogsList')

test('dummy returns one', () => {
    const result = listHelpers.dummy(blogs)
    expect(result).toBe(1)
})

