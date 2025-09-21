import React, { useState } from "react";
import { SecurityManager } from "../utils/SecurityManager";
import { useTodoContext } from "../contexts/TodoContext";
import { useAudio } from "../hooks/useAudio";
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
      const secureExport = await SecurityManager.encryptData(todos, otp);
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
        `Secure export created! Valid for 5 minutes. Keep your OTP (${otp}) safe.`
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

      const importedTodos = await SecurityManager.decryptData(secureData, otp);
      await importTodos(importedTodos);

      playTodoAdd();
      showMessage(
        "success",
        `Successfully imported ${importedTodos.length} todos!`
      );
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
    <div className="secure-manager-overlay">
      <div className="secure-manager-container">
        <div className="secure-manager-header">
          <h2>🔒 Secure Data Manager</h2>
          <button
            className="close-btn"
            onClick={onClose}
            onMouseEnter={playButtonHover}
          >
            ×
          </button>
        </div>

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
                <div className="selected-file">Selected: {importFile.name}</div>
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

        {message && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
      </div>
    </div>
  );
};
