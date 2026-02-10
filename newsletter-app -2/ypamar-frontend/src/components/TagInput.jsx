import { useState } from 'react'

export default function TagInput({ tags = [], onChange, placeholder = 'Aggiungi tag e premi Invio...' }) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const tag = input.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput('')
  }

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(t => t !== tagToRemove))
  }

  return (
    <div
      className="tag-input-container"
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      {tags.map(tag => (
        <span key={tag} className="tag-chip">
          {tag}
          <button
            className="tag-remove"
            onClick={() => removeTag(tag)}
            aria-label={`Rimuovi tag ${tag}`}
            type="button"
          >
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        aria-label="Aggiungi tag"
      />
    </div>
  )
}

export function TagsDisplay({ tagsJson }) {
  try {
    const tags = JSON.parse(tagsJson || '[]')
    if (!tags.length) return null
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 4 }}>
        {tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
      </div>
    )
  } catch {
    return null
  }
}
