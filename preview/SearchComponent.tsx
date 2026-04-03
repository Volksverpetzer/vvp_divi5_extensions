import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Link, FileText, ExternalLink, Loader2, AlertCircle, TrendingUp, ShieldCheck } from 'lucide-react';

// Default API URLs
const DEFAULT_API_URLS = {
  searchApiUrl: 'https://ai.volksverpetzer-app.de/api/vector-search',
  importApiUrl: 'https://ai.volksverpetzer-app.de/api/import-url/'
};

// Load configuration from Divi module script data
function getApiConfig() {
  try {
    const configElement = document.getElementById('vvp-fact-check-search-config');
    if (configElement) {
      const config = JSON.parse(configElement.textContent || '{}');
      return {
        searchApiUrl: config.searchApiUrl || DEFAULT_API_URLS.searchApiUrl,
        importApiUrl: config.importApiUrl || DEFAULT_API_URLS.importApiUrl
      };
    }
  } catch (error) {
    console.warn('Failed to load fact-check search config, using defaults:', error);
  }
  return DEFAULT_API_URLS;
}

const API_CONFIG = getApiConfig();

// Types
interface SearchResult {
  id: string;
  title: string | null;
  excerpt: string;
  url: string | null;
  distance: number | null;
  lexical_score: number | null;
  rerank_score: number | null;
}

interface SearchResponse {
  results: SearchResult[];
  took: number;
}

