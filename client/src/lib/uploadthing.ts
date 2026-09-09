import { genUploader } from 'uploadthing/client'
import type { OurFileRouter } from '../../../server/src/lib/uploadthing'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const { uploadFiles } = genUploader<OurFileRouter>({
  url: `${API_BASE_URL}/api/uploadthing`,
})
