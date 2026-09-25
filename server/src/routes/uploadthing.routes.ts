import { Router, type Request, type Response, type NextFunction } from 'express'
import { createRouteHandler } from 'uploadthing/express'
import { uploadRouter } from '../lib/uploadthing.js'

export const uploadthingRouter = Router()

let handlerInstance: any = null

function getHandler() {
  if (!handlerInstance) {
    handlerInstance = createRouteHandler({
      router: uploadRouter,
      config: {
        token: process.env.UPLOADTHING_TOKEN,
      },
    })
  }
  return handlerInstance
}

uploadthingRouter.use((req: Request, res: Response, next: NextFunction) => {
  return getHandler()(req, res, next)
})

export default uploadthingRouter
