const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })
  try {
    await task.save()
    res.status(201).send(task)
  } catch (error) {
    res.status(400).end(error)
  }
  // task.save()
  //     .then(data => res.status(201).send(data))
  //     .catch(err => res.status(400).send(err));
})

// GET / tasks?completed=false|true
// GET / tasks?limit=10&skip=10
// GET / tasks?sortBy=createdAt_desc
router.get('/tasks', auth, async (req, res) => {
  console.log(req.query)

  const match = {}
  const sort = {}

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split('_')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  try {
    // const tasks = await Task.find({ owner : req.user._id });
    // another approach
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
        // sort : {
        //     createdAt : -1 // ASC - 1 DESC -1
        // }
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) return res.status(404).send()

    res.send(task)
  } catch (error) {
    res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const allowedUpdates = Object.keys(Task.schema.obj)
    const updates = Object.keys(req.body)
    const isValidUpdate = updates.every(item => allowedUpdates.includes(item))

    if (!isValidUpdate) return res.status(400).send({ error: 'Invalid update!' })

    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) return res.status(404).send()

    updates.forEach(item => {
      task[item] = req.body[item]
    })

    await task.save()

    res.send(task)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id })

    if (!task) return res.status(404).send()

    res.send(task)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router
