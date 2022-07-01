const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sumOfLikes, blog) => {
        return sumOfLikes + blog.likes
    }

    return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    let favoriteBlog = blogs[0]
    blogs.forEach(blog => {
        if (blog.likes > favoriteBlog.likes) {
            favoriteBlog = blog
        }
    })
    const formattedFavoriteBlog = {
        title: favoriteBlog.title,
        author: favoriteBlog.author,
        url: favoriteBlog.url,
        likes: favoriteBlog.likes,
    }
    return formattedFavoriteBlog
}

const mostBlogs = (blogs) => {
    let authors = []
    let numberOfBlogs = []
    blogs.forEach((blog) => {
        if (!(authors.includes(blog.author))) {
            authors = authors.concat(blog.author)
            numberOfBlogs = numberOfBlogs.concat(1)
        } else {
            numberOfBlogs[authors.indexOf(blog.author)] += 1
        }
    })
    const index = numberOfBlogs.indexOf(Math.max(...numberOfBlogs))
    return {
        author: authors[index],
        blogs: numberOfBlogs[index]
    }
}

const mostLikes = (blogs) => {
    //the function receives an array of blogs as its parameter and returns
    //the author, whose blog posts have the larges amount of likes.
    let authors = []
    let likes = []
    blogs.forEach((blog) => {
        if(!(authors.includes(blog.author))) {
            authors = authors.concat(blog.author)
            likes = likes.concat(blog.likes)
        } else {
            const authorIndex = authors.indexOf(blog.author)
            likes[authorIndex] += blog.likes
        }
    })

    const indexOfMostLiked = likes.indexOf(Math.max(...likes))
    return ({
        author: authors[indexOfMostLiked],
        likes: likes[indexOfMostLiked]
    })
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}