// Helpers
function isUrl(str: string) {
  try {
    const u = new URL(str.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function scoreBar(score: number | null) {
  if (score == null) return null;
  const pct = Math.min(100, Math.round(score * 100));
  const color = pct >= 70 ? 'bg-[var(--brand-blue-main)]' : pct >= 40 ? 'bg-[var(--brand-blue-2)]' : 'bg-muted-foreground';
  return (
    <div className="vvp-fc__score-bar">
      <div className="vvp-fc__score-track">
        <div className={`vvp-fc__score-fill ${pct >= 70 ? 'vvp-fc__score-fill--high' : pct >= 40 ? 'vvp-fc__score-fill--medium' : 'vvp-fc__score-fill--low'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="vvp-fc__score-label">{pct}%</span>
    </div>
  );
}

const EXAMPLE_QUERIES = [
  'Corona-Impfungen verändern die DNA',
  'Klimawandel ist eine Erfindung',
  'Soros steuert die Medien',
  'Asylbewerber bekommen mehr Geld als Rentner',
];

// FactCheckOverlay component
export function FactCheckOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'idle' | 'importing' | 'searching' | 'done' | 'error'>('idle');
  const [importedSnippet, setImportedSnippet] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [took, setTook] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setInput('');
      setPhase('idle');
      setResults([]);
      setImportedSnippet(null);
      setErrorMsg(null);
      setTook(null);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const runSearch = useCallback(async (query: string) => {
    setPhase('searching');
    setErrorMsg(null);
    try {
      const res = await fetch(API_CONFIG.searchApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data: SearchResponse = await res.json();
      setResults(data.results ?? []);
      setTook(data.took ?? null);
      setPhase('done');
    } catch {
      setErrorMsg('Die Suche ist fehlgeschlagen. Bitte versuche es erneut.');
      setPhase('error');
    }
  }, []);

  const handleSubmit = useCallback(async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setResults([]);
    setImportedSnippet(null);
    setErrorMsg(null);

    if (isUrl(trimmed)) {
      setPhase('importing');
      try {
        const res = await fetch(`${API_CONFIG.importApiUrl}?url=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error('Import failed');
        const data = await res.json();
        const snippet: string = data.snippet ?? '';
        setImportedSnippet(snippet);
        await runSearch(snippet);
      } catch {
        setErrorMsg('Der Artikel konnte nicht geladen werden. Bitte versuche es mit einem anderen Link.');
        setPhase('error');
      }
    } else {
      await runSearch(trimmed);
    }
  }, [runSearch]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(input);
  };

  const handleExample = (q: string) => {
    setInput(q);
    handleSubmit(q);
  };

  if (!open) return null;

  const inputIsUrl = isUrl(input.trim());

  return (
    <div className="vvp-fc__overlay">
      <div className="vvp-fc__backdrop" onClick={onClose} />

      <div ref={overlayRef} className="vvp-fc__panel">
        <div className="vvp-fc__panel-header">
          <div className="vvp-fc__panel-title">
            <Search size={18} strokeWidth={2.5} style={{ color: 'var(--brand-blue-main)' }} />
            <span>Faktencheck</span>
          </div>
          <button onClick={onClose} className="vvp-fc__close-btn">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="vvp-fc__search-form">
          <div className="vvp-fc__input-row">
            <div className="vvp-fc__input-icon">
              {inputIsUrl ? <Link size={16} /> : <FileText size={16} />}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="URL oder Text zum Faktencheck eingeben..."
              className="vvp-fc__text-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || phase === 'importing' || phase === 'searching'}
              className="vvp-fc__submit-btn"
            >
              {(phase === 'importing' || phase === 'searching') ? (
                <Loader2 size={14} className="vvp-fc__spinner" />
              ) : (
                <Search size={14} />
              )}
              Prüfen
            </button>
          </div>

          {inputIsUrl && (
            <p className="vvp-fc__url-hint">
              <Link size={12} />
              Der Artikel wird zuerst importiert und dann geprüft.
            </p>
          )}
        </form>

        <div className="vvp-fc__content-area">
          {phase === 'idle' && (
            <div className="vvp-fc__state">
              <p className="vvp-fc__examples-label">Beispiele</p>
              <div className="vvp-fc__examples-list">
                {EXAMPLE_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => handleExample(q)}
                    className="vvp-fc__example-btn"
                  >
                    <TrendingUp size={13} style={{ color: 'var(--brand-blue-main)', opacity: 0.6 }} />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'importing' && (
            <div className="vvp-fc__state--loading">
              <Loader2 size={28} className="vvp-fc__spinner" style={{ color: 'var(--brand-blue-main)' }} />
              <p>Artikel wird importiert...</p>
            </div>
          )}

          {phase === 'searching' && (
            <div className="vvp-fc__state--loading">
              <Loader2 size={28} className="vvp-fc__spinner" style={{ color: 'var(--brand-blue-main)' }} />
              <p>Wird geprüft...</p>
            </div>
          )}

          {phase === 'error' && errorMsg && (
            <div className="vvp-fc__state--error">
              <AlertCircle size={18} />
              <p>{errorMsg}</p>
            </div>
          )}

          {importedSnippet && phase === 'done' && (
            <div className="vvp-fc__imported-snippet">
              <p className="vvp-fc__snippet-label">Importierter Inhalt</p>
              <p className="vvp-fc__snippet-text">{importedSnippet}</p>
            </div>
          )}

          {phase === 'done' && (
            <>
              <div className="vvp-fc__results-meta">
                <p>{results.length === 0 ? 'Keine Treffer gefunden' : `${results.length} relevante Artikel gefunden`}</p>
                {took != null && <span>{took} ms</span>}
              </div>

              {results.length === 0 && (
                <div className="vvp-fc__no-results">
                  Zu dieser Aussage wurden keine passenden Artikel gefunden.
                </div>
              )}

              <div className="vvp-fc__results-list">
                {results.map((r, i) => (
                  <a
                    key={r.id}
                    href={r.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vvp-fc__result-card"
                  >
                    <div className="vvp-fc__result-rank">
                      <span>{i + 1}</span>
                    </div>

                    <div className="vvp-fc__result-body">
                      <div className="vvp-fc__result-header">
                        <h3 className="vvp-fc__result-title">
                          {r.title ?? 'Ohne Titel'}
                        </h3>
                        <ExternalLink size={13} className="vvp-fc__result-ext-icon" />
                      </div>
                      <p className="vvp-fc__result-excerpt">
                        {r.excerpt}
                      </p>
                      {scoreBar(r.rerank_score ?? r.lexical_score)}
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// FactCheckBar component
export function FactCheckBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="vvp-fc__bar">
        <div className="vvp-fc__bar-inner">
          <div className="vvp-fc__bar-label-group">
            <ShieldCheck size={22} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            <div>
              <p className="vvp-fc__bar-title">Faktencheck-Archiv durchsuchen</p>
              <p className="vvp-fc__bar-desc">Text, Zitat oder URL eingeben. Wir zeigen passende Faktenchecks und bereits belegte Einordnungen.</p>
            </div>
          </div>
          <div className="vvp-fc__bar-actions">
            <button onClick={() => setOpen(true)} className="vvp-fc__bar-trigger">
              <Search size={15} />
              <span>z.B. eine strittige Behauptung, ein Zitat oder eine URL...</span>
            </button>
            <button onClick={() => setOpen(true)} className="vvp-fc__bar-btn">
              Im Archiv suchen
            </button>
          </div>
        </div>
      </section>

      <FactCheckOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}