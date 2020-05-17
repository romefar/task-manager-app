const express = require('express')
const connect = require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

connect()
  .then(() => {
    console.log('\n - Succesfully connected to a database.')
    app.listen(port, () => {
      console.log(` -- Server is up on port ${port}`)
    })
  })
  .catch(err => {
    console.log(`An error was occured. Error: ${err.message}.`)
  })
