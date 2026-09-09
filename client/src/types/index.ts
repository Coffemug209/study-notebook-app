export interface Subject {
  id: string
  name: string
  position: number
  createdAt: string
  updatedAt: string
  notes?: Note[]
  artifacts?: Artifact[]
}

export interface Note {
  id: string
  subjectId: string
  title: string
  content: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  artifacts?: Artifact[]
  subject?: Subject
}

export interface Artifact {
  id: string
  subjectId: string
  noteId: string
  title: string
  fileKey: string
  fileUrl: string
  mimeType: string
  createdAt: string
  updatedAt: string
  note?: {
    id: string
    title: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: {
    message: string
    statusCode?: number
  }
}
