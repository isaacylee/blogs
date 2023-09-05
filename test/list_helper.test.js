const listHelper = require('../utils/list_helper')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

mongoose.set('bufferTimeoutMS', 100000)

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogsArray = listHelper.blogs.map((blog) => {
    return new Blog(blog).save()
  })
  await Promise.all(blogsArray)
}, 100000)

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('of empty list is zero', () => {
    expect(listHelper.totalLikes([])).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listHelper.blogs.slice(0, 1))
    expect(result).toBe(7)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(listHelper.blogs)
    expect(result).toBe(36)
  })
})


test('favorite blog of list is right', () => {
  const result = listHelper.favoriteBlog(listHelper.blogs)
  expect(result).toEqual({
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  })
})

test('Robert C Martin has most blogs', () => {
  let result = listHelper.mostBlogs(listHelper.blogs)
  expect(result).toEqual({
    author: "Robert C. Martin",
    blogs: 3
  })
} )

test('Edsger W. Dijkstra has most likes', () => {
  let result = listHelper.mostLikes(listHelper.blogs)
  expect(result).toEqual({
    author: "Edsger W. Dijkstra",
    likes: 17
  })
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(listHelper.blogs.length)
}, 100000)

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
}, 100000)

test('id is defined', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body
  const blog = blogs[0]
  expect(blog.id).toBeDefined()
})

describe('when adding a new blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await api
      .post('/api/users')
      .send(listHelper.newUser)

  }, 100000)

  test('fails with no token', async () => {
    const newBlog = {
      title: 'Travels with John',
      author: 'John Smith',
      url: 'https://johnstravels.com/',
      likes: 9
    }
  
    let response = await api.post('/api/blogs')
      .send(newBlog)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain("jwt must be provided")
  })

  test('Blog can be added', async () => {
    const loggedInUser = (await api.post('/api/login')
      .send(listHelper.newUser))
      .body

    const newBlog = {
      title: 'Travels with John',
      author: 'John Smith',
      url: 'https://johnstravels.com/',
      likes: 9
    }
  
    await api.post('/api/blogs')
      .send(newBlog)
      .set({Authorization: 'Bearer ' + loggedInUser.token})
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await listHelper.blogsInDb()
  
    expect(blogsAtEnd).toHaveLength(listHelper.blogs.length + 1)
  })

  test('likes property defaults to zero', async () => {
    const loggedInUser = (await api.post('/api/login')
      .send(listHelper.newUser))
      .body

    const newBlog = {
      title: 'Travels with John',
      author: 'John Smith',
      url: 'https://johnstravels.com/'
    }
  
    const createdBlog = await api.post('/api/blogs')
      .send(newBlog)
      .set({Authorization: `Bearer ${loggedInUser.token}`})
      .expect(201)
      .expect('Content-Type', /application\/json/)
  
    expect(createdBlog.body.likes).toEqual(0)
  })
})

test('blog without title cannot be saved', async () => {
  const newBlog = {
    author: 'John Smith',
    url: 'https://johnstravels.com/',
    likes: 9
  }

 await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)
}, 100000)

test('blog without author cannot be saved', async () => {
  const newBlog = {
    title: 'Travels with John',
    url: 'https://johnstravels.com/',
    likes: 9
  }

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(400)
}, 100000)

describe('when deleting a blog', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    await api
      .post('/api/users')
      .send(listHelper.newUser)
  })

  test('is successful when id is valid', async () => {
    const loggedInUser = (await api.post('/api/login')
      .send(listHelper.newUser))
      .body

    const newBlog = {
      title: 'Travels with John',
      author: 'John Smith',
      url: 'https://johnstravels.com/',
      likes: 9
    }
  
    const blogToDelete = (await api.post('/api/blogs')
        .send(newBlog)
        .set({Authorization: `Bearer ${loggedInUser.token}`})
        ).body

    const blogsAtStart = await listHelper.blogsInDb()

    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .set({Authorization: `Bearer ${loggedInUser.token}`})

    const blogsAtEnd = await listHelper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
  })
})

describe('when updating a blog', () => {
  test('is successful when properties are valid', async () => {
    const blogsAtStart = await listHelper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updateTo = {...blogToUpdate, likes: blogToUpdate.likes + 1}

    const updatedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`)
      .send(updateTo)
      .expect(200)

    expect(updatedBlog.body.likes).toEqual(blogToUpdate.likes + 1)
  })
})

describe('when creating an invalid user', () => {
  test('right status code and message are sent', async () => {
    const invalidUser = {
      'username': 'ilee1234',
      'name': 'Isaac Lee',
      'password': 'p'
    }
  
    const result = await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  
    expect(result.body.error).toContain('password must be at least 3 chars')
  }, 10000)

  test('user is not added', async () => {
    const usersAtStart = await User.find({})

    console.log(usersAtStart)

    const invalidUser = {
      'username': 'ilee1234',
      'name': 'Isaac Lee',
      'password': 'p'
    }
  
    await api
      .post('/api/users')
      .send(invalidUser)

    const usersAtEnd = await User.find({})

    expect(usersAtStart).toHaveLength(usersAtEnd.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
