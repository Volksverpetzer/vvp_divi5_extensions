/**
 * search.tsx
 *
 * Self-contained search functionality extracted from the Volksverpetzer frontpage.
 * Contains three components:
 *
 *   - FactCheckOverlay   — fullscreen modal with search input & results
 *   - FactCheckBar       — blue banner section with fake input + button that opens the overlay
 *   - SearchHeaderButton — minimal header button that opens the overlay
 *
 * API routes (configurable via Divi module settings):
 *   POST [searchApiUrl]       { query: string } → { results: SearchResult[], took: number }
 *   GET  [importApiUrl]?url=<encoded>    → { snippet: string }
 *
 * Default URLs:
 *   searchApiUrl: 'https://ai.volksverpetzer-app.de/api/vector-search'
 *   importApiUrl: 'https://ai.volksverpetzer-app.de/api/import-url/'
 *
 * CSS variables used (define in your global CSS):
 *   --brand-blue-main
 *   --brand-blue-2
 *   --brand-hellblau
 */

// Default API URLs (used as fallbacks)
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

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Search, Link, FileText, ExternalLink, Loader2, AlertCircle, TrendingUp, ShieldCheck, Menu } from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchResult {
  id: string
  title: string | null
  excerpt: string
  url: string | null
  distance: number | null
  lexical_score: number | null
  rerank_score: number | null
}

interface SearchResponse {
  results: SearchResult[]
  took: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isUrl(str: string) {
  try {
    const u = new URL(str.trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function scoreBar(score: number | null) {
  if (score == null) return null
  const pct = Math.min(100, Math.round(score * 100))
  const color =
    pct >= 70 ? 'bg-[var(--brand-blue-main)]' : pct >= 40 ? 'bg-[var(--brand-blue-2)]' : 'bg-muted-foreground'
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
    </div>
  )
}

const EXAMPLE_QUERIES = [
  'Corona-Impfungen verändern die DNA',
  'Klimawandel ist eine Erfindung',
  'Soros steuert die Medien',
  'Asylbewerber bekommen mehr Geld als Rentner',
]

// ---------------------------------------------------------------------------
// FactCheckOverlay — fullscreen search modal
// ---------------------------------------------------------------------------

interface FactCheckOverlayProps {
  open: boolean
  onClose: () => void
}

export function FactCheckOverlay({ open, onClose }: FactCheckOverlayProps) {
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<'idle' | 'importing' | 'searching' | 'done' | 'error'>('idle')
  const [importedSnippet, setImportedSnippet] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [took, setTook] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 60)
    } else {
      setInput('')
      setPhase('idle')
      setResults([])
      setImportedSnippet(null)
      setErrorMsg(null)
      setTook(null)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const runSearch = useCallback(async (query: string) => {
    setPhase('searching')
    setErrorMsg(null)
    try {
      const res = await fetch(API_CONFIG.searchApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data: SearchResponse = await res.json()
      setResults(data.results ?? [])
      setTook(data.took ?? null)
      setPhase('done')
    } catch {
      setErrorMsg('Die Suche ist fehlgeschlagen. Bitte versuche es erneut.')
      setPhase('error')
    }
  }, [])

  const handleSubmit = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    setResults([])
    setImportedSnippet(null)
    setErrorMsg(null)

    if (isUrl(trimmed)) {
      setPhase('importing')
      try {
        const res = await fetch(`${API_CONFIG.importApiUrl}?url=${encodeURIComponent(trimmed)}`)
        if (!res.ok) throw new Error('Import failed')
        const data = await res.json()
        const snippet: string = data.snippet ?? ''
        setImportedSnippet(snippet)
        await runSearch(snippet)
      } catch {
        setErrorMsg('Der Artikel konnte nicht geladen werden. Bitte versuche es mit einem anderen Link.')
        setPhase('error')
      }
    } else {
      await runSearch(trimmed)
    }
  }, [runSearch])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(input)
  }

  const handleExample = (q: string) => {
    setInput(q)
    handleSubmit(q)
  }

  if (!open) return null

