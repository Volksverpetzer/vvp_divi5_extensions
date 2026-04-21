import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import classnames from "classnames";

import {
  IconSearch,
  IconX,
  IconShieldCheck,
  IconLink,
  IconFileText,
  IconTrendingUp,
  IconAlertCircle,
  IconExternalLink,
} from "./icons";

const EXAMPLE_QUERIES = [
  "Corona-Impfungen verändern die DNA",
  "Klimawandel ist eine Erfindung",
  "Soros steuert die Medien",
  "Asylbewerber bekommen mehr Geld als Rentner",
];

const isUrl = (str: string) => {
  try {
    const u = new URL(str.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (_) {
    return false;
  }
};

export interface FactCheckSearchAppProps {
  searchApiUrl: string;
  importApiUrl: string;
}

export const FactCheckSearchApp: React.FC<FactCheckSearchAppProps> = ({
  searchApiUrl,
  importApiUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "importing" | "searching" | "done" | "error"
  >("idle");
  const [query, setQuery] = useState("");
  const [errorText, setErrorText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [tookTime, setTookTime] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openOverlay = () => {
    setIsOpen(true);
    document.body.style.overflow = "hidden";
    setQuery("");
    setPhase("idle");
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 60);
  };

  const closeOverlay = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeOverlay();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const runSearch = async (searchQuery: string) => {
    if (!searchApiUrl) {
      setPhase("error");
      setErrorText("Keine Such-API URL konfiguriert.");
      return;
    }

    setPhase("searching");

    try {
      const res = await fetch(searchApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      const data = await res.json();
      setResults(data.results || []);
      setTookTime(data.took != null ? data.took : null);
      setPhase("done");
    } catch (err) {
      setPhase("error");
      setErrorText("Die Suche ist fehlgeschlagen. Bitte versuche es erneut.");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (isUrl(trimmed)) {
      if (!importApiUrl) {
        setPhase("error");
        setErrorText("Keine Import-API URL konfiguriert.");
        return;
      }

      setPhase("importing");

      try {
        const res = await fetch(
          importApiUrl + "?url=" + encodeURIComponent(trimmed),
        );
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        runSearch(data.snippet || trimmed);
      } catch (err) {
        setPhase("error");
        setErrorText(
          "Der Artikel konnte nicht geladen werden. Bitte versuche es mit einem anderen Link.",
        );
      }
    } else {
      runSearch(trimmed);
    }
  };

  const handleExampleClick = (q: string) => {
    setQuery(q);
    // Using setTimeout to ensure UI updates before fetching, similar to original behavior
    setTimeout(() => {
      if (!searchApiUrl) {
        setPhase("error");
        setErrorText("Keine Such-API URL konfiguriert.");
        return;
      }
      setPhase("searching");
      fetch(searchApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
        .then((res) => res.json())
        .then((data) => {
          setResults(data.results || []);
          setTookTime(data.took != null ? data.took : null);
          setPhase("done");
        })
        .catch(() => {
          setPhase("error");
          setErrorText(
            "Die Suche ist fehlgeschlagen. Bitte versuche es erneut.",
          );
        });
    }, 0);
  };

  const isUrlQuery = isUrl(query);
  const disableSubmit =
    !query.trim() || phase === "importing" || phase === "searching";

  return (
    <div className="vvp-fc__wrapper">
      <section className="vvp-fc__bar">
        <div className="vvp-fc__bar-inner">
          <div className="vvp-fc__bar-label-group">
            <IconShieldCheck size={22} />
            <div>
              <p className="vvp-fc__bar-title">
                Faktencheck-Archiv durchsuchen
              </p>
            </div>
          </div>

          <div className="vvp-fc__bar-actions">
            <button
              type="button"
              className="vvp-fc__bar-trigger js-vvp-fc-open"
              onClick={openOverlay}
            >
              <IconSearch size={15} />
              <span>
                z.B. eine strittige Behauptung, ein Zitat oder eine URL...
              </span>
            </button>
            <button
              type="button"
              className="vvp-fc__bar-btn js-vvp-fc-open"
              onClick={openOverlay}
            >
              Im Archiv suchen
            </button>
          </div>
        </div>
      </section>

      {isOpen &&
        createPortal(
          <div
            className="vvp-fc__overlay js-vvp-fc-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Faktencheck-Suche"
          >
            <div
              className="vvp-fc__backdrop js-vvp-fc-backdrop"
              onClick={closeOverlay}
            ></div>
            <div className="vvp-fc__panel">
              <div className="vvp-fc__panel-header">
                <div className="vvp-fc__panel-title">
                  <IconSearch size={18} />
                  <span>Faktencheck</span>
                </div>
                <button
                  type="button"
                  className="vvp-fc__close-btn js-vvp-fc-close"
                  aria-label="Schließen"
                  onClick={closeOverlay}
                >
                  <IconX size={18} />
                </button>
              </div>

              <form
                className="vvp-fc__search-form js-vvp-fc-form"
                onSubmit={handleSubmit}
              >
                <div className="vvp-fc__input-row">
                  <span className="vvp-fc__input-icon js-vvp-fc-input-icon">
                    {isUrlQuery ? (
                      <IconLink size={16} />
                    ) : (
                      <IconFileText size={16} />
                    )}
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="vvp-fc__text-input js-vvp-fc-input"
                    placeholder="URL oder Text zum Faktencheck eingeben..."
                    autoComplete="off"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="vvp-fc__submit-btn js-vvp-fc-submit"
                    disabled={disableSubmit}
                  >
                    <span className="vvp-fc__submit-icon">
                      <IconSearch size={14} />
                    </span>
                    <span>Prüfen</span>
                  </button>
                </div>
                <p
                  className="vvp-fc__url-hint js-vvp-fc-url-hint"
                  hidden={!isUrlQuery}
                >
                  <IconLink size={12} />
                  <span>
                    Der Artikel wird zuerst importiert und dann geprüft.
                  </span>
                </p>
              </form>

              <div className="vvp-fc__content-area">
                <div
                  className="vvp-fc__state js-vvp-fc-state-idle"
                  hidden={phase !== "idle"}
                >
                  <p className="vvp-fc__examples-label">Beispiele</p>
                  <div className="vvp-fc__examples-list">
                    {EXAMPLE_QUERIES.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        className="vvp-fc__example-btn js-vvp-fc-example"
                        data-query={q}
                        onClick={() => handleExampleClick(q)}
                      >
                        <IconTrendingUp size={13} />
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="vvp-fc__state vvp-fc__state--loading js-vvp-fc-state-loading"
                  hidden={phase !== "importing" && phase !== "searching"}
                >
                  <div className="vvp-fc__spinner">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                  </div>
                  <p className="js-vvp-fc-loading-text">
                    {phase === "importing"
                      ? "Artikel wird importiert..."
                      : "Wird geprüft..."}
                  </p>
                </div>

                <div
                  className="vvp-fc__state vvp-fc__state--error js-vvp-fc-state-error"
                  hidden={phase !== "error"}
                >
                  <IconAlertCircle size={18} />
                  <p className="js-vvp-fc-error-text">{errorText}</p>
                </div>

                <div
                  className="vvp-fc__state js-vvp-fc-state-done"
                  hidden={phase !== "done"}
                >
                  <div className="vvp-fc__results-meta">
                    <span className="js-vvp-fc-results-count">
                      {results.length === 0
                        ? "Keine Treffer gefunden"
                        : `${results.length} relevante Artikel gefunden`}
                    </span>
                    <span className="js-vvp-fc-results-time">
                      {tookTime != null ? `${tookTime} ms` : ""}
                    </span>
                  </div>
                  <div className="vvp-fc__results-list js-vvp-fc-results-list">
                    {results.length === 0 ? (
                      <p className="vvp-fc__no-results">
                        Zu dieser Aussage wurden keine passenden Artikel
                        gefunden.
                      </p>
                    ) : (
                      results.map((r, i) => {
                        const score =
                          r.rerank_score != null
                            ? r.rerank_score
                            : r.lexical_score;
                        const pct = Math.min(100, Math.round(score * 100));
                        const modClass =
                          pct >= 70
                            ? ""
                            : pct >= 40
                              ? " vvp-fc__score-fill--medium"
                              : " vvp-fc__score-fill--low";
                        const title = r.title || "Ohne Titel";
                        const excerpt = r.excerpt || "";
                        const url = r.url || "#";

                        return (
                          <a
                            key={i}
                            className="vvp-fc__result-card"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="vvp-fc__result-rank">{i + 1}</div>
                            <div className="vvp-fc__result-body">
                              <div className="vvp-fc__result-header">
                                <h3 className="vvp-fc__result-title">
                                  {title}
                                </h3>
                                <span className="vvp-fc__result-ext-icon">
                                  <IconExternalLink size={13} />
                                </span>
                              </div>
                              <p className="vvp-fc__result-excerpt">
                                {excerpt}
                              </p>
                              {score != null && (
                                <div className="vvp-fc__score-bar">
                                  <div className="vvp-fc__score-track">
                                    <div
                                      className={`vvp-fc__score-fill${modClass}`}
                                      style={{ width: `${pct}%` }}
                                    ></div>
                                  </div>
                                  <span className="vvp-fc__score-label">
                                    {pct}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </a>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
