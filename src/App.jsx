import { useState } from 'react';
import {
  Search, CheckCircle, AlertTriangle, XCircle, ExternalLink, ChevronDown, ChevronUp,
  BookOpen, RotateCcw, ShieldCheck, FileSearch, CalendarClock, HeartPulse, Loader2,
  Clock, AlertCircle, ShieldAlert, Video, Newspaper, Bot, MousePointerClick,
  Image as ImageIcon, ListChecks, Database, Settings, Moon, Sun, Eye, EyeOff, Lock, Key
} from 'lucide-react';

const GLOSSARY = [
  { id: 'misinformation', term: 'Misinformation', icon: AlertCircle, def: 'False information that gets shared without realizing it is false. The person sharing it usually believes it is true.' },
  { id: 'disinformation', term: 'Disinformation', icon: ShieldAlert, def: 'False information that is created and spread on purpose, often to deceive, manipulate opinion, or cause harm.' },
  { id: 'deepfake', term: 'Deepfakes', icon: Video, def: 'AI-generated images, audio, or video that convincingly show people saying or doing things that never actually happened.' },
  { id: 'fabricated_article', term: 'Fabricated Articles', icon: Newspaper, def: 'Content built to look like real journalism - fake bylines, logos, and formatting - but invented from scratch.' },
  { id: 'bot_amplification', term: 'Bots & Fake Accounts', icon: Bot, def: 'Automated or fake social accounts that repost and amplify content so it appears more popular or widely believed than it really is.' },
  { id: 'clickbait', term: 'Clickbait', icon: MousePointerClick, def: 'Headlines or framing that exaggerate or mislead purely to get clicks, often overstating what the content actually delivers.' },
  { id: 'reverse_image_search', term: 'Reverse Image Search', icon: ImageIcon, def: 'Searching with an image instead of text to find where else it has appeared online and whether it has been altered or used out of context.' },
  { id: 'fact_checking', term: 'Fact-Checking with Multiple Sources', icon: ListChecks, def: 'Verifying a claim against several independent, credible sources and tracing it back to original evidence, rather than trusting a single source.' },
  { id: 'metadata_analysis', term: 'Metadata Analysis', icon: Database, def: 'Examining hidden data attached to a file - like when a photo was taken or when a document was last edited - to see if it matches the story being told.' },
  { id: 'emotional_manipulation', term: 'Emotional Manipulation', icon: HeartPulse, def: 'Content crafted to provoke strong feelings like anger, fear, or excitement, which can short-circuit critical thinking and push people to believe and share without checking.' }
];

const CHECK_META = {
  sourceCheck: { label: 'Source Check', icon: ShieldCheck, prompts: ['Who created this content?', 'Is the source credible?'] },
  evidenceCheck: { label: 'Evidence Check', icon: FileSearch, prompts: ['What evidence supports the claim?', 'Can it be independently verified?'] },
  contextCheck: { label: 'Context Check', icon: CalendarClock, prompts: ['Is the content recent?', 'Is it in its original context?'] },
  emotionalCheck: { label: 'Emotional Check', icon: HeartPulse, prompts: ['Does it try to make you angry, scared, or excited?', 'Are you reacting emotionally instead of rationally?'] }
};

const CONCEPT_LABELS = {
  misinformation: 'Misinformation',
  disinformation: 'Disinformation',
  deepfake: 'Deepfakes',
  fabricated_article: 'Fabricated Articles',
  bot_amplification: 'Bots & Fake Accounts',
  clickbait: 'Clickbait',
  emotional_manipulation: 'Emotional Manipulation',
  none: null
};

const EXAMPLES = [
  'Scientists discover a new mineral on the ocean floor',
  'Drinking celery juice every morning melts belly fat overnight',
  'City announces emergency curfew starting tonight, sources say'
];

