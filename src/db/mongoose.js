require('dotenv/config')
const mongoose = require('mongoose')

const host = process.env.MONGO_HOST
const port = process.env.MONGO_PORT
const dbName = process.env.MONGO_DB_NAME

module.exports = () => {
  const connect = mongoose.connect(`mongodb://${host}:${port}/${dbName}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  mongoose.set('useCreateIndex', true)

  return connect
}
