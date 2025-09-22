import React, { useState, useEffect } from "react";
import { useAudio } from "../hooks/useAudio";
import "./ModalWindow.css";
import "./TabManager.css";

interface BookmarkUrl {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface BookmarkGroup {
  id: string;
  name: string;
  urls: BookmarkUrl[];
  color: string;
}

interface TabManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TabManager: React.FC<TabManagerProps> = ({
  isVisible,
  onClose,
}) => {
  const [groups, setGroups] = useState<BookmarkGroup[]>([]);
  const [currentView, setCurrentView] = useState<"groups" | "edit" | "urls">(
    "groups"
  );
  const [selectedGroup, setSelectedGroup] = useState<BookmarkGroup | null>(
    null
  );
  const [editingGroup, setEditingGroup] = useState<BookmarkGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newUrl, setNewUrl] = useState({ title: "", url: "" });

  const { playButtonClick, playButtonHover, playTodoAdd, playTodoComplete } =
    useAudio();

  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#96ceb4",
    "#ffeaa7",
    "#dda0dd",
    "#ffa07a",
  ];

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    const saved = localStorage.getItem("tabManagerGroups");
    if (saved) {
      setGroups(JSON.parse(saved));
    }
  };

  const saveGroups = (newGroups: BookmarkGroup[]) => {
    localStorage.setItem("tabManagerGroups", JSON.stringify(newGroups));
    setGroups(newGroups);
  };

  const createGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: BookmarkGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      urls: [],
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    const newGroups = [...groups, newGroup];
    saveGroups(newGroups);
    setNewGroupName("");
    setCurrentView("groups");
    playTodoAdd();
  };

  const deleteGroup = (groupId: string) => {
    const newGroups = groups.filter((g) => g.id !== groupId);
    saveGroups(newGroups);
    playTodoComplete();
  };

  const addUrl = () => {
    if (!editingGroup || !newUrl.title.trim() || !newUrl.url.trim()) return;

    const updatedUrl: BookmarkUrl = {
      id: Date.now().toString(),
      title: newUrl.title.trim(),
      url: newUrl.url.trim().startsWith("http")
        ? newUrl.url.trim()
        : `https://${newUrl.url.trim()}`,
    };

    const updatedGroup = {
      ...editingGroup,
      urls: [...editingGroup.urls, updatedUrl],
    };

    const newGroups = groups.map((g) =>
      g.id === editingGroup.id ? updatedGroup : g
    );
    saveGroups(newGroups);
    setEditingGroup(updatedGroup);
    setNewUrl({ title: "", url: "" });
    playTodoAdd();
  };

  const removeUrl = (urlId: string) => {
    if (!editingGroup) return;

    const updatedGroup = {
      ...editingGroup,
      urls: editingGroup.urls.filter((u) => u.id !== urlId),
    };

    const newGroups = groups.map((g) =>
      g.id === editingGroup.id ? updatedGroup : g
    );
    saveGroups(newGroups);
    setEditingGroup(updatedGroup);
    playTodoComplete();
  };

  // Note: Opening multiple tabs programmatically is blocked by browsers
  // Users need to click each URL individually

  const openSingleUrl = (url: string) => {
    window.open(url, "_blank");
    playButtonClick();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-window size-large">
        <div className="modal-header">
          <h2 className="modal-title">
            {currentView === "groups" && "📑 Tab Groups"}
            {currentView === "edit" && `✏️ Edit ${editingGroup?.name}`}
            {currentView === "urls" && `🚀 ${selectedGroup?.name}`}
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

        <div className="modal-content">
          {currentView === "groups" && (
            <div className="groups-view">
              <div className="create-group-section">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name..."
                  className="group-name-input"
                  maxLength={30}
                />
                <button
                  className="create-group-btn"
                  onClick={createGroup}
                  onMouseEnter={playButtonHover}
                >
                  Create Group
                </button>
              </div>

              <div className="groups-grid">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="group-card"
                    style={{ borderColor: group.color }}
                  >
                    <div className="group-header">
                      <h3 className="group-name">{group.name}</h3>
                      <div className="group-controls">
                        <button
                          className="group-control-btn edit-btn"
                          onClick={() => {
                            setEditingGroup(group);
                            setCurrentView("edit");
                          }}
                          onMouseEnter={playButtonHover}
                        >
                          ✏️
                        </button>
                        <button
                          className="group-control-btn delete-btn"
                          onClick={() => deleteGroup(group.id)}
                          onMouseEnter={playButtonHover}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="group-info">
                      <span className="url-count">
                        {group.urls.length} tabs
                      </span>
                    </div>
                    <div className="group-actions">
                      <button
                        className="group-action-btn view-btn"
                        onClick={() => {
                          setSelectedGroup(group);
                          setCurrentView("urls");
                        }}
                        onMouseEnter={playButtonHover}
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === "edit" && editingGroup && (
            <div className="edit-view">
              <div className="add-url-section">
                <input
                  type="text"
                  value={newUrl.title}
                  onChange={(e) =>
                    setNewUrl({ ...newUrl, title: e.target.value })
                  }
                  placeholder="Tab title..."
                  className="url-input"
                />
                <input
                  type="text"
                  value={newUrl.url}
                  onChange={(e) =>
                    setNewUrl({ ...newUrl, url: e.target.value })
                  }
                  placeholder="URL (example.com)..."
                  className="url-input"
                />
                <button
                  className="add-url-btn"
                  onClick={addUrl}
                  onMouseEnter={playButtonHover}
                >
                  Add Tab
                </button>
              </div>

              <div className="urls-list">
                {editingGroup.urls.map((url) => (
                  <div key={url.id} className="url-item">
                    <div className="url-info">
                      <span className="url-title">{url.title}</span>
                      <span className="url-address">{url.url}</span>
                    </div>
                    <button
                      className="remove-url-btn"
                      onClick={() => removeUrl(url.id)}
                      onMouseEnter={playButtonHover}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="back-btn"
                onClick={() => setCurrentView("groups")}
                onMouseEnter={playButtonHover}
              >
                ← Back to Groups
              </button>
            </div>
          )}

          {currentView === "urls" && selectedGroup && (
            <div className="urls-view">
              <div className="urls-header">
                <p className="url-count">
                  {selectedGroup.urls.length} bookmarks in "{selectedGroup.name}
                  "
                </p>
                <p className="url-info">
                  Click any bookmark to open it in a new tab
                </p>
              </div>

              <div className="urls-grid">
                {selectedGroup.urls.map((url) => (
                  <div key={url.id} className="url-card">
                    <div
                      className="url-card-content"
                      onClick={() => openSingleUrl(url.url)}
                    >
                      <span className="url-card-title">{url.title}</span>
                      <span className="url-card-domain">
                        {new URL(url.url).hostname}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="back-btn"
                onClick={() => setCurrentView("groups")}
                onMouseEnter={playButtonHover}
              >
                ← Back to Groups
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
