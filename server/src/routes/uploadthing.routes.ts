import { createRouteHandler } from 'uploadthing/express'
import { uploadRouter } from '../lib/uploadthing.js'

export const uploadthingRouter = createRouteHandler({
  router: uploadRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
})

export default uploadthingRouter
