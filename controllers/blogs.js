const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const userExtractor = require('../utils/middleware').userExtractor

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1})

  response.json(blogs)
})

// blogRouter.get('/:id', async (request, response) => {
//   const blog = await Blog
//     .findById(request.params.id)
//     .populate('user', { username: 1, name: 1})

//   response.json(blog)
// })

blogRouter.post('/', userExtractor, async (request, response) => {
  const blog = new Blog(request.body)
  const user = request.user

  blog.likes = blog.likes || 0
  blog.user = user.id
  let savedBlogId = (await blog.save()).id

  let savedBlog = await Blog
    .findById(savedBlogId)
    .populate('user', { username: 1, name: 1})

  user.blogs = user.blogs.concat(savedBlog)
  await user.save()

  if (savedBlog) {
    response.status(201).json(savedBlog)
  } else {
    response.status(400).end()
  }
})

blogRouter.delete('/:id', userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() === request.user.id) {
    await Blog.deleteOne({_id: blog._id})
    response.status(204).end()
  } else {
    return response.status(401).json({
      error: 'invalid user'
    })
  }
})

blogRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true }
  )

  if (updatedBlog) {
    response.json(updatedBlog)
  } else {
    response.status(400).end()
  }
})

module.exports = blogRouter