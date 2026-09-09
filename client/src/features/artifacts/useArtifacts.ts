import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'
import type { Artifact, ApiResponse } from '../../types'

export function useArtifacts(subjectId: string | null) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArtifacts = useCallback(async () => {
    if (!subjectId) {
      setArtifacts([])
      return
    }

    setLoading(true)
    try {
      const res = await api.get<ApiResponse<Artifact[]>>(`/subjects/${subjectId}/artifacts`)
      const data = res.data.data || []
      // Sort newest updated first
      const sorted = [...data].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setArtifacts(sorted)
      setError(null)
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { message?: string } } }; message?: string })
          ?.response?.data?.error?.message ||
        (err as Error)?.message ||
        'Failed to load artifacts'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    fetchArtifacts()
  }, [fetchArtifacts])

  const deleteArtifact = async (artifactId: string) => {
    await api.delete(`/artifacts/${artifactId}`)
    setArtifacts((prev) => prev.filter((a) => a.id !== artifactId))
  }

  const updateArtifact = async (artifactId: string, title: string) => {
    const res = await api.patch<ApiResponse<Artifact>>(`/artifacts/${artifactId}`, { title })
    if (res.data.data) {
      const updated = res.data.data
      setArtifacts((prev) => prev.map((a) => (a.id === artifactId ? updated : a)))
      return updated
    }
    throw new Error('Failed to update artifact')
  }

  return {
    artifacts,
    loading,
    error,
    deleteArtifact,
    updateArtifact,
    refetch: fetchArtifacts,
  }
}

export default useArtifacts
