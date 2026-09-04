import { type FormEvent, useMemo, useState } from 'react'
import AppBottomNavigation from '../ui/AppBottomNavigation'
import { type AppNote, useAppNotes } from '../ui/notesStorage'
import './home.css'

const formatNoteDate = (isoDate: string) => (
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoDate))
)

const getNormalizedSearchText = (value: string) => value.trim().toLowerCase()

export default function NotesPage() {
  const { deleteNote, notes, saveNote } = useAppNotes()
  const [editingNoteId, setEditingNoteId] = useState<string | undefined>()
  const [noteTitle, setNoteTitle] = useState('')
  const [noteBody, setNoteBody] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNotes = useMemo(() => {
    const normalizedQuery = getNormalizedSearchText(searchQuery)

    if (normalizedQuery.length === 0) {
      return notes
    }

    return notes.filter((note) => (
      note.title.toLowerCase().includes(normalizedQuery) ||
      note.body.toLowerCase().includes(normalizedQuery)
    ))
  }, [notes, searchQuery])

  const hasDraftContent = (
    noteTitle.trim().length > 0 ||
    noteBody.trim().length > 0
  )

  const resetEditor = () => {
    setEditingNoteId(undefined)
    setNoteTitle('')
    setNoteBody('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    saveNote({ body: noteBody, title: noteTitle }, editingNoteId)
    resetEditor()
  }

  const handleEdit = (note: AppNote) => {
    setEditingNoteId(note.id)
    setNoteTitle(note.title)
    setNoteBody(note.body)
  }

  const handleDelete = (noteId: string) => {
    deleteNote(noteId)

    if (editingNoteId === noteId) {
      resetEditor()
    }
  }

  return (
    <main className="app-home-page" aria-label="VetTools">
      <div className="app-home-device" aria-label="Заметки VetTools">
        <div className="app-home-device__notch" aria-hidden="true" />

        <section className="app-home-screen">
          <header className="app-home-screen__header">
            <div className="app-home-screen__title-group">
              <p className="app-home-screen__app-name">VetTools</p>
              <h1 className="app-home-screen__title">Заметки</h1>
            </div>

            <img
              className="app-home-screen__app-icon"
              src="/app-icons/notes.svg"
              alt=""
              aria-hidden="true"
            />
          </header>

          <section className="app-home-link-list app-notes-page" aria-label="Список заметок">
            <form className="app-notes-editor" onSubmit={handleSubmit}>
              <label className="app-notes-field">
                <span className="app-notes-field__label">Заголовок</span>
                <input
                  className="app-notes-field__control"
                  onChange={(event) => setNoteTitle(event.target.value)}
                  type="text"
                  value={noteTitle}
                />
              </label>

              <label className="app-notes-field">
                <span className="app-notes-field__label">Текст заметки</span>
                <textarea
                  className="app-notes-field__control app-notes-field__control--textarea"
                  onChange={(event) => setNoteBody(event.target.value)}
                  value={noteBody}
                />
              </label>

              <div className="app-notes-editor__actions">
                <button
                  className="app-notes-primary-button"
                  disabled={!hasDraftContent}
                  type="submit"
                >
                  {editingNoteId === undefined ? 'Добавить заметку' : 'Сохранить'}
                </button>

                {editingNoteId !== undefined ? (
                  <button
                    className="app-notes-secondary-button"
                    onClick={resetEditor}
                    type="button"
                  >
                    Отмена
                  </button>
                ) : null}
              </div>
            </form>

            <label className="app-notes-field app-notes-search">
              <span className="app-notes-field__label">Поиск</span>
              <input
                className="app-notes-field__control"
                onChange={(event) => setSearchQuery(event.target.value)}
                type="search"
                value={searchQuery}
              />
            </label>

            {filteredNotes.length > 0 ? (
              <section className="app-notes-list" aria-label="Сохраненные заметки">
                {filteredNotes.map((note) => (
                  <article className="app-notes-card" key={note.id}>
                    <div className="app-notes-card__header">
                      <h2 className="app-notes-card__title">{note.title}</h2>
                      <time
                        className="app-notes-card__date"
                        dateTime={note.updatedAt}
                      >
                        {formatNoteDate(note.updatedAt)}
                      </time>
                    </div>

                    <p className="app-notes-card__body">{note.body}</p>

                    <div className="app-notes-card__actions">
                      <button
                        aria-label={`Изменить заметку: ${note.title}`}
                        className="app-notes-secondary-button"
                        onClick={() => handleEdit(note)}
                        type="button"
                      >
                        Изменить
                      </button>
                      <button
                        aria-label={`Удалить заметку: ${note.title}`}
                        className="app-notes-danger-button"
                        onClick={() => handleDelete(note.id)}
                        type="button"
                      >
                        Удалить
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <span className="app-home-empty-state">
                Заметки появятся здесь.
              </span>
            )}
          </section>

          <AppBottomNavigation />
        </section>

        <div className="app-home-device__indicator" aria-hidden="true" />
      </div>
    </main>
  )
}
