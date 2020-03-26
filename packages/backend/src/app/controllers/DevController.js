import axios from 'axios'

import Dev from '../models/Dev'
import parseStringAsArray from '../../utils/parseStringAsArray'
import { findConnections, sendMessage } from '../../websocket'

export default {
  async index(request, response) {
    const devs = await Dev.find()

    return response.json(devs)
  },

  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body

    const devExists = await Dev.findOne({ github_username })

    if (devExists) {
      return response.status(400).json({ error: 'Dev already exists.' })
    }

    const apiResponse = await axios.get(
      `https://api.github.com/users/${github_username}`
    )

    const { login, name = login, avatar_url, bio } = apiResponse.data

    const techsArray = parseStringAsArray(techs)

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    }

    const dev = await Dev.create({
      github_username,
      name,
      avatar_url,
      bio,
      techs: techsArray,
      location,
    })

    const sendSocketMessageTo = findConnections(
      { latitude, longitude },
      techsArray
    )

    sendMessage(sendSocketMessageTo, 'new-dev', dev)

    return response.json(dev)
  },

  async update(request, response) {
    const { latitude, longitude } = request.body
    const { dev_id } = request.params

    const dev = await Dev.findById(dev_id)

    if (!dev) {
      return response.status(400).json({ error: 'Dev not found.' })
    }

    await dev.update({
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    })

    return response.json(dev)
  },
}
