import { app } from '../app.js'
import type { Server } from 'http'

interface ApiResponse {
  success: boolean
  data?: { id: string }
  error?: { message: string; statusCode: number }
}

async function runTests() {
  const server: Server = app.listen(0)
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Failed to get server port')
  }
  const baseUrl = `http://localhost:${address.port}`

  console.log(`Test server running at ${baseUrl}`)

  try {
    // 1. Test malformed UUID on GET /api/subjects/:id
    console.log('Test 1: Malformed UUID returns 400...')
    const res1 = await fetch(`${baseUrl}/api/subjects/not-a-uuid`)
    const data1 = (await res1.json()) as ApiResponse
    if (res1.status !== 400 || data1.success !== false) {
      throw new Error(`Expected 400, got ${res1.status}: ${JSON.stringify(data1)}`)
    }
    console.log('Passed: Malformed UUID returned 400.')

    // 2. Test non-existent UUID on GET /api/subjects/:id
    console.log('Test 2: Non-existent UUID returns 404...')
    const res2 = await fetch(`${baseUrl}/api/subjects/00000000-0000-0000-0000-000000000000`)
    const data2 = (await res2.json()) as ApiResponse
    if (res2.status !== 404 || data2.success !== false) {
      throw new Error(`Expected 404, got ${res2.status}: ${JSON.stringify(data2)}`)
    }
    console.log('Passed: Non-existent UUID returned 404.')

    // 3. Test empty subject creation returns 400
    console.log('Test 3: Empty subject name returns 400...')
    const res3 = await fetch(`${baseUrl}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '   ' }),
    })
    const data3 = (await res3.json()) as ApiResponse
    if (res3.status !== 400 || data3.success !== false) {
      throw new Error(`Expected 400, got ${res3.status}: ${JSON.stringify(data3)}`)
    }
    console.log('Passed: Empty subject name rejected with 400.')

    // 4. Test invalid Tiptap content schema returns 400
    console.log('Test 4: Invalid Tiptap schema rejected with 400...')
    const createSub = await fetch(`${baseUrl}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Validation Test Subject' }),
    })
    const subData = (await createSub.json()) as ApiResponse
    const subjectId = subData.data?.id

    if (subjectId) {
      const res4 = await fetch(`${baseUrl}/api/subjects/${subjectId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Bad Note',
          content: { type: 'invalid_type', content: 'not-an-array' },
        }),
      })
      const data4 = (await res4.json()) as ApiResponse
      if (res4.status !== 400 || data4.success !== false) {
        throw new Error(`Expected 400, got ${res4.status}: ${JSON.stringify(data4)}`)
      }
      console.log('Passed: Invalid Tiptap schema rejected with 400.')

      // Clean up
      await fetch(`${baseUrl}/api/subjects/${subjectId}`, { method: 'DELETE' })
      console.log('Cleaned up temporary subject.')
    }

    console.log('\nAll validation & error handling tests passed successfully!')
  } finally {
    server.close()
  }
}

runTests().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
