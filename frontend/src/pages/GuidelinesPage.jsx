import React, { useEffect, useState } from "react";
import {
  FileText,
  CloudUpload,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import AppShell from "../components/AppShell";
import { getLatestRecord, makeId, saveRecord } from "../utils/storage";

export default function GuidelinesPage({ role, navigate, onLogout }) {
  const [pdf, setPdf] = useState(null);
  const [saved, setSaved] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    getLatestRecord("guidelines")
      .then((record) => {
        if (record) {
          setSaved(record);
          setTitle(record.title);
          setDescription(record.description || "");
        }
      })
      .catch(() => setNotice("Browser storage is unavailable."));
  }, []);
  const handleFile = (file) => {
    if (!file) return;
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setNotice("Please choose a PDF file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setNotice("PDF must be smaller than 100 MB.");
      return;
    }
    setPdf(file);
    setNotice("");
    if (!title) setTitle(file.name.replace(/\.pdf$/i, ""));
  };
  const upload = async () => {
    if (!pdf || !title.trim()) {
      setNotice("Choose a PDF and enter a document title.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const record = {
        id: makeId(),
        kind: "guidelines",
        title: title.trim(),
        description: description.trim(),
        fileName: pdf.name,
        fileType: pdf.type || "application/pdf",
        fileSize: pdf.size,
        blob: pdf,
        createdAt: Date.now(),
        updatedBy: sessionStorage.getItem("bg-email") || "Company Admin",
      };
      await saveRecord(record);
      setSaved(record);
      setPdf(null);
      setNotice(
        "Guidelines PDF saved in this browser and is available to the employee upload page.",
      );
    } catch {
      setNotice(
        "Could not save the PDF in browser storage. Try a smaller file or a different browser.",
      );
    } finally {
      setBusy(false);
    }
  };
  const viewSaved = () => {
    if (!saved?.blob) return;
    const url = URL.createObjectURL(saved.blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  return (
    <AppShell
      active="Company Guidelines"
      role={role}
      navigate={navigate}
      onLogout={onLogout}
    >
      <div className="page-heading">
        <h1>Company Guidelines</h1>
        <p className="slogan">ONE BRAND, ONE STANDARD.</p>
      </div>
      <div className="guidelines-layout">
        <section className="panel guideline-form">
          <h2>Upload PDF</h2>
          <label className="dropzone">
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <FileText className="pdf-icon" size={48} />
            <b>{pdf ? pdf.name : "Drag and drop your PDF file here"}</b>
            <span>or</span>
            <span className="choose-button">
              <CloudUpload size={18} /> Choose PDF File
            </span>
            <small>Only PDF files are allowed (Max size: 100 MB)</small>
          </label>
          <label className="form-label" htmlFor="guideline-title">
            Document Title <i>*</i>
          </label>
          <input
            id="guideline-title"
            className="text-input"
            placeholder="Enter a title for the PDF"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label className="form-label" htmlFor="guideline-description">
            Description <span className="optional">(Optional)</span>
          </label>
          <textarea
            id="guideline-description"
            className="text-input description-input"
            placeholder="Write a short description about this document..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {notice && (
            <p
              className={
                notice.startsWith("Guidelines PDF saved")
                  ? "form-success"
                  : "form-error"
              }
              role="status"
            >
              {notice}
            </p>
          )}
          <div className="form-actions">
            <button
              className="secondary-button"
              onClick={() => {
                setPdf(null);
                setTitle(saved?.title || "");
                setDescription(saved?.description || "");
                setNotice("");
              }}
            >
              Cancel
            </button>
            <button className="primary-button" onClick={upload} disabled={busy}>
              {busy ? (
                "Saving…"
              ) : (
                <>
                  <CloudUpload size={18} /> Upload PDF
                </>
              )}
            </button>
          </div>
        </section>
        <aside className="panel guidelines-info">
          <div className="info-heading">
            <span>
              <FileText size={25} />
            </span>
            <h2>Guidelines Updated</h2>
          </div>
          {saved ? (
            <>
              <div className="saved-guideline">
                <div className="pdf-illustration">
                  <FileText size={72} />
                  <span>PDF</span>
                  <CheckCircle2 className="pdf-check" size={28} />
                </div>
                <strong>{saved.title}</strong>
                <small>
                  {saved.fileName} · {(saved.fileSize / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </small>
                <button className="outline-button" onClick={viewSaved}>
                  <ExternalLink size={16} /> View Guidelines
                </button>
                <p className="saved-meta">
                  Updated by {saved.updatedBy || "Company Admin"} ·{" "}
                  {new Date(saved.createdAt).toLocaleDateString()}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="pdf-illustration">
                <FileText size={72} />
                <span>PDF</span>
              </div>
              <p>
                Keep your company guidelines
                <br />
                up to date.
              </p>
            </>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
