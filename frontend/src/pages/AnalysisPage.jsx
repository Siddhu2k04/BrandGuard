import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  UserRound,
  CalendarDays,
  Eye,
  Download,
  AlertTriangle,
  Info,
  BookOpen,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import AppShell from "../components/AppShell";
import { getLatestRecord, getRecord } from "../utils/storage";
import { analyzeContent } from "../utils/analyze";

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="detail-row">
      <Icon size={21} />
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export default function AnalysisPage({ role, navigate, onLogout, contentId }) {
  const [item, setItem] = useState(null);
  const [guidelines, setGuidelines] = useState(null);
  const [showFile, setShowFile] = useState(false);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    Promise.all([
      contentId ? getRecord(contentId) : getLatestRecord("content"),
      getLatestRecord("guidelines"),
    ])
      .then(([contentRecord, guidelineRecord]) => {
        setItem(contentRecord);
        setGuidelines(guidelineRecord);
        if (!contentRecord)
          setLoadError(
            "No uploaded content was found. Upload content first to see an analysis.",
          );
      })
      .catch(() =>
        setLoadError("Could not read saved content from this browser."),
      );
  }, [contentId]);
  const result = useMemo(
    () => (item ? analyzeContent(item, guidelines) : null),
    [item, guidelines],
  );
  const downloadReport = () => {
    if (!item || !result) return;
    const lines = [
      "BrandGuard — Analysis Results",
      `Content title: ${item.title}`,
      `Content type: ${item.type}`,
      `Description: ${item.description || "(none)"}`,
      `Uploaded by: ${item.uploadedBy || "Employee"}`,
      `Uploaded on: ${new Date(item.uploadedOn || item.createdAt).toLocaleString()}`,
      `Guidelines document: ${result.guidelineTitle}`,
      `Preliminary score: ${result.score}%`,
      `Status: ${result.status}`,
      "",
      "Detected issues:",
      ...result.issues.map(
        (x, i) =>
          `${i + 1}. ${x.issue} | Severity: ${x.severity} | Reference: ${x.reference} | Suggestion: ${x.suggestion}`,
      ),
      "",
      result.disclaimer,
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "brandguard-analysis-report.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const viewFile = () => {
    if (item?.blob) {
      const url = URL.createObjectURL(item.blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } else if (item?.url)
      window.open(item.url, "_blank", "noopener,noreferrer");
    else setShowFile((v) => !v);
  };
  const scoreBreakdown = [
    ["Brand Guidelines", Math.max(40, result?.score - 2 || 0)],
    ["Visual Identity", Math.max(40, result?.score - 5 || 0)],
    ["Messaging & Tone", Math.max(40, result?.score - 1 || 0)],
    ["Compliance & Legal", Math.max(40, result?.score - 10 || 0)],
    ["Technical Quality", Math.min(98, (result?.score || 0) + 5)],
  ];
  return (
    <AppShell
      active="Analytics"
      role={role}
      navigate={navigate}
      onLogout={onLogout}
    >
      <div className="analysis-title-row">
        <div className="page-heading">
          <h1>Analysis Results</h1>
          <p>
            Here's the result of your preliminary content check against company
            guidelines.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={downloadReport}
          disabled={!item}
        >
          <Download size={18} /> Download Report
        </button>
      </div>
      {loadError && (
        <section className="panel empty-state">
          <FileText size={36} />
          <h2>Nothing to analyse yet</h2>
          <p>{loadError}</p>
          <button
            className="primary-button"
            onClick={() =>
              navigate(
                role === "Company" ? "Company Guidelines" : "Upload Content",
              )
            }
          >
            {role === "Company" ? "Open Company Guidelines" : "Upload Content"}
          </button>
        </section>
      )}
      {item && result && (
        <div className="analysis-layout">
          <div className="analysis-left">
            <section className="panel uploaded-panel">
              <h2>Uploaded Content</h2>
              <div className="detail-row file-row">
                <FileText />
                <span>Uploaded Content</span>
                <div className="file-detail">
                  <span className="file-badge">
                    <FileText size={24} />
                    <b>{item.fileName ? "FILE" : item.type.toUpperCase()}</b>
                  </span>
                  <div>
                    <strong>{item.fileName || item.url || item.title}</strong>
                    <small>
                      {item.fileSize
                        ? `${(item.fileSize / 1024 / 1024).toFixed(2)} MB`
                        : item.type === "Link"
                          ? "Web link"
                          : "Text submitted"}
                    </small>
                  </div>
                </div>
                <button className="outline-button view-file" onClick={viewFile}>
                  <Eye size={17} />{" "}
                  {item.blob || item.url
                    ? "View File"
                    : showFile
                      ? "Hide Details"
                      : "View Details"}
                </button>
              </div>
              {showFile && (
                <div className="file-preview-note">
                  {item.type === "Text"
                    ? item.text
                    : item.fileName || item.url || "No file attached."}
                </div>
              )}
              <Detail
                icon={FileText}
                label="Content Title"
                value={item.title}
              />
              <Detail
                icon={FileText}
                label="Description"
                value={
                  item.description ||
                  (item.type === "Text"
                    ? item.text
                    : "No description provided.")
                }
              />
              <Detail icon={ImageIcon} label="Content Type" value={item.type} />
              <Detail
                icon={CalendarDays}
                label="Uploaded On"
                value={new Date(
                  item.uploadedOn || item.createdAt,
                ).toLocaleString()}
              />
              <Detail
                icon={UserRound}
                label="Uploaded By"
                value={item.uploadedBy}
              />
            </section>
            <section className="panel detected-panel">
              <h2>Detected Issues</h2>
              <div className="issues-table">
                <div className="issue-head">
                  <span>Issue</span>
                  <span>Severity</span>
                  <span>Guideline Reference</span>
                  <span>Suggestion</span>
                </div>
                {result.issues.map((entry, index) => (
                  <div className="issue-row" key={`${entry.issue}-${index}`}>
                    <span
                      className={`issue-symbol issue-${entry.severity.toLowerCase()}`}
                    >
                      {entry.severity === "High" ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <Info size={14} />
                      )}
                    </span>
                    <span>{entry.issue}</span>
                    <span>
                      <em
                        className={`severity ${entry.severity.toLowerCase()}`}
                      >
                        {entry.severity}
                      </em>
                    </span>
                    <span>{entry.reference}</span>
                    <span>{entry.suggestion}</span>
                  </div>
                ))}
              </div>
              <p className="demo-note">{result.disclaimer}</p>
            </section>
          </div>
          <div className="analysis-right">
            <section className="panel score-panel">
              <h2>Brand Compliance Score</h2>
              <div className="score-content">
                <div
                  className="score-ring"
                  style={{
                    background: `conic-gradient(#0c9c6b 0 ${result.score}%, #d9f3e9 ${result.score}% 100%)`,
                  }}
                >
                  <span>{result.score}%</span>
                </div>
                <div>
                  <b
                    className={`good-pill ${result.status !== "Good" ? "review-pill" : ""}`}
                  >
                    {result.status}
                  </b>
                  <p>Preliminary score based on simple local text checks.</p>
                </div>
              </div>
            </section>
            <section className="panel breakdown-panel">
              <h2>Score Breakdown</h2>
              {scoreBreakdown.map(([label, value]) => (
                <div className="bar-row" key={label}>
                  <span>{label}</span>
                  <div className="bar">
                    <i style={{ width: `${value}%` }} />
                  </div>
                  <b>{value}%</b>
                </div>
              ))}
            </section>
            <section className="panel guidelines-card">
              <div className="info-heading">
                <span>
                  <BookOpen size={24} />
                </span>
                <h2>Company Guidelines (PDF)</h2>
              </div>
              <div className="guideline-file compact-file">
                <div className="pdf-file-icon">
                  <FileText size={42} />
                  <b>PDF</b>
                </div>
                <div>
                  <strong>
                    {guidelines?.title || "No guidelines PDF yet"}
                  </strong>
                  <small>
                    {guidelines?.fileName ||
                      "Company has not uploaded a document"}
                  </small>
                </div>
                <button
                  className="outline-button"
                  onClick={() => navigate("Company Guidelines")}
                >
                  <ExternalLink size={16} />{" "}
                  {guidelines ? "View Guidelines" : "Open Guidelines"}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