const SYSTEM_PROMPT = `You are a media literacy fact-checking assistant for a tool called Reality Check. The user gives you a headline or short claim.

Steps:
1. Run at most 2 web searches to find what reputable sources currently report about this claim.
2. Evaluate it across four dimensions: source credibility, evidence, context/recency, and emotional tone of the framing.
3. Decide an overall credibility score (0-100, where 100 = clearly accurate and well-sourced, 0 = clearly false or fabricated) and a label.
4. Identify the single most relevant media literacy concept for this case, if any.

After your research, respond with ONLY a JSON object - no markdown fences, no extra commentary, nothing before or after it - in exactly this shape:

{
  "overallScore": number from 0-100,
  "overallLabel": "Likely Reliable" or "Mixed / Uncertain" or "Likely Misleading",
  "summary": "one or two short sentences, max 30 words",
  "sourceCheck": { "verdict": "good" or "caution" or "bad", "finding": "max 20 words" },
  "evidenceCheck": { "verdict": "good" or "caution" or "bad", "finding": "max 20 words", "sources": [ { "title": "short source name", "url": "https://..." } ] },
  "contextCheck": { "verdict": "good" or "caution" or "bad", "finding": "max 20 words" },
  "emotionalCheck": { "verdict": "good" or "caution" or "bad", "finding": "max 20 words" },
  "relevantConcept": one of "misinformation", "disinformation", "deepfake", "fabricated_article", "bot_amplification", "clickbait", "emotional_manipulation", "none",
  "conceptNote": "one short sentence explaining why this concept applies, or empty string if none"
}

Include at most 2 sources for evidenceCheck. If you cannot find relevant search results, say so honestly in the findings and lower the score accordingly. Be objective and base verdicts on what the search results actually show, not assumptions.`;

