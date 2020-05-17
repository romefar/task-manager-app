const express = require('express')
const router = new express.Router()
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter (req, file, cb) {
    const extension = file.originalname.match(/\.(jpeg|jpg|png)$/)
    if (!extension) {
      cb(new Error('Please provide a *.jpeg, *.jpg, *.png file.'))
    }
    cb(null, true)
  }
})

router.post('/users', async (req, res) => {
  try {
    const user = new User(req.body)
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    res.status(400).send(error)
  }

  // user.save()
  //     .then(data => res.status(201).send(data))
  //     .catch(error => {
  //         res.status(400).send(error)
  //     });
})

router.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.fundByCredintials(email, password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    const token = req.token
    req.user.tokens = req.user.tokens.filter(item => item.token !== token)
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
  // try {
  //     const users = await User.find({});
  //     res.send(users);
  // } catch (error) {
  //     res.status(500).send(error);
  // }

  // User.find({})
  //     .then(users => res.send(users))
  //     .catch(err => res.status(500).send())
})

// router.get('/users/:id', async (req, res) => {
//     try {
//         const _id = req.params.id;
//         const user = await User.findById(_id);

//         if (!user) return res.status(404).send();

//         res.send(user);
//     } catch (error) {
//         res.status(500).send()
//     }
// });

router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = Object.keys(User.schema.obj) // ['name', 'email', 'password', 'age'];
  const isValidUpdate = updates.every(item => allowedUpdates.includes(item))

  if (!isValidUpdate) return res.status(400).send({ error: 'Invalid updates!' })

  try {
    const user = req.user
    updates.forEach(item => {
      user[item] = req.body[item]
    })
    await user.save()
    res.send(user)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    res.send(req.user)
  } catch (error) {
    res.status(500).send(error)
  }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { user, file } = req
    const buffer = await sharp(file.buffer)
      .resize({
        width: 250,
        height: 250
      })
      .png()
      .toBuffer()
    user.avatar = buffer
    await user.save()
    res.send()
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}, (error, req, res, next) => {
  res.status(400).send({
    error: error.message
  })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  try {
    const { user } = req
    user.avatar = undefined
    await user.save()
    res.send()
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
}, (error, req, res, next) => {
  res.status(400).send({
    error: error.message
  })
})

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error('Cannot find an image.')
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (error) {
    res.status(404).send({ error: error.message })
  }
})

module.exports = router
