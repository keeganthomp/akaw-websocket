const mongoose = require('mongoose')

require('dotenv').config()

const isProduction = process.env.NODE_ENV !== 'dev'
const dbUsername = process.env.DB_USERNAME
const dbPassword = process.env.DB_PASSWORD
const databaseName = isProduction
  ? process.env.PROD_DB_NAME
  : process.env.DEV_DB_NAME

const DB_ROUTE = `mongodb+srv://${dbUsername}:${dbPassword}!@surfing-it-zykrc.mongodb.net/${databaseName}?retryWrites=true&w=majority`

mongoose.connect(DB_ROUTE, { useNewUrlParser: true })

const db = mongoose.connection

db.once('open', () => console.log('Connected to db'))

module.exports = {
  db
}
