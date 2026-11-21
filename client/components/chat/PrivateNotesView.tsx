import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { getNotes } from '../../lib/sqliteStore';

const PrivateNotesView = () => {
  const { activeNoteId, createNote, updateNote, deleteNote } = useChatStore();
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (!activeNoteId) return;
    getNotes().then((notes) => {
      const note = notes.find((n) => n.id === activeNoteId);
      if (note) setNoteContent(note.content);
    });
  }, [activeNoteId]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
    if (activeNoteId) void updateNote(activeNoteId, { content: e.target.value });
  };

  return (
    <div className='private-notes-view'>
      <textarea
        value={noteContent}
        onChange={handleContentChange}
        placeholder='Start typing your private note...'
      />
      <button onClick={() => void createNote('New Note', '')}>New Note</button>
      <button onClick={() => { if (activeNoteId) void deleteNote(activeNoteId); }}>Delete Note</button>
    </div>
  );
};

export default PrivateNotesView;
