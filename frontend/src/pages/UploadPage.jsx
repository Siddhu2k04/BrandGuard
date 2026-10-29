import React, { useEffect, useState } from "react";
import {
  CloudUpload,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  BookOpen,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import AppShell from "../components/AppShell";
import { getLatestRecord, makeId, saveRecord } from "../utils/storage";

export default function UploadPage({ role, navigate, onLogout, onAnalyze }) {
  const [type, setType] = useState("Image");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [notice, setNotice] = useState("");
  const [guidelines, setGuidelines] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    getLatestRecord("guidelines")
      .then(setGuidelines)
      .catch(() => {});
  }, []);
  const chooseFile = (selected) => {
    if (!selected) return;
    if (type === "Image" && !selected.type.startsWith("image/")) {
      setNotice("Please choose an image file.");
      return;
    }
    if (selected.size > 25 * 1024 * 1024) {
      setNotice("Please choose a file smaller than 25 MB.");
      return;
    }
    setFile(selected);
    setNotice("");
    if (!title.trim()) setTitle(selected.name.replace(/\.[^.]+$/, ""));
  };
  const submit = async () => {
    if (!title.trim()) {
      setNotice("Please enter a content title.");
      return;
    }
    if (type === "Image" && !file) {
      setNotice("Please choose an image file.");
      return;
    }
    if (type === "Link" && !/^https?:\/\//i.test(url.trim())) {
      setNotice("Enter a valid link starting with http:// or https://.");
      return;
    }
    if (type === "Text" && !description.trim()) {
      setNotice(
        "Paste the content you want to analyze in the description field.",
      );
      return;
    }
    if (type === "Image" && !description.trim()) {
      setNotice("Please add a short content description.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const item = {
        id: makeId(),
        kind: "content",
        type,
        title: title.trim(),
        description: description.trim(),
        text: type === "Text" ? description.trim() : "",
        url: type === "Link" ? url.trim() : "",
        fileName: file?.name || "",
        fileType: file?.type || "",
        fileSize: file?.size || 0,
        blob: file || null,
        uploadedBy: sessionStorage.getItem("bg-email") || "Employee",
        uploadedOn: new Date().toISOString(),
        createdAt: Date.now(),
      };
      await saveRecord(item);
      onAnalyze(item);
    } catch {
      setNotice(
        "Could not save this upload in browser storage. Try a smaller file.",
      );
    } finally {
      setBusy(false);
    }
  };
  const viewGuidelines = () => {
    if (!guidelines?.blob) {
      setNotice("The company has not uploaded a guidelines PDF yet.");
      return;
    }
    const objectUrl = URL.createObjectURL(guidelines.blob);
    window.open(objectUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  };
  return (
    <AppShell
      active="Upload Content"
      role={role}
      navigate={navigate}
      onLogout={onLogout}
    >
      <div className="page-heading">
        <h1>Upload Content</h1>
        <p>
          Add your content for review. Follow the company guidelines to maintain
          consistency and trust.
        </p>
      </div>
      <div className="upload-layout">
        <section className="upload-main">
          <div className="type-tabs">
            {[
              ["Image", ImageIcon],
              ["Text", FileText],
              ["Link", LinkIcon],
            ].map(([label, Icon]) => (
              <button
                key={label}
                className={type === label ? "tab-active" : ""}
                onClick={() => {
                  setType(label);
                  setFile(null);
                  setNotice("");
                }}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>
          <div className="panel upload-form">
            <h2>Upload Your Content</h2>
            {type === "Image" && (
              <label className="upload-dropzone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => chooseFile(e.target.files?.[0])}
                />
                <CloudUpload size={50} />
                <b>{file ? file.name : "Drag and drop your image here"}</b>
                <span>or</span>
                <span className="choose-button">Choose Image</span>
                <small>Image file · Maximum 25 MB</small>
              </label>
            )}
            {type === "Text" && (
              <>
                <label className="form-label" htmlFor="text-content">
                  Text to review <i>*</i>
                </label>
                <textarea
                  id="text-content"
                  className="text-input text-content-area"
                  maxLength={5000}
                  placeholder="Paste your post, advertisement, email, or other content here..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="char-count">{description.length}/5000</div>
              </>
            )}
            {type === "Link" && (
              <>
                <label className="form-label" htmlFor="content-url">
                  Content URL <i>*</i>
                </label>
                <div className="input-wrap link-input">
                  <LinkIcon size={18} />
                  <input
                    id="content-url"
                    type="url"
                    placeholder="https://example.com/your-content"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
              </>
            )}
            <label className="form-label" htmlFor="content-title">
              Content Title <i>*</i>
            </label>
            <input
              id="content-title"
              className="text-input"
              placeholder="Enter a title for your content"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {type !== "Text" && (
              <>
                <label className="form-label" htmlFor="content-description">
                  Content Description <i>*</i>
                </label>
                <textarea
                  id="content-description"
                  className="text-input description-input"
                  maxLength={500}
                  placeholder="Write a short description about this content..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="char-count">{description.length}/500</div>
              </>
            )}
            {notice && (
              <p className="form-error" role="alert">
                {notice}
              </p>
            )}
            <div className="form-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setFile(null);
                  setTitle("");
                  setDescription("");
                  setUrl("");
                  setNotice("");
                }}
              >
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={submit}
                disabled={busy}
              >
                {busy ? (
                  "Uploading…"
                ) : (
                  <>
                    <CloudUpload size={18} /> Upload & Analyse
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
        <aside className="panel content-guidelines">
          <div className="info-heading">
            <span>
              <BookOpen size={25} />
            </span>
            <div>
              <h2>Content Guidelines (PDF)</h2>
              <p>
                Refer to the company guidelines before uploading your content.
              </p>
            </div>
          </div>
          <div className="guideline-file">
            <div className="pdf-file-icon">
              <FileText size={53} />
              <b>PDF</b>
            </div>
            <strong>{guidelines?.title || "Company Guidelines.pdf"}</strong>
            <small>
              {guidelines
                ? `${guidelines.fileName} · ${(guidelines.fileSize / 1024 / 1024).toFixed(2)} MB`
                : "No PDF uploaded yet"}
            </small>
            <button className="outline-button" onClick={viewGuidelines}>
              <ExternalLink size={17} /> View Guidelines
            </button>
          </div>
          <div className="key-points">
            <h3>Key Points to Remember</h3>
            {[
              "Follow company brand guidelines.",
              "Avoid misleading or inappropriate content.",
              "Use relevant titles and descriptions.",
              "Ensure content is original and high quality.",
              "All content will be reviewed before publishing.",
            ].map((text) => (
              <p key={text}>
                <CheckCircle2 size={19} />
                {text}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
