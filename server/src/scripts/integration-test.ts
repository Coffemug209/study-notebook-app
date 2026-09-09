import { app } from '../app.js'
import type { Server } from 'http'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: { message: string; statusCode: number }
}

async function runIntegrationTests() {
  console.log('--- STARTING COMPREHENSIVE INTEGRATION SUITE (PART 15) ---')
  const server: Server = app.listen(0)
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Could not obtain test server port')
  }
  const baseUrl = `http://localhost:${address.port}`

  try {
    // -------------------------------------------------------------
    // PHASE 1: SUBJECTS LIFECYCLE
    // -------------------------------------------------------------
    console.log('\n[Phase 1: Subject Management]')

    // 1.1 Create Subject A
    const resSubA = await fetch(`${baseUrl}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Integration Physics' }),
    })
    const dataSubA = (await resSubA.json()) as ApiResponse<{ id: string; name: string; position: number }>
    if (resSubA.status !== 201 || !dataSubA.data?.id) {
      throw new Error(`Failed to create Subject A: ${JSON.stringify(dataSubA)}`)
    }
    const subjectAId = dataSubA.data.id
    console.log(`✓ Created Subject A: ${subjectAId} (${dataSubA.data.name})`)

    // 1.2 Create Subject B
    const resSubB = await fetch(`${baseUrl}/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Integration Chemistry' }),
    })
    const dataSubB = (await resSubB.json()) as ApiResponse<{ id: string; name: string; position: number }>
    if (resSubB.status !== 201 || !dataSubB.data?.id) {
      throw new Error(`Failed to create Subject B: ${JSON.stringify(dataSubB)}`)
    }
    const subjectBId = dataSubB.data.id
    console.log(`✓ Created Subject B: ${subjectBId} (${dataSubB.data.name})`)

    // 1.3 Rename Subject A (PATCH — server uses PATCH not PUT)
    const resRename = await fetch(`${baseUrl}/api/subjects/${subjectAId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Advanced Quantum Physics' }),
    })
    const dataRename = (await resRename.json()) as ApiResponse<{ id: string; name: string }>
    if (resRename.status !== 200 || dataRename.data?.name !== 'Advanced Quantum Physics') {
      throw new Error(`Failed to rename Subject A: ${JSON.stringify(dataRename)}`)
    }
    console.log(`✓ Renamed Subject A to: ${dataRename.data?.name}`)

    // 1.4 List all subjects and verify order
    const resListSubs = await fetch(`${baseUrl}/api/subjects`)
    const dataListSubs = (await resListSubs.json()) as ApiResponse<Array<{ id: string; name: string; position: number }>>
    if (resListSubs.status !== 200 || !Array.isArray(dataListSubs.data)) {
      throw new Error(`Failed to list subjects: ${JSON.stringify(dataListSubs)}`)
    }
    const currentSubjects = dataListSubs.data
    console.log(`✓ Retrieved ${currentSubjects.length} total subjects from DB`)

    // 1.5 Reorder all subjects (PATCH)
    const allIds = currentSubjects.map(s => s.id)
    const reversedIds = [...allIds].reverse()
    const resReorder = await fetch(`${baseUrl}/api/subjects/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: reversedIds }),
    })
    const dataReorder = (await resReorder.json()) as ApiResponse
    if (resReorder.status !== 200 || !dataReorder.success) {
      throw new Error(`Failed to reorder subjects: ${JSON.stringify(dataReorder)}`)
    }
    console.log(`✓ Successfully reordered subjects across database`)

    // -------------------------------------------------------------
    // PHASE 2: NOTES LIFECYCLE & RICH TEXT EDITING
    // -------------------------------------------------------------
    console.log('\n[Phase 2: Note Cards CRUD & Sorting]')

    // 2.1 Create Note 1 in Subject A
    const note1Doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Wave-particle duality fundamentals.' }],
        },
      ],
    }
    const resNote1 = await fetch(`${baseUrl}/api/subjects/${subjectAId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Quantum Mechanics Note 1', content: note1Doc }),
    })
    const dataNote1 = (await resNote1.json()) as ApiResponse<{ id: string; title: string }>
    if (resNote1.status !== 201 || !dataNote1.data?.id) {
      throw new Error(`Failed to create Note 1: ${JSON.stringify(dataNote1)}`)
    }
    const note1Id = dataNote1.data.id
    console.log(`✓ Created Note 1: ${note1Id}`)

    // 2.2 Create Note 2 in Subject A
    const resNote2 = await fetch(`${baseUrl}/api/subjects/${subjectAId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Quantum Mechanics Note 2', content: { type: 'doc', content: [] } }),
    })
    const dataNote2 = (await resNote2.json()) as ApiResponse<{ id: string; title: string }>
    if (resNote2.status !== 201 || !dataNote2.data?.id) {
      throw new Error(`Failed to create Note 2: ${JSON.stringify(dataNote2)}`)
    }
    const note2Id = dataNote2.data.id
    console.log(`✓ Created Note 2: ${note2Id}`)

    // 2.3 Wait briefly, then update Note 1 (PATCH — tests newest-updated sorting)
    await new Promise(r => setTimeout(r, 1100))
    const resUpdateNote1 = await fetch(`${baseUrl}/api/notes/${note1Id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Quantum Mechanics Note 1 (Updated)',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Wave-particle duality. Added Schrödinger wave equation.' }],
            },
          ],
        },
      }),
    })
    const dataUpdateNote1 = (await resUpdateNote1.json()) as ApiResponse<{ id: string; title: string }>
    if (resUpdateNote1.status !== 200 || dataUpdateNote1.data?.title !== 'Quantum Mechanics Note 1 (Updated)') {
      throw new Error(`Failed to update Note 1: ${JSON.stringify(dataUpdateNote1)}`)
    }
    console.log(`✓ Updated Note 1 title and rich-text content`)

    // 2.4 Verify Note 1 appears FIRST in subject notes list (updatedAt DESC)
    const resSubjectNotes = await fetch(`${baseUrl}/api/subjects/${subjectAId}/notes`)
    const dataSubjectNotes = (await resSubjectNotes.json()) as ApiResponse<Array<{ id: string; title: string }>>
    if (resSubjectNotes.status !== 200 || dataSubjectNotes.data?.[0]?.id !== note1Id) {
      throw new Error(`Expected Note 1 first (newest updatedAt): ${JSON.stringify(dataSubjectNotes.data?.map(n => n.title))}`)
    }
    console.log(`✓ Verified newest-updated sorting: Note 1 is at top of list`)

    // -------------------------------------------------------------
    // PHASE 3: ARTIFACTS & RELATIONAL INTEGRITY
    // -------------------------------------------------------------
    console.log('\n[Phase 3: Artifact Binding & Workspace Panel]')

    // 3.1 Create Artifact for Note 1
    const resArtifact = await fetch(`${baseUrl}/api/notes/${note1Id}/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Wave Function Graph',
        fileKey: 'test-upload-key-123',
        fileUrl: 'https://utfs.io/f/test-image-wave.png',
        mimeType: 'image/png',
      }),
    })
    const dataArtifact = (await resArtifact.json()) as ApiResponse<{ id: string; title: string; subjectId: string; noteId: string }>
    if (resArtifact.status !== 201 || !dataArtifact.data?.id) {
      throw new Error(`Failed to create Artifact: ${JSON.stringify(dataArtifact)}`)
    }
    const artifactId = dataArtifact.data.id
    if (dataArtifact.data.subjectId !== subjectAId) {
      throw new Error(`Artifact subjectId (${dataArtifact.data.subjectId}) !== note subjectId (${subjectAId})`)
    }
    console.log(`✓ Attached Artifact ${artifactId} — strictly linked to Subject A`)

    // 3.2 List artifacts in Subject A workspace
    const resSubArtifacts = await fetch(`${baseUrl}/api/subjects/${subjectAId}/artifacts`)
    const dataSubArtifacts = (await resSubArtifacts.json()) as ApiResponse<Array<{ id: string }>>
    if (resSubArtifacts.status !== 200 || !dataSubArtifacts.data?.some(a => a.id === artifactId)) {
      throw new Error(`Artifact not in Subject A workspace: ${JSON.stringify(dataSubArtifacts)}`)
    }
    console.log(`✓ Subject A workspace artifacts panel returns attached artifact`)

    // -------------------------------------------------------------
    // PHASE 4: DEDICATED /new-note APPEND WORKFLOW
    // -------------------------------------------------------------
    console.log('\n[Phase 4: Dedicated /new-note Flow Simulation]')

    // 4.1 Create note targeted to Subject B
    const resDedicatedNote = await fetch(`${baseUrl}/api/subjects/${subjectBId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Chemical Equilibrium Notes',
        content: {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Le Chatelier principle.' }] }],
        },
      }),
    })
    const dataDedicatedNote = (await resDedicatedNote.json()) as ApiResponse<{ id: string }>
    if (resDedicatedNote.status !== 201 || !dataDedicatedNote.data?.id) {
      throw new Error(`Failed to create dedicated note: ${JSON.stringify(dataDedicatedNote)}`)
    }
    const dedicatedNoteId = dataDedicatedNote.data.id

    // 4.2 Attach artifact to dedicated note — must bind to Subject B's subjectId
    const resDedicatedArt = await fetch(`${baseUrl}/api/notes/${dedicatedNoteId}/artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Phase Diagram',
        fileKey: 'test-upload-key-456',
        fileUrl: 'https://utfs.io/f/test-image-phase.png',
        mimeType: 'image/png',
      }),
    })
    const dataDedicatedArt = (await resDedicatedArt.json()) as ApiResponse<{ id: string; subjectId: string }>
    if (resDedicatedArt.status !== 201 || dataDedicatedArt.data?.subjectId !== subjectBId) {
      throw new Error(`Dedicated artifact failed Subject B association: ${JSON.stringify(dataDedicatedArt)}`)
    }
    console.log(`✓ Dedicated /new-note workflow verified — artifact correctly bound to Subject B`)

    // -------------------------------------------------------------
    // PHASE 5: CASCADE DELETION & ZERO-ORPHAN VERIFICATION
    // -------------------------------------------------------------
    console.log('\n[Phase 5: Cascade Deletions & Zero-Orphan Check]')

    // 5.1 Delete Note 1 → artifact must cascade
    const resDelNote1 = await fetch(`${baseUrl}/api/notes/${note1Id}`, { method: 'DELETE' })
    if (resDelNote1.status !== 200) {
      throw new Error(`Failed to delete Note 1: ${resDelNote1.status}`)
    }
    // Artifact should now be 404
    const resCheckArt = await fetch(`${baseUrl}/api/artifacts/${artifactId}`)
    if (resCheckArt.status !== 404) {
      throw new Error(`Artifact ${artifactId} should be cascade-deleted (404), got ${resCheckArt.status}`)
    }
    console.log(`✓ Note deletion cascaded to artifacts — zero orphans confirmed`)

    // 5.2 Delete both test subjects (cascades remaining notes + artifacts)
    await fetch(`${baseUrl}/api/subjects/${subjectAId}`, { method: 'DELETE' })
    await fetch(`${baseUrl}/api/subjects/${subjectBId}`, { method: 'DELETE' })
    console.log(`✓ Cleaned up test subjects A and B with all child entities`)

    // -------------------------------------------------------------
    // PHASE 6: SECURITY & ERROR HANDLING CONFIRMATION
    // -------------------------------------------------------------
    console.log('\n[Phase 6: Security & Error Handling Checks]')

    // 6.1 Malformed UUID → 400
    const resBadId = await fetch(`${baseUrl}/api/notes/invalid-uuid-format`)
    if (resBadId.status !== 400) throw new Error(`Expected 400 for bad UUID, got ${resBadId.status}`)
    console.log(`✓ Invalid UUID rejected with 400 Bad Request`)

    // 6.2 Missing record → 404 (use valid v4 UUID that won't exist)
    const ghostNoteId = 'a1b2c3d4-e5f6-4789-abcd-ef1234567890'
    const resMissing = await fetch(`${baseUrl}/api/notes/${ghostNoteId}`)
    if (resMissing.status !== 404) throw new Error(`Expected 404 for missing note, got ${resMissing.status}`)
    console.log(`✓ Missing record returns clean 404 Not Found`)

    // 6.3 Error envelope must not contain secrets
    const errBody = (await resMissing.json()) as ApiResponse
    const errBodyStr = JSON.stringify(errBody)
    if (errBodyStr.includes('DATABASE_URL') || errBodyStr.includes('UPLOADTHING_TOKEN')) {
      throw new Error('SECURITY VIOLATION: Error response leaked server secrets!')
    }
    console.log(`✓ Error envelope confirmed clean — no secrets leaked`)

    console.log('\n=============================================================')
    console.log('🎉 ALL INTEGRATION & QA TEST PHASES PASSED WITH 100% SUCCESS!')
    console.log('=============================================================\n')
  } finally {
    server.close()
  }
}

runIntegrationTests().catch(err => {
  console.error('INTEGRATION TEST SUITE FAILED:', err)
  process.exit(1)
})
