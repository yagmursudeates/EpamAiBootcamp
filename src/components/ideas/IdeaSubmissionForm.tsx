'use client';

import { useState } from 'react';

const CATEGORIES = [
  'Technical',
  'Process Improvement',
  'Client Solutions',
  'Cost Reduction',
  'Employee Experience',
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function IdeaSubmissionForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descError, setDescError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFileError(null);
    if (selected && selected.size > MAX_FILE_SIZE) {
      setFileError('File must be under 10 MB');
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTitleError(null);
    setDescError(null);

    let valid = true;
    if (!title.trim()) {
      setTitleError('Title is required');
      valid = false;
    }
    if (!description.trim()) {
      setDescError('Description is required');
      valid = false;
    }
    if (!valid) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    if (file) formData.append('attachment', file);

    await fetch('/api/ideas', { method: 'POST', body: formData });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {titleError && <p>{titleError}</p>}
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {descError && <p>{descError}</p>}
      </div>
      <div>
        <label htmlFor="category">Category</label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="attachment">Attach a file</label>
        <input id="attachment" type="file" onChange={handleFileChange} />
        {fileError && <p>{fileError}</p>}
      </div>
      <button type="submit">Submit idea</button>
    </form>
  );
}
