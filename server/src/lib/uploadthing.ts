import { createUploadthing, type FileRouter } from 'uploadthing/express'

const f = createUploadthing()

export const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 4,
    },
  }).onUploadComplete(async ({ file }) => {
    return {
      fileKey: file.key,
      fileUrl: file.ufsUrl || file.url,
      fileName: file.name,
      mimeType: file.type || 'image/png',
    }
  }),
} satisfies FileRouter

export type OurFileRouter = typeof uploadRouter