function getScoreStyle(score, darkMode) {
  if (score >= 70) return darkMode
    ? { ring: '#22c55e', text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-800' }
    : { ring: '#16a34a', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
  if (score >= 40) return darkMode
    ? { ring: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-800' }
    : { ring: '#d97706', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' };
  return darkMode
    ? { ring: '#ef4444', text: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-800' }
    : { ring: '#dc2626', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' };
}

function getVerdictStyles(darkMode) {
  return {
    good: { icon: CheckCircle, badge: darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700', label: 'Looks OK' },
    caution: { icon: AlertTriangle, badge: darkMode ? 'bg-amber-900/40 text-amber-400' : 'bg-amber-100 text-amber-700', label: 'Use Caution' },
    bad: { icon: XCircle, badge: darkMode ? 'bg-red-900/40 text-red-400' : 'bg-red-100 text-red-700', label: 'Red Flag' }
  };
}

function ScoreGauge({ score, color, trackColor }) {
  const r = 60;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke={trackColor} strokeWidth="10" />
        <circle
          cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs" style={{ color: trackColor }}>/ 100</span>
      </div>
    </div>
  );
}

export default function RealityCheck() {
  const [input, setInput] = useState('');
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showGlossary, setShowGlossary] = useState(false);
  const [expandedTerms, setExpandedTerms] = useState(new Set());
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const VERDICT_STYLES = getVerdictStyles(darkMode);

  const ui = darkMode ? {
    page: 'bg-slate-900 text-slate-100',
    card: 'bg-slate-800 border-slate-700',
    inputBg: 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500',
    chip: 'bg-slate-700 text-slate-300 hover:bg-slate-600',
    heading: 'text-slate-50',
    subheading: 'text-slate-400',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    textMuted: 'text-slate-500',
    border: 'border-slate-700',
    glossaryBorder: 'border-slate-700',
    link: 'text-blue-400',
    errorBg: 'bg-red-900/30 border-red-800 text-red-300',
    panelAlt: 'bg-slate-900/50 border-slate-700',
    trackColor: '#334155'
  } : {
    page: 'bg-slate-50 text-slate-800',
    card: 'bg-white border-slate-200',
    inputBg: 'bg-white border-slate-200 text-slate-800 placeholder-slate-400',
    chip: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    heading: 'text-slate-900',
    subheading: 'text-slate-500',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    border: 'border-slate-200',
    glossaryBorder: 'border-slate-100',
    link: 'text-blue-600',
    errorBg: 'bg-red-50 border-red-200 text-red-700',
    panelAlt: 'bg-slate-50 border-slate-200',
    trackColor: '#e2e8f0'
  };

  async function handleAnalyze() {
    const trimmed = input.trim();
    if (!trimmed || !apiKey.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setClaim(trimmed);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: trimmed }],
          tools: [{ type: 'web_search_20250305', name: 'web_search' }]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || 'Request failed');

      const textBlocks = (data.content || []).filter(b => b.type === 'text').map(b => b.text);
      const fullText = textBlocks.join('\n');
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('no-json');
      const parsed = JSON.parse(jsonMatch[0]);

      setResult(parsed);
      setHistory(prev => [{ id: Date.now(), claim: trimmed, result: parsed }, ...prev].slice(0, 8));
    } catch (e) {
      if (e.message === 'no-json') {
        setError("Couldn't parse the analysis. Please try again.");
      } else {
        setError(`Couldn't complete the analysis: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleTerm(id) {
    setExpandedTerms(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function loadFromHistory(item) {
    setClaim(item.claim);
    setInput(item.claim);
    setResult(item.result);
    setError(null);
  }

  function reset() {
    setInput('');
    setResult(null);
    setClaim('');
    setError(null);
  }

  return (
    <div className={`min-h-screen transition-colors ${ui.page}`}>
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">

        <div className="flex items-center justify-end mb-2">
          <button
            onClick={() => setShowSettings(s => !s)}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition ${ui.chip}`}
          >
            <Settings size={16} /> Settings
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white mb-3">
            <ShieldCheck size={24} />
          </div>
          <h1 className={`text-3xl font-bold ${ui.heading}`}>Reality Check</h1>
          <p className={`${ui.subheading} mt-1`}>Pause, investigate, and think before you share.</p>
        </div>

        {showSettings && (
          <div className={`rounded-2xl border p-5 mb-6 ${ui.card}`}>
            <div className={`flex items-center gap-2 font-semibold mb-3 ${ui.textPrimary}`}>
              <Key size={18} /> Anthropic API Key
            </div>
            <div className="flex gap-2">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className={`flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${ui.inputBg}`}
              />
              <button
                onClick={() => setShowApiKey(s => !s)}
                className={`px-3 rounded-xl border ${ui.border} ${ui.textSecondary}`}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className={`text-xs mt-2 ${ui.textSecondary}`}>
              Don't have a key? Get one from the{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className={`${ui.link} hover:underline`}>
                Anthropic Console
              </a>.
            </p>

            <div className={`flex items-start gap-2 mt-3 p-3 rounded-xl border ${ui.panelAlt}`}>
              <Lock size={14} className={`mt-0.5 flex-shrink-0 ${ui.textSecondary}`} />
              <p className={`text-xs ${ui.textSecondary}`}>
                Reality Check operates entirely within your browser. Your API key is transmitted directly to Anthropic's servers to process each request and is never sent to, or stored on, any server operated by the developer of this application or any other third party.
              </p>
            </div>

            <div className={`flex items-center justify-between mt-4 pt-4 border-t ${ui.border}`}>
              <div className={`flex items-center gap-2 font-medium text-sm ${ui.textPrimary}`}>
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                Dark Mode
              </div>
              <button
                onClick={() => setDarkMode(d => !d)}
                className={`relative w-11 h-6 rounded-full transition ${darkMode ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        )}

        <div className={`rounded-2xl shadow-sm border p-5 mb-6 ${ui.card}`}>
          <label className={`block text-sm font-medium mb-2 ${ui.textPrimary}`}>Headline or claim to check</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. Scientists confirm new planet found in our solar system"
            className={`w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ui.inputBg}`}
            rows={3}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setInput(ex)}
                className={`text-xs px-3 py-1.5 rounded-full transition ${ui.chip}`}
              >
                {ex.length > 42 ? ex.slice(0, 42) + '…' : ex}
              </button>
            ))}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim() || !apiKey.trim()}
            className="mt-4 w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Researching…' : 'Run Reality Check'}
          </button>
          {!apiKey.trim() && (
            <p className={`text-xs mt-2 ${ui.textSecondary}`}>
              Add your Anthropic API key in{' '}
              <button onClick={() => setShowSettings(true)} className={`${ui.link} hover:underline font-medium`}>
                Settings
              </button>{' '}
              to run a check.
            </p>
          )}
        </div>

        {loading && (
          <div className={`rounded-2xl border p-8 mb-6 text-center ${ui.card}`}>
            <Loader2 className="animate-spin mx-auto mb-3 text-blue-500" size={28} />
            <p className={`text-sm ${ui.textSecondary}`}>Searching the web and analyzing "{claim}"…</p>
          </div>
        )}

        {error && (
          <div className={`border rounded-xl p-4 mb-6 text-sm ${ui.errorBg}`}>
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 mb-6">
            <div className={`rounded-2xl border p-5 ${getScoreStyle(result.overallScore, darkMode).bg} ${getScoreStyle(result.overallScore, darkMode).border}`}>
              <p className={`text-xs uppercase tracking-wide mb-2 ${ui.textMuted}`}>Checking</p>
              <p className={`font-medium mb-4 ${ui.textPrimary}`}>"{claim}"</p>
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <ScoreGauge
                  score={result.overallScore}
                  color={getScoreStyle(result.overallScore, darkMode).ring}
                  trackColor={ui.trackColor}
                />
                <div>
                  <div className={`inline-block text-sm font-semibold px-3 py-1 rounded-full mb-2 border ${getScoreStyle(result.overallScore, darkMode).bg} ${getScoreStyle(result.overallScore, darkMode).text} ${getScoreStyle(result.overallScore, darkMode).border}`}>
                    {result.overallLabel}
                  </div>
                  <p className={`text-sm ${ui.textSecondary}`}>{result.summary}</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {Object.keys(CHECK_META).map(key => {
                const meta = CHECK_META[key];
                const check = result[key];
                if (!check) return null;
                const vs = VERDICT_STYLES[check.verdict] || VERDICT_STYLES.caution;
                const Icon = meta.icon;
                const VIcon = vs.icon;
                return (
                  <div key={key} className={`rounded-2xl border p-4 ${ui.card}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex items-center gap-2 font-semibold ${ui.textPrimary}`}>
                        <Icon size={18} />
                        {meta.label}
                      </div>
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${vs.badge}`}>
                        <VIcon size={14} />
                        {vs.label}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${ui.textSecondary}`}>{check.finding}</p>
                    <ul className={`text-xs space-y-1 ${ui.textMuted}`}>
                      {meta.prompts.map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                    {check.sources && check.sources.length > 0 && (
                      <div className={`mt-2 pt-2 border-t space-y-1 ${ui.glossaryBorder}`}>
                        {check.sources.map((s, i) => (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 text-xs hover:underline ${ui.link}`}>
                            <ExternalLink size={12} /> {s.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {CONCEPT_LABELS[result.relevantConcept] && (
              <div className={`rounded-2xl border p-4 ${darkMode ? 'border-blue-800 bg-blue-900/30' : 'border-blue-200 bg-blue-50'}`}>
                <div className={`flex items-center gap-2 font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  <BookOpen size={18} />
                  Concept spotlight: {CONCEPT_LABELS[result.relevantConcept]}
                </div>
                <p className={`text-sm mb-2 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{result.conceptNote}</p>
                <button
                  onClick={() => {
                    setShowGlossary(true);
                    setExpandedTerms(prev => new Set(prev).add(result.relevantConcept));
                  }}
                  className={`text-xs font-medium hover:underline ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  Learn more in the glossary →
                </button>
              </div>
            )}

            <p className={`text-xs text-center ${ui.textMuted}`}>
              AI-assisted analysis based on a live web search - always verify important claims yourself with primary sources.
            </p>

            <button onClick={reset} className={`flex items-center gap-2 text-sm mx-auto hover:underline ${ui.textSecondary}`}>
              <RotateCcw size={14} /> Start a new check
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="mb-6">
            <p className={`text-xs uppercase tracking-wide mb-2 flex items-center gap-1 ${ui.textMuted}`}>
              <Clock size={12} /> Recent checks
            </p>
            <div className="flex flex-col gap-2">
              {history.map(item => (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className={`flex items-center justify-between border rounded-xl px-3 py-2 text-left hover:border-blue-400 transition ${ui.card}`}
                >
                  <span className={`text-sm truncate pr-3 ${ui.textSecondary}`}>{item.claim}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${getScoreStyle(item.result.overallScore, darkMode).bg} ${getScoreStyle(item.result.overallScore, darkMode).text}`}>
                    {item.result.overallScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`rounded-2xl border overflow-hidden ${ui.card}`}>
          <button onClick={() => setShowGlossary(s => !s)} className={`w-full flex items-center justify-between px-5 py-4 font-semibold ${ui.textPrimary}`}>
            <span className="flex items-center gap-2"><BookOpen size={18} /> Media Literacy Glossary</span>
            {showGlossary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {showGlossary && (
            <div className="px-5 pb-4 space-y-2">
              {GLOSSARY.map(item => {
                const isOpen = expandedTerms.has(item.id);
                const Icon = item.icon;
                return (
                  <div key={item.id} className={`border rounded-xl ${ui.glossaryBorder}`}>
                    <button onClick={() => toggleTerm(item.id)} className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium ${ui.textPrimary}`}>
                      <span className="flex items-center gap-2">
                        <Icon size={16} className={ui.textMuted} />
                        {item.term}
                      </span>
                      {isOpen ? <ChevronUp size={16} className={ui.textMuted} /> : <ChevronDown size={16} className={ui.textMuted} />}
                    </button>
                    {isOpen && <p className={`px-4 pb-3 text-sm ${ui.textSecondary}`}>{item.def}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}