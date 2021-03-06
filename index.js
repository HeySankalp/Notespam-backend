const connectToMongo = require('./db');
const express = require('express')
var cors = require('cors')
require("dotenv").config

connectToMongo();

const app = express()
app.use(cors())
const port = process.env.PORT || 5000;

app.use(express.json()) 

//Available Routes
app.use('/api/auth', require('./routes/auth.js'))
app.use('/api/notes', require('./routes/notes.js'))



app.listen(port, () => {
  console.log(`NoteSpam🔥 listening on port ${port}`)
})