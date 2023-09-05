const userRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')

userRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { title: 1, author: 1 })

  response.json(users)
})

userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password.length < 3) {
    response.status(400).json({
      error: 'password must be at least 3 chars'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  console.log(user, '!@#!@#!@#!@#@!@')

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = userRouter