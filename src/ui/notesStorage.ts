import { useCallback, useEffect, useMemo, useState } from 'react'

type AppNote = {
  body: string
  createdAt: string
  id: string
  title: string
  updatedAt: string
}

type AppNoteDraft = {
  body: string
  title: string
}

const appNotesStorageKey = 'vettools-notes'
const appNotesChangeEvent = 'vettools-notes-change'
let fallbackAppNotes: AppNote[] = []

const getCanUseWindow = () => typeof window !== 'undefined'

const getStorage = () => {
  if (!getCanUseWindow()) {
    return undefined
  }

  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

const normalizeNote = (note: unknown): AppNote | undefined => {
  if (typeof note !== 'object' || note === null) {
    return undefined
  }

  const candidate = note as Partial<AppNote>

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.body !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.updatedAt !== 'string'
  ) {
    return undefined
  }

  return {
    body: candidate.body,
    createdAt: candidate.createdAt,
    id: candidate.id,
    title: candidate.title,
    updatedAt: candidate.updatedAt,
  }
}

const normalizeNotes = (notes: unknown) => {
  if (!Array.isArray(notes)) {
    return []
  }

  return notes
    .map(normalizeNote)
    .filter((note): note is AppNote => note !== undefined)
}

const readAppNotes = () => {
  const storage = getStorage()

  if (storage === undefined) {
    return fallbackAppNotes
  }

  try {
    const storedNotes = storage.getItem(appNotesStorageKey)

    if (storedNotes === null) {
      return []
    }

    const notes = normalizeNotes(JSON.parse(storedNotes))

    fallbackAppNotes = notes

    return notes
  } catch {
    return fallbackAppNotes
  }
}

const emitAppNotesChange = () => {
  if (!getCanUseWindow()) {
    return
  }

  window.dispatchEvent(new Event(appNotesChangeEvent))
}

const writeAppNotes = (notes: readonly AppNote[]) => {
  fallbackAppNotes = [...notes]

  const storage = getStorage()

  if (storage !== undefined) {
    try {
      storage.setItem(appNotesStorageKey, JSON.stringify(notes))
    } catch {
      // Storage can be unavailable in private or restricted browser modes.
    }
  }

  emitAppNotesChange()
}

const createNoteId = () => (
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
)

const saveAppNote = (draft: AppNoteDraft, noteId?: string) => {
  const notes = readAppNotes()
  const now = new Date().toISOString()
  const title = draft.title.trim()
  const body = draft.body.trim()

  if (title.length === 0 && body.length === 0) {
    return
  }

  const normalizedDraft = {
    body,
    title: title.length > 0 ? title : 'Заметка',
  }

  if (noteId !== undefined) {
    writeAppNotes(notes.map((note) => (
      note.id === noteId
        ? {
          ...note,
          ...normalizedDraft,
          updatedAt: now,
        }
        : note
    )))
    return
  }

  writeAppNotes([
    {
      ...normalizedDraft,
      createdAt: now,
      id: createNoteId(),
      updatedAt: now,
    },
    ...notes,
  ])
}

const deleteAppNote = (noteId: string) => {
  writeAppNotes(readAppNotes().filter((note) => note.id !== noteId))
}

const clearAppNotes = () => {
  fallbackAppNotes = []

  const storage = getStorage()

  if (storage !== undefined) {
    try {
      storage.removeItem(appNotesStorageKey)
    } catch {
      // Storage can be unavailable in private or restricted browser modes.
    }
  }

  emitAppNotesChange()
}

function useAppNotes() {
  const [notes, setNotes] = useState(readAppNotes)

  useEffect(() => {
    if (!getCanUseWindow()) {
      return undefined
    }

    const handleNotesChange = () => {
      setNotes(readAppNotes())
    }

    window.addEventListener(appNotesChangeEvent, handleNotesChange)
    window.addEventListener('storage', handleNotesChange)

    return () => {
      window.removeEventListener(appNotesChangeEvent, handleNotesChange)
      window.removeEventListener('storage', handleNotesChange)
    }
  }, [])

  const sortedNotes = useMemo(() => (
    [...notes].sort((firstNote, secondNote) => (
      secondNote.updatedAt.localeCompare(firstNote.updatedAt)
    ))
  ), [notes])

  const saveNote = useCallback((draft: AppNoteDraft, noteId?: string) => {
    saveAppNote(draft, noteId)
  }, [])

  const deleteNote = useCallback((noteId: string) => {
    deleteAppNote(noteId)
  }, [])

  return {
    deleteNote,
    notes: sortedNotes,
    saveNote,
  }
}

export {
  appNotesStorageKey,
  clearAppNotes,
  readAppNotes,
  type AppNote,
  useAppNotes,
}
