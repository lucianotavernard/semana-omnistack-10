import http from 'http'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import routes from './routes'
import { setupWebsocket } from './websocket'

const app = express()
const server = http.Server(app)

setupWebsocket(server)

mongoose.connect('mongodb://root:example@localhost:27017/omnistack10', {
  authSource: 'admin',
  useNewUrlParser: true,
  useFindAndModify: true,
  useUnifiedTopology: true,
})

app.use(cors())
app.use(express.json())
app.use(routes)

server.listen(3333, () => {
  console.log('Server running on port 3333')
})
