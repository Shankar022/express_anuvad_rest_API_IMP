const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const userRouter = require('./routes/translateRouter')

const app = express()

//Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//Routes
app.use('/api/v1/',userRouter)


module.exports = app