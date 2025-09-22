import React, { useState } from "react";
import { SecurityManager } from "../utils/SecurityManager";
import { useTodoContext } from "../contexts/TodoContext";
import { useAudio } from "../hooks/useAudio";
import "./ModalWindow.css";
import "./SecureDataManager.css";

interface SecureDataManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const SecureDataManager: React.FC<SecureDataManagerProps> = ({
  isVisible,
  onClose,
}) => {
  const { todos, importTodos } = useTodoContext();
  const { playButtonClick, playButtonHover, playTodoAdd } = useAudio();

  const [mode, setMode] = useState<"menu" | "export" | "import">("menu");
  const [otp, setOtp] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  if (!isVisible) return null;

  const showMessage = (type: "success" | "error" | "info", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = async () => {
    if (!SecurityManager.validateOTP(otp)) {
      showMessage("error", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsProcessing(true);
    try {
      // Gather ALL app data for comprehensive export
      const appData = {
        // Core application data
        todos,
        tabGroups: JSON.parse(localStorage.getItem("bookmarkGroups") || "[]"),
        tabManagerGroups: JSON.parse(
          localStorage.getItem("tabManagerGroups") || "[]"
        ),
        notes: JSON.parse(localStorage.getItem("notes") || "[]"),
        folders: JSON.parse(localStorage.getItem("folders") || "[]"),

        // User customizations
        taskbarIconOrder: JSON.parse(
          localStorage.getItem("taskbarIconOrder") || "[]"
        ),

        // Application settings
        settings: {
          hasSeenTutorial: localStorage.getItem("hasSeenTutorial"),
          // Audio settings if they exist
          isBgmMuted: localStorage.getItem("isBgmMuted"),
          isSfxMuted: localStorage.getItem("isSfxMuted"),
          // Theme settings if they exist
          selectedTheme: localStorage.getItem("selectedTheme"),
          // Any other preferences
          userPreferences: JSON.parse(
            localStorage.getItem("userPreferences") || "{}"
          ),
        },

        // Metadata
        exportVersion: "3.0", // Updated version for comprehensive export
        exportDate: new Date().toISOString(),
        dataTypes: [
          "todos",
          "bookmarks",
          "tabs",
          "notes",
          "folders",
          "taskbar",
          "settings",
        ],
      };

      const secureExport = await SecurityManager.encryptData(appData, otp);
      const exportString = JSON.stringify(secureExport, null, 2);

      // Auto-download the file
      const blob = new Blob([exportString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = SecurityManager.generateSecureFilename();
      a.click();
      URL.revokeObjectURL(url);

      playTodoAdd();
      showMessage(
        "success",
        `Comprehensive export created! Includes all your data: todos, bookmarks, notes, folders, taskbar layout & settings. Valid for 5 minutes. Keep your OTP (${otp}) safe.`
      );
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Export failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      showMessage("error", "Please select a file to import");
      return;
    }

    if (!SecurityManager.validateOTP(otp)) {
      showMessage("error", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsProcessing(true);
    try {
      const fileContent = await importFile.text();
      const secureData = JSON.parse(fileContent);

      if (!SecurityManager.isValidSecureExport(secureData)) {
        throw new Error("Invalid secure export file format");
      }

      const remainingTime = SecurityManager.getRemainingTime(secureData);
      if (remainingTime <= 0) {
        throw new Error("This export has expired. Please create a new one.");
      }

      const importedData = await SecurityManager.decryptData(secureData, otp);
      let importCounts = {
        todos: 0,
        bookmarks: 0,
        tabs: 0,
        notes: 0,
        folders: 0,
        settings: 0,
      };

      // Import todos
      if (importedData.todos && Array.isArray(importedData.todos)) {
        await importTodos(importedData.todos);
        importCounts.todos = importedData.todos.length;
      }

      // Import bookmark groups
      if (importedData.tabGroups && Array.isArray(importedData.tabGroups)) {
        localStorage.setItem(
          "bookmarkGroups",
          JSON.stringify(importedData.tabGroups)
        );
        importCounts.bookmarks = importedData.tabGroups.length;
      }

      // Import tab manager groups
      if (
        importedData.tabManagerGroups &&
        Array.isArray(importedData.tabManagerGroups)
      ) {
        localStorage.setItem(
          "tabManagerGroups",
          JSON.stringify(importedData.tabManagerGroups)
        );
        importCounts.tabs = importedData.tabManagerGroups.length;
      }

      // Import notes
      if (importedData.notes && Array.isArray(importedData.notes)) {
        localStorage.setItem("notes", JSON.stringify(importedData.notes));
        importCounts.notes = importedData.notes.length;
      }

      // Import folders
      if (importedData.folders && Array.isArray(importedData.folders)) {
        localStorage.setItem("folders", JSON.stringify(importedData.folders));
        importCounts.folders = importedData.folders.length;
      }

      // Import taskbar customization
      if (
        importedData.taskbarIconOrder &&
        Array.isArray(importedData.taskbarIconOrder)
      ) {
        localStorage.setItem(
          "taskbarIconOrder",
          JSON.stringify(importedData.taskbarIconOrder)
        );
      }

      // Import comprehensive settings
      if (importedData.settings) {
        let settingsCount = 0;

        if (importedData.settings.hasSeenTutorial) {
          localStorage.setItem(
            "hasSeenTutorial",
            importedData.settings.hasSeenTutorial
          );
          settingsCount++;
        }

        if (importedData.settings.isBgmMuted) {
          localStorage.setItem("isBgmMuted", importedData.settings.isBgmMuted);
          settingsCount++;
        }

        if (importedData.settings.isSfxMuted) {
          localStorage.setItem("isSfxMuted", importedData.settings.isSfxMuted);
          settingsCount++;
        }

        if (importedData.settings.selectedTheme) {
          localStorage.setItem(
            "selectedTheme",
            importedData.settings.selectedTheme
          );
          settingsCount++;
        }

        if (
          importedData.settings.userPreferences &&
          typeof importedData.settings.userPreferences === "object"
        ) {
          localStorage.setItem(
            "userPreferences",
            JSON.stringify(importedData.settings.userPreferences)
          );
          settingsCount++;
        }

        importCounts.settings = settingsCount;
      }

      playTodoAdd();

      // Create comprehensive success message
      const successParts = [];
      if (importCounts.todos > 0)
        successParts.push(`${importCounts.todos} todos`);
      if (importCounts.bookmarks > 0)
        successParts.push(`${importCounts.bookmarks} bookmark groups`);
      if (importCounts.tabs > 0)
        successParts.push(`${importCounts.tabs} tab groups`);
      if (importCounts.notes > 0)
        successParts.push(`${importCounts.notes} notes`);
      if (importCounts.folders > 0)
        successParts.push(`${importCounts.folders} folders`);
      if (importCounts.settings > 0)
        successParts.push(`${importCounts.settings} settings`);

      const successMessage =
        successParts.length > 0
          ? `Successfully imported: ${successParts.join(
              ", "
            )}! Your taskbar customization and all preferences have been restored.`
          : "Import completed! No data found to import.";

      showMessage("success", successMessage);
      setMode("menu");
    } catch (error) {
      showMessage(
        "error",
        error instanceof Error ? error.message : "Import failed"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const generateNewOTP = () => {
    const newOTP = SecurityManager.generateOTP();
    setGeneratedOTP(newOTP);
    setOtp(newOTP);
    playButtonClick();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
      playButtonClick();
    }
  };

  const resetForm = () => {
    setMode("menu");
    setOtp("");
    setGeneratedOTP("");
    setImportFile(null);
    setMessage(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-window size-medium">
        <div className="modal-header">
          <h2 className="modal-title">🔒 Secure Data Manager</h2>
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
          {message && (
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          {mode === "menu" && (
            <div className="secure-menu">
              <div className="security-info">
                <h3>🛡️ Security Features</h3>
                <ul>
                  <li>• AES-256 encryption with your OTP</li>
                  <li>• 5-minute expiry for maximum security</li>
                  <li>• Data integrity verification</li>
                  <li>• No cloud storage - your data stays local</li>
                </ul>

                <h3>📦 Comprehensive Export Includes</h3>
                <ul>
                  <li>• All todos and tasks</li>
                  <li>• Bookmark groups and URLs</li>
                  <li>• Tab manager groups</li>
                  <li>• Notes and documents</li>
                  <li>• Folder organization</li>
                  <li>• Taskbar icon arrangement</li>
                  <li>• Audio & theme preferences</li>
                  <li>• Tutorial progress & settings</li>
                </ul>
              </div>

              <div className="action-buttons">
                <button
                  className="action-btn export-btn"
                  onClick={() => setMode("export")}
                  onMouseEnter={playButtonHover}
                >
                  📤 Export Todos
                </button>
                <button
                  className="action-btn import-btn"
                  onClick={() => setMode("import")}
                  onMouseEnter={playButtonHover}
                >
                  📥 Import Todos
                </button>
              </div>
            </div>
          )}

          {mode === "export" && (
            <div className="export-section">
              <h3>📤 Secure Export</h3>
              <p>
                Your todos will be encrypted with a 6-digit OTP and expire in 5
                minutes.
              </p>

              <div className="otp-section">
                <div className="otp-input-group">
                  <label>Enter 6-digit OTP:</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    className="otp-input"
                    maxLength={6}
                  />
                  <button
                    className="generate-otp-btn"
                    onClick={generateNewOTP}
                    onMouseEnter={playButtonHover}
                  >
                    🎲 Generate
                  </button>
                </div>
                {generatedOTP && (
                  <div className="generated-otp">
                    Generated OTP: <strong>{generatedOTP}</strong>
                    <small>Keep this safe - you'll need it to import!</small>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button
                  className="action-btn back-btn"
                  onClick={resetForm}
                  onMouseEnter={playButtonHover}
                >
                  ← Back
                </button>
                <button
                  className="action-btn export-btn"
                  onClick={handleExport}
                  onMouseEnter={playButtonHover}
                  disabled={isProcessing || !SecurityManager.validateOTP(otp)}
                >
                  {isProcessing ? "Encrypting..." : "🔐 Export"}
                </button>
              </div>
            </div>
          )}

          {mode === "import" && (
            <div className="import-section">
              <h3>📥 Secure Import</h3>
              <p>
                Select your encrypted todo file and enter the OTP used during
                export.
              </p>

              <div className="file-input-section">
                <label className="file-input-label">
                  📁 Select Secure Export File
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                </label>
                {importFile && (
                  <div className="selected-file">
                    Selected: {importFile.name}
                  </div>
                )}
              </div>

              <div className="otp-section">
                <label>Enter your 6-digit OTP:</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  className="otp-input"
                  maxLength={6}
                />
              </div>

              <div className="action-buttons">
                <button
                  className="action-btn back-btn"
                  onClick={resetForm}
                  onMouseEnter={playButtonHover}
                >
                  ← Back
                </button>
                <button
                  className="action-btn import-btn"
                  onClick={handleImport}
                  onMouseEnter={playButtonHover}
                  disabled={
                    isProcessing ||
                    !importFile ||
                    !SecurityManager.validateOTP(otp)
                  }
                >
                  {isProcessing ? "Decrypting..." : "🔓 Import"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
