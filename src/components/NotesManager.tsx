import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAudio } from "../hooks/useAudio";
import "./ModalWindow.css";
import "./NotesManager.css";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  folder?: string;
}

interface Folder {
  id: string;
  name: string;
  parentFolder?: string;
  createdAt: string;
}

interface NotesManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const NotesManager: React.FC<NotesManagerProps> = ({
  isVisible,
  onClose,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(
    new Set()
  );
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [draggedNote, setDraggedNote] = useState<Note | null>(null);
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    type: "folder" | "unfiled";
    target?: string;
  } | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const { playButtonClick, playButtonHover, playTodoAdd, playTodoComplete } =
    useAudio();

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error("Failed to load notes:", error);
      }
    }

    const savedFolders = localStorage.getItem("folders");
    if (savedFolders) {
      try {
        setFolders(JSON.parse(savedFolders));
      } catch (error) {
        console.error("Failed to load folders:", error);
      }
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Save folders to localStorage whenever folders change
  useEffect(() => {
    localStorage.setItem("folders", JSON.stringify(folders));
  }, [folders]);

  // Auto-save selected note content
  useEffect(() => {
    if (selectedNote && notes.find((n) => n.id === selectedNote.id)) {
      const timer = setTimeout(() => {
        saveNote(selectedNote);
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(timer);
    }
  }, [selectedNote?.content, selectedNote?.title]);

  const saveNote = (note: Note) => {
    const updatedNotes = notes.find((n) => n.id === note.id)
      ? notes.map((n) =>
          n.id === note.id
            ? { ...note, updatedAt: new Date().toISOString() }
            : n
        )
      : [
          ...notes,
          {
            ...note,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

    setNotes(updatedNotes);
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter((n) => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
    playTodoComplete();
  };

  const createNewNote = (folder?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "# New Note\n\nStart writing your note here...",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folder: folder,
    };

    setNotes((prev) => [...prev, newNote]);
    setSelectedNote(newNote);
    playTodoAdd();
  };

  const createFolder = (parentFolder?: string) => {
    if (newFolderName.trim()) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        parentFolder: parentFolder,
        createdAt: new Date().toISOString(),
      };

      setFolders((prev) => [...prev, newFolder]);
      setNewFolderName("");
      setIsCreatingFolder(false);
      playButtonClick();
    }
  };

  const toggleFolder = (folderName: string) => {
    const newCollapsed = new Set(collapsedFolders);
    if (newCollapsed.has(folderName)) {
      newCollapsed.delete(folderName);
    } else {
      newCollapsed.add(folderName);
    }
    setCollapsedFolders(newCollapsed);
    playButtonClick();
  };

  // Drag and drop functions
  const handleNoteDragStart = (e: React.DragEvent, note: Note) => {
    setDraggedNote(note);
    e.dataTransfer.setData("text/plain", ""); // Required for drag to work
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFolderDragStart = (e: React.DragEvent, folderName: string) => {
    setDraggedFolder(folderName);
    e.dataTransfer.setData("text/plain", "");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleFolderDragEnter = (e: React.DragEvent, folderName: string) => {
    e.preventDefault();
    if (draggedNote || (draggedFolder && draggedFolder !== folderName)) {
      setDropTarget({ type: "folder", target: folderName });
    }
  };

  const handleUnfiledDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedNote) {
      setDropTarget({ type: "unfiled" });
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drop target if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetFolder?: string) => {
    e.preventDefault();

    if (draggedNote) {
      // Move note to folder or unfiled
      const updatedNote = { ...draggedNote, folder: targetFolder };
      setNotes((prev) =>
        prev.map((n) => (n.id === draggedNote.id ? updatedNote : n))
      );
      if (selectedNote?.id === draggedNote.id) {
        setSelectedNote(updatedNote);
      }
      playButtonClick();
    } else if (
      draggedFolder &&
      targetFolder &&
      draggedFolder !== targetFolder
    ) {
      // Move folder to become a subfolder of target
      setFolders((prev) =>
        prev.map((f) =>
          f.name === draggedFolder ? { ...f, parentFolder: targetFolder } : f
        )
      );
      playButtonClick();
    }

    setDraggedNote(null);
    setDraggedFolder(null);
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
    setDraggedFolder(null);
    setDropTarget(null);
  };

  // Smart editor functions
  const insertAtCursor = useCallback(
    (text: string, cursorOffset = 0) => {
      if (!editorRef.current || !selectedNote) return;

      const textarea = editorRef.current;
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const content = selectedNote.content;

      const beforeCursor = content.slice(0, start);
      const afterCursor = content.slice(end);

      const newContent = beforeCursor + text + afterCursor;
      setSelectedNote({ ...selectedNote, content: newContent });

      // Set cursor position after insert
      setTimeout(() => {
        const newCursorPos = start + text.length + cursorOffset;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    },
    [selectedNote]
  );

  const handleKeyboardShortcuts = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedNote) return;

      // Ctrl + Alt + number for headings
      if (e.ctrlKey && e.altKey && !e.shiftKey) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 6) {
          e.preventDefault();
          const hashes = "#".repeat(num);
          insertAtCursor(`${hashes} `, 0);
          return;
        }
      }

      // Ctrl + Shift + 8 for bullet list
      if (e.ctrlKey && e.shiftKey && e.key === "*") {
        e.preventDefault();
        insertAtCursor("- ", 0);
        return;
      }

      // Ctrl + L for checklist
      if (e.ctrlKey && !e.shiftKey && e.key === "l") {
        e.preventDefault();
        insertAtCursor("- [ ] ", 0);
        return;
      }

      // Ctrl + B for bold
      if (e.ctrlKey && !e.shiftKey && e.key === "b") {
        e.preventDefault();
        insertAtCursor("****", -2);
        return;
      }

      // Ctrl + I for italic
      if (e.ctrlKey && !e.shiftKey && e.key === "i") {
        e.preventDefault();
        insertAtCursor("**", -1);
        return;
      }
    },
    [selectedNote, insertAtCursor]
  );

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("keydown", handleKeyboardShortcuts);
      return () =>
        document.removeEventListener("keydown", handleKeyboardShortcuts);
    }
  }, [isVisible, handleKeyboardShortcuts]);

  // Get current line and cursor position within that line
  const getCurrentLineInfo = useCallback(() => {
    if (!selectedNote?.content || cursorPosition === undefined) {
      return { lineIndex: -1, lineStart: 0, lineEnd: 0, cursorInLine: 0 };
    }

    const content = selectedNote.content;
    const lines = content.split("\n");
    let currentPos = 0;

    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentPos + lines[i].length;

      if (cursorPosition >= currentPos && cursorPosition <= lineEnd) {
        return {
          lineIndex: i,
          lineStart: currentPos,
          lineEnd: lineEnd,
          cursorInLine: cursorPosition - currentPos,
        };
      }

      currentPos = lineEnd + 1; // +1 for the newline character
    }

    return { lineIndex: -1, lineStart: 0, lineEnd: 0, cursorInLine: 0 };
  }, [selectedNote?.content, cursorPosition]);

  // Check if cursor is in a position where we should show raw text
  const shouldShowRawText = useCallback(() => {
    if (!selectedNote?.content || cursorPosition === undefined) return false;

    const content = selectedNote.content;
    const pos = cursorPosition;

    // Get the current line
    const lineInfo = getCurrentLineInfo();
    const lines = content.split("\n");
    const currentLine = lines[lineInfo.lineIndex] || "";

    // Check character immediately before and after cursor
    const charBefore = content[pos - 1];
    const charAfter = content[pos];

    // If cursor is next to any non-whitespace character, show raw text
    const touchingBefore = charBefore && charBefore.trim() !== "";
    const touchingAfter = charAfter && charAfter.trim() !== "";

    // Special case: if current line starts with markdown syntax and cursor is on that line
    // (even if after a space), show raw text until user adds actual content
    const markdownStartPattern = /^(#{1,6}\s|\*\*|\*\s|-\s\[\s*\]|-\s|`)/;
    const lineStartsWithMarkdown = markdownStartPattern.test(currentLine);
    const onMarkdownLine = lineInfo.lineIndex >= 0 && lineStartsWithMarkdown;

    // If on a markdown line and the line only contains markdown syntax + spaces, show raw
    const markdownOnlyPattern =
      /^(#{1,6}\s*|\*\*\s*|\*\s*|-\s\[\s*\]\s*|-\s*|`\s*)$/;
    const onlyMarkdownAndSpaces = markdownOnlyPattern.test(currentLine);

    return (
      touchingBefore ||
      touchingAfter ||
      (onMarkdownLine && onlyMarkdownAndSpaces)
    );
  }, [selectedNote?.content, cursorPosition, getCurrentLineInfo]);

  // Render markdown but show raw text when appropriate
  const renderMarkdownWithCursor = useCallback(() => {
    if (!selectedNote?.content) return "";

    const content = selectedNote.content;
    const lines = content.split("\n");
    const lineInfo = getCurrentLineInfo();
    const showRaw = shouldShowRawText();

    return lines
      .map((line, index) => {
        // If cursor is on this line AND we should show raw text, show raw text
        if (index === lineInfo.lineIndex && showRaw) {
          return line;
        }

        // Otherwise, render the markdown for this line (keeping same line height)
        let renderedLine = line
          .replace(/^# (.*$)/, '<span class="h1-style">$1</span>')
          .replace(/^## (.*$)/, '<span class="h2-style">$1</span>')
          .replace(/^### (.*$)/, '<span class="h3-style">$1</span>')
          .replace(
            /^- \[ \] (.*)$/,
            '<span class="checklist-style">☐ $1</span>'
          )
          .replace(
            /^- \[x\] (.*)$/,
            '<span class="checklist-checked-style">☑ $1</span>'
          )
          .replace(/^- (.*)$/, '<span class="list-style">• $1</span>')
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/`(.*?)`/g, "<code>$1</code>");

        return renderedLine;
      })
      .join("\n");
  }, [selectedNote?.content, getCurrentLineInfo, shouldShowRawText]);

  // Handle clicks on the editor container for checkbox interaction
  const handleEditorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!selectedNote) return;

      const textarea = editorRef.current;
      if (!textarea) return;

      // Calculate click position relative to textarea
      const rect = textarea.getBoundingClientRect();
      const x = e.clientX - rect.left - 20; // Subtract padding
      const y = e.clientY - rect.top - 20; // Subtract padding

      // Calculate line from click position
      const lineHeight = 1.8 * 14; // line-height * font-size
      const clickedLine = Math.floor(y / lineHeight);

      const lines = selectedNote.content.split("\n");
      if (clickedLine >= 0 && clickedLine < lines.length) {
        const line = lines[clickedLine];

        // Check if this is a checkbox line and click is near checkbox area (first 60px)
        if (/^\s*-\s*\[[ x]\]/.test(line) && x >= 0 && x <= 60) {
          const isChecked = /^\s*-\s*\[x\]/.test(line);
          lines[clickedLine] = isChecked
            ? line.replace(/\[x\]/, "[ ]")
            : line.replace(/\[ \]/, "[x]");

          const newContent = lines.join("\n");
          setSelectedNote({ ...selectedNote, content: newContent });
          playTodoComplete();
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    },
    [selectedNote, playTodoComplete]
  );

  // Memoized rendered HTML that updates when content or cursor changes
  const renderedHTML = useMemo(() => {
    return selectedNote ? renderMarkdownWithCursor() : "";
  }, [selectedNote?.content, cursorPosition, renderMarkdownWithCursor]);

  // Get organized folder structure - create hierarchy
  const getFolderHierarchy = () => {
    // Get all folders from state plus any folder names from notes that aren't in folders state
    const noteFolders = Array.from(
      new Set(notes.map((n) => n.folder).filter(Boolean))
    ) as string[];
    const existingFolderNames = new Set(folders.map((f) => f.name));

    // Create folders for any note folders that don't exist yet
    const missingFolders = noteFolders.filter(
      (name) => !existingFolderNames.has(name)
    );
    const allFolders = [...folders];

    missingFolders.forEach((name) => {
      allFolders.push({
        id: Date.now().toString() + Math.random(),
        name,
        createdAt: new Date().toISOString(),
      });
    });

    return allFolders;
  };

  const allFolders = getFolderHierarchy();

  // Organize folders into hierarchy (top-level folders first, then subfolders)
  const getTopLevelFolders = () => {
    return allFolders.filter((folder) => !folder.parentFolder);
  };

  const getSubfolders = (parentFolderName: string) => {
    return allFolders.filter(
      (folder) => folder.parentFolder === parentFolderName
    );
  };

  // Filter notes based on search
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-window size-large">
        <div className="modal-header">
          <h2 className="modal-title">
            📝 Notes Manager
            {selectedNote && ` - ${selectedNote.title}`}
          </h2>
          <div className="modal-controls">
            <button
              className="modal-close-btn"
              onClick={onClose}
              onMouseEnter={playButtonHover}
            >
              ×
            </button>
          </div>
        </div>

        <div className="modal-content notes-layout">
          {/* Left Sidebar */}
          <div className="notes-sidebar">
            <div className="sidebar-header">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button
                className="new-note-btn"
                onClick={() => createNewNote()}
                onMouseEnter={playButtonHover}
                title="New Note"
              >
                ➕
              </button>
            </div>

            <div className="folder-section">
              {/* Unfiled Notes */}
              {notes.filter((n) => !n.folder && filteredNotes.includes(n))
                .length > 0 && (
                <div className="folder-group">
                  <div
                    className={`folder-header unfiled ${
                      dropTarget?.type === "unfiled" ? "drag-over" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragEnter={handleUnfiledDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e)}
                  >
                    <span className="folder-icon">📄</span>
                    <span className="folder-name">Unfiled Notes</span>
                  </div>
                  <div className="folder-notes">
                    {notes
                      .filter((n) => !n.folder && filteredNotes.includes(n))
                      .map((note) => (
                        <div
                          key={note.id}
                          className={`note-item ${
                            selectedNote?.id === note.id ? "selected" : ""
                          }`}
                          onClick={() => setSelectedNote(note)}
                          draggable
                          onDragStart={(e) => handleNoteDragStart(e, note)}
                          onDragEnd={handleDragEnd}
                        >
                          <div className="note-item-title">{note.title}</div>
                          <div className="note-item-date">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </div>
                          <button
                            className="note-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            onMouseEnter={playButtonHover}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Folder Groups - Hierarchical Display */}
              {getTopLevelFolders().map((folder) => {
                const renderFolder = (
                  currentFolder: Folder,
                  level: number = 0
                ) => {
                  const folderNotes = notes.filter(
                    (n) =>
                      n.folder === currentFolder.name &&
                      filteredNotes.includes(n)
                  );
                  const isCollapsed = collapsedFolders.has(currentFolder.name);
                  const subfolders = getSubfolders(currentFolder.name);
                  const indentClass =
                    level > 0 ? `folder-level-${Math.min(level, 3)}` : "";

                  return (
                    <div
                      key={currentFolder.id}
                      className={`folder-group ${indentClass}`}
                    >
                      <div
                        className={`folder-header clickable ${
                          dropTarget?.type === "folder" &&
                          dropTarget.target === currentFolder.name
                            ? "drag-over"
                            : ""
                        }`}
                        onClick={() => toggleFolder(currentFolder.name)}
                        draggable
                        onDragStart={(e) =>
                          handleFolderDragStart(e, currentFolder.name)
                        }
                        onDragOver={handleDragOver}
                        onDragEnter={(e) =>
                          handleFolderDragEnter(e, currentFolder.name)
                        }
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, currentFolder.name)}
                        onDragEnd={handleDragEnd}
                      >
                        {level > 0 && (
                          <span className="folder-hierarchy">
                            {"›".repeat(level)}
                          </span>
                        )}
                        <span className="folder-icon">
                          {isCollapsed ? "📁" : "📂"}
                        </span>
                        <span className="folder-name">
                          {currentFolder.name}
                        </span>
                        <span className="folder-count">
                          ({folderNotes.length + subfolders.length})
                        </span>
                        <button
                          className="folder-add-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            createNewNote(currentFolder.name);
                          }}
                          onMouseEnter={playButtonHover}
                          title="Add Note to Folder"
                        >
                          ➕
                        </button>
                      </div>

                      {!isCollapsed && (
                        <div className="folder-content">
                          {/* Render subfolders first */}
                          {subfolders.map((subfolder) =>
                            renderFolder(subfolder, level + 1)
                          )}

                          {/* Then render notes */}
                          <div className="folder-notes">
                            {folderNotes.map((note) => (
                              <div
                                key={note.id}
                                className={`note-item ${
                                  selectedNote?.id === note.id ? "selected" : ""
                                }`}
                                onClick={() => setSelectedNote(note)}
                                draggable
                                onDragStart={(e) =>
                                  handleNoteDragStart(e, note)
                                }
                                onDragEnd={handleDragEnd}
                              >
                                <div className="note-item-title">
                                  {note.title}
                                </div>
                                <div className="note-item-date">
                                  {new Date(
                                    note.updatedAt
                                  ).toLocaleDateString()}
                                </div>
                                <button
                                  className="note-delete-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNote(note.id);
                                  }}
                                  onMouseEnter={playButtonHover}
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                };

                return renderFolder(folder);
              })}

              {/* New Folder Section */}
              <div className="new-folder-section">
                {!isCreatingFolder ? (
                  <button
                    className="new-folder-btn"
                    onClick={() => setIsCreatingFolder(true)}
                    onMouseEnter={playButtonHover}
                  >
                    📁+ New Folder
                  </button>
                ) : (
                  <div className="new-folder-input">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          createFolder();
                        } else if (e.key === "Escape") {
                          setIsCreatingFolder(false);
                          setNewFolderName("");
                        }
                      }}
                      placeholder="Folder name..."
                      autoFocus
                    />
                    <button
                      onClick={() => createFolder()}
                      disabled={!newFolderName.trim()}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingFolder(false);
                        setNewFolderName("");
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="notes-content">
            {!selectedNote ? (
              <div className="welcome-message">
                <h3>📝 Welcome to Notes</h3>
                <p>
                  Select a note from the sidebar or create a new one to get
                  started!
                </p>
                <div className="welcome-features">
                  <ul>
                    <li>📁 Organize notes in folders</li>
                    <li>🔍 Search through all your notes</li>
                    <li>📝 Live markdown preview</li>
                    <li>💾 Auto-save as you type</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="note-editor-container">
                <div className="note-editor-header">
                  <input
                    type="text"
                    value={selectedNote.title}
                    onChange={(e) =>
                      setSelectedNote({
                        ...selectedNote,
                        title: e.target.value,
                      })
                    }
                    className="note-title-input"
                    placeholder="Note title..."
                  />
                  <input
                    type="text"
                    value={selectedNote.folder || ""}
                    onChange={(e) =>
                      setSelectedNote({
                        ...selectedNote,
                        folder: e.target.value || undefined,
                      })
                    }
                    className="note-folder-input"
                    placeholder="Folder (optional)..."
                  />
                </div>

                <div
                  className="unified-editor-container"
                  onClick={handleEditorClick}
                >
                  <textarea
                    ref={editorRef}
                    className="unified-markdown-editor"
                    value={selectedNote.content}
                    onChange={(e) =>
                      setSelectedNote({
                        ...selectedNote,
                        content: e.target.value,
                      })
                    }
                    onKeyUp={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      setCursorPosition(target.selectionStart || 0);
                    }}
                    onMouseUp={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      setCursorPosition(target.selectionStart || 0);
                    }}
                    onFocus={() => {
                      if (editorRef.current) {
                        setCursorPosition(
                          editorRef.current.selectionStart || 0
                        );
                      }
                    }}
                    placeholder="Start writing your note..."
                    spellCheck={false}
                  />
                  <div
                    className="markdown-overlay"
                    dangerouslySetInnerHTML={{
                      __html: renderedHTML,
                    }}
                  />
                </div>

                <div className="editor-help-section">
                  <details className="help-section">
                    <summary>⌨️ Keyboard Shortcuts</summary>
                    <div className="shortcuts-grid">
                      <span>
                        <kbd>Ctrl + Alt + 1-6</kbd>
                      </span>
                      <span>Headings H1-H6</span>
                      <span>
                        <kbd>Ctrl + Shift + 8</kbd>
                      </span>
                      <span>Bullet list</span>
                      <span>
                        <kbd>Ctrl + L</kbd>
                      </span>
                      <span>Checklist</span>
                      <span>
                        <kbd>Ctrl + B</kbd>
                      </span>
                      <span>Bold text</span>
                      <span>
                        <kbd>Ctrl + I</kbd>
                      </span>
                      <span>Italic text</span>
                    </div>
                  </details>

                  <details className="help-section">
                    <summary>📖 Markdown Syntax</summary>
                    <div className="syntax-grid">
                      <span>
                        <code># H1</code>
                      </span>
                      <span>
                        <code>## H2</code>
                      </span>
                      <span>
                        <code>**bold**</code>
                      </span>
                      <span>
                        <code>*italic*</code>
                      </span>
                      <span>
                        <code>- list</code>
                      </span>
                      <span>
                        <code>`code`</code>
                      </span>
                      <span>
                        <code>- [ ] task</code>
                      </span>
                      <span>
                        <code>- [x] done</code>
                      </span>
                    </div>
                  </details>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