  const inputIsUrl = isUrl(input.trim())

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Faktencheck-Suche"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={overlayRef}
        className="relative z-10 mx-auto w-full max-w-3xl mt-16 mb-8 flex flex-col bg-card rounded-xl shadow-2xl border border-border overflow-hidden max-h-[calc(100vh-8rem)]"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2 text-[var(--brand-blue-main)]">
            <Search size={18} strokeWidth={2.5} />
            <span className="font-serif font-semibold text-foreground text-sm tracking-wide uppercase">
              Faktencheck
            </span>
          </div>
          <div className="flex-1" />
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search form */}
        <form onSubmit={handleFormSubmit} className="px-5 pt-4 pb-3">
          <div className="relative flex items-center">
            <div className="absolute left-3 text-muted-foreground pointer-events-none">
              {inputIsUrl ? <Link size={16} /> : <FileText size={16} />}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="URL oder Text zum Faktencheck eingeben..."
              className="w-full pl-9 pr-28 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue-main)] focus:border-transparent transition-shadow"
            />
            <button
              type="submit"
              disabled={!input.trim() || phase === 'importing' || phase === 'searching'}
              className="absolute right-2 px-4 py-1.5 rounded-md bg-[var(--brand-blue-main)] text-white text-sm font-medium hover:bg-[var(--brand-blue-2)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {(phase === 'importing' || phase === 'searching') ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              Prüfen
            </button>
          </div>

          {inputIsUrl && (
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
              <Link size={12} />
              Der Artikel wird zuerst importiert und dann geprüft.
            </p>
          )}
        </form>

        {/* Scrollable results area */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">

          {/* Idle: example queries */}
          {phase === 'idle' && (
            <div className="py-2">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide font-sans">Beispiele</p>
              <div className="flex flex-col gap-1">
                {EXAMPLE_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => handleExample(q)}
                    className="text-left text-sm px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                  >
                    <TrendingUp size={13} className="text-[var(--brand-blue-main)] opacity-60 group-hover:opacity-100 flex-shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Importing phase */}
          {phase === 'importing' && (
            <div className="py-8 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 size={28} className="animate-spin text-[var(--brand-blue-main)]" />
              <p className="text-sm">Artikel wird importiert...</p>
            </div>
          )}

          {/* Searching phase */}
          {phase === 'searching' && (
            <div className="py-8 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 size={28} className="animate-spin text-[var(--brand-blue-main)]" />
              <p className="text-sm">Wird geprüft...</p>
            </div>
          )}

          {/* Error */}
          {phase === 'error' && errorMsg && (
            <div className="py-6 flex items-start gap-3 text-destructive">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          {/* Imported snippet preview */}
          {importedSnippet && phase === 'done' && (
            <div className="mb-4 p-3 rounded-lg bg-muted border border-border">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Importierter Inhalt</p>
              <p className="text-xs text-foreground line-clamp-3 leading-relaxed">{importedSnippet}</p>
            </div>
          )}

          {/* Results */}
          {phase === 'done' && (
            <>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-sans">
                  {results.length === 0 ? 'Keine Treffer gefunden' : `${results.length} relevante Artikel gefunden`}
                </p>
                {took != null && (
                  <span className="text-xs text-muted-foreground">{took} ms</span>
                )}
              </div>

              {results.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Zu dieser Aussage wurden keine passenden Artikel gefunden.
                </div>
              )}

              <div className="flex flex-col gap-3">
                {results.map((r, i) => (
                  <a
                    key={r.id}
                    href={r.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex gap-4 p-4 rounded-lg border border-border bg-background hover:shadow-sm transition-all"
                  >
                    {/* Rank badge */}
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--brand-hellblau)] flex items-center justify-center">
                      <span className="text-xs font-bold text-[var(--brand-blue-main)]">{i + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-serif font-semibold text-foreground leading-snug group-hover:text-[var(--brand-blue-main)] transition-colors line-clamp-2">
                          {r.title ?? 'Ohne Titel'}
                        </h3>
                        <ExternalLink size={13} className="flex-shrink-0 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
  )
}

// ---------------------------------------------------------------------------
// FactCheckBar — blue banner section with fake input + button
// ---------------------------------------------------------------------------

export function FactCheckBar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <section className="bg-[var(--brand-blue-main)] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            {/* Label */}
            <div className="flex items-center gap-3 md:flex-shrink-0">
              <ShieldCheck size={22} className="text-white/80" />
              <div>
                <p className="text-white font-serif font-semibold text-base leading-tight">
                  Faktencheck-Archiv durchsuchen
                </p>
                <p className="text-white/70 text-xs font-sans leading-snug mt-0.5">
                  Text, Zitat oder URL eingeben. Wir zeigen passende Faktenchecks und bereits belegte Einordnungen.
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 md:gap-3">
              {/* Fake input that opens the overlay */}
              <button
                onClick={() => setOpen(true)}
                className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 hover:border-white/60 text-white/70 hover:text-white transition-all text-sm font-sans text-left"
              >
                <Search size={15} className="flex-shrink-0" />
                <span className="truncate">z.B. eine strittige Behauptung, ein Zitat oder eine URL...</span>
              </button>

              <button
                onClick={() => setOpen(true)}
                className="flex-shrink-0 whitespace-nowrap px-4 sm:px-5 py-3 rounded-lg bg-white text-[var(--brand-blue-main)] font-semibold text-sm hover:bg-white/90 transition-colors shadow-sm"
              >
                Im Archiv suchen
              </button>
            </div>
          </div>
        </div>
      </section>

      <FactCheckOverlay open={open} onClose={() => setOpen(false)} />
    </>
  )
}

// ---------------------------------------------------------------------------
// SearchHeaderButton — minimal button for use in a site header / navbar
// ---------------------------------------------------------------------------

export function SearchHeaderButton() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setSearchOpen(true)}
        aria-label="Faktencheck starten"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <Search size={14} />
        <span className="hidden sm:inline">Archiv prüfen</span>
      </button>

      <FactCheckOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
