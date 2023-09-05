const Blog = require('../models/blog')

const dummy = blogs => {
  return 1
}

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }  
]

const totalLikes = blogs => {
  return blogs.reduce((total, blog) => {
    total += blog.likes
    return total
  }, 0)
}

const favoriteBlog = blogs => {
  let maxLikes = Math.max(...blogs.map(({likes}) => likes))
  return blogs.find(({likes}) => likes === maxLikes)
}

const mostBlogs = blogs => {
  const blogCounts = blogs.reduce((obj, blog) => {
    const author = blog.author
    obj[author] = obj[author] || 0
    obj[author] = obj[author] + 1
    return obj
  }, {})

  let sorted = Object.entries(blogCounts).sort((a, b) => b[1] - a[1])
  let highest = sorted[0]

  return { author: highest[0], blogs: highest[1] }
}

const mostLikes = blogs => {
  const tally = blogs.reduce((obj, blog) => {
    const author = blog.author
    obj[author] = obj[author] || 0
    obj[author] = obj[author] + blog.likes
    return obj
  }, {})

  let sorted = Object.entries(tally).sort((a, b) => b[1] - a[1])
  let highest = sorted[0]

  return { author: highest[0], likes: highest[1] }
}

const blogsInDb = async () => {
  let blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const nonExistingId = async () => {
  const note = new Blog({ title: 'willremovethissoon', author: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const newUser = {
  username: 'tester',
  name: 'Tester',
  password: 'tester123'
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  blogs,
  blogsInDb,
  nonExistingId,
  newUser
}