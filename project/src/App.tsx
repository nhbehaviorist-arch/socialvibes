import { useState, useEffect } from 'react'
import { MessageCircle, Users, Loader2, Sparkles, Copy } from 'lucide-react'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
import { Input } from './components/ui/input'
import { Card } from './components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible'
import { blink } from './blink/client'
import { useRef } from 'react'

const LOADING_MESSAGES = [
  "Detecting sarcasm levels... 😏",
  "Measuring chaos energy... 🌀",
  "Calculating group harmony... 🎵",
  "Reading between the lines... 👀",
  "Analyzing emoji usage... ✨"
]

const CITATIONS = [
  {
    title: "Pennebaker, J. W., & King, L. A. (1999).",
    subtitle: "Linguistic styles: Language use as an individual difference.",
    journal: "Journal of Personality and Social Psychology, 77(6), 1296–1312.",
    insight: "Your word choices literally reveal who you are emotionally and personality-wise."
  },
  {
    title: "Niederhoffer, K. G., & Pennebaker, J. W. (2002).",
    subtitle: "Linguistic style matching in social interaction.",
    journal: "Journal of Language and Social Psychology, 21(4), 337–360.",
    insight: "When you really 'click' with someone, your language syncs up—that's a real thing."
  },
  {
    title: "Gonzales, A. L., Hancock, J. T., & Pennebaker, J. W. (2010).",
    subtitle: "Language style matching as a predictor of social dynamics in small groups.",
    journal: "Communication Research, 37(1), 3–19.",
    insight: "The way your texts align with others predicts whether you'll actually get along and work well together."
  },
  {
    title: "Grant, A. M. (2013).",
    subtitle: "Give and Take: A Revolutionary Approach to Success.",
    journal: "Viking Press.",
    insight: "This is where the whole Giver–Taker–Matcher framework comes from—it's legit social science."
  },
  {
    title: "Ireland, M. E., Slatcher, R. B., Eastwick, P. W., et al. (2011).",
    subtitle: "Language style matching predicts relationship initiation and stability.",
    journal: "Psychological Science, 22(1), 39–44.",
    insight: "Even tiny linguistic similarities predict whether relationships will actually last."
  }
]

interface PersonReport {
  name: string
  emoji: string
  vibeScore: number
  vibeDescriptor: string
  energy: number
  energyRole: string
  presence: number
  presenceDescriptor: string
  balance: string
  oneLiner: string
}

function App() {
  const [userName, setUserName] = useState('')
  const [chatText, setChatText] = useState('')
  const [report, setReport] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [peopleReports, setPeopleReports] = useState<PersonReport[]>([])
  const [groupScore, setGroupScore] = useState(0)
  const [groupSummary, setGroupSummary] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAnalyzing) {
      let index = 0
      setLoadingMessage(LOADING_MESSAGES[0])
      const interval = setInterval(() => {
        index = (index + 1) % LOADING_MESSAGES.length
        setLoadingMessage(LOADING_MESSAGES[index])
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isAnalyzing])

  const parsePersonSection = (section: string): PersonReport | null => {
    // Extract name from emoji headers - flexible matching for all names including Malik
    let nameMatch = section.match(/###\s*[🧩🍀]\s+(?:You\s*\(([^)]+)\)|([A-Za-z][A-Za-z\s]*?))\s*(?:\n|$)/)
    if (!nameMatch) {
      nameMatch = section.match(/[🧩🍀]\s+([A-Za-z][A-Za-z\s]*?)\s*(?:\n|:|$)/)
    }
    
    const name = nameMatch ? (nameMatch[1] || nameMatch[2]).trim() : null
    
    if (!name || name.length > 50 || name.trim() === '' || name.toLowerCase().includes('group')) return null

    // Extract vibe score and descriptor
    const vibeMatch = section.match(/Social Vibe[:\s]*\*?\*?([0-9]+)\s*\/\s*10\*?\*?[\s]*(?:—|-|\s+)([^\n]+)/i)
    
    // Extract energy with role - make optional group prefix
    const energyMatch = section.match(/(?:Your\s+)?Energy[:\s]*([0-9]+)\s*\/\s*10\s*\(([^)]+)\)/i)
    
    // Extract presence with descriptor - make optional group prefix
    const presenceMatch = section.match(/(?:Your\s+)?Presence[:\s]*([0-9]+)\s*\/\s*10\s*\(([^)]+)\)/i)
    
    // Extract balance section - improved to capture full content
    let balance = ''
    const balanceStart = section.indexOf('Your Balance:')
    const vibeStart = section.indexOf('Your Vibe:')
    if (balanceStart !== -1) {
      const balanceEnd = vibeStart !== -1 ? vibeStart : section.length
      balance = section.substring(balanceStart + 13, balanceEnd).trim()
      balance = balance.replace(/^\*\*[^*]*\*\*\s*[-:]?\s*/, '').trim()
      // Get full paragraph instead of cutting at 350 - allow up to 500 chars
      const paragraphs = balance.split('\n\n')
      balance = paragraphs[0] || balance.split('\n')[0]
      balance = balance.substring(0, 500)
    }
    
    // Extract one-liner from Your Vibe section
    let oneLiner = ''
    const oneLineStart = section.indexOf('Your Vibe:')
    if (oneLineStart !== -1) {
      const oneLineSection = section.substring(oneLineStart + 10)
      const quotedMatch = oneLineSection.match(/[""]([^""]*)[""]/i)
      if (quotedMatch) {
        oneLiner = quotedMatch[1].trim()
      } else {
        const sentenceMatch = oneLineSection.match(/(?:[^.!?])+[.!?]/)
        if (sentenceMatch) {
          oneLiner = sentenceMatch[0].trim()
        }
      }
    }

    const isYou = section.includes('🧩') || section.toLowerCase().includes('you (')
    
    return {
      name: name.trim(),
      emoji: isYou ? '🧩' : '🍀',
      vibeScore: vibeMatch ? Math.min(10, Math.max(1, parseInt(vibeMatch[1]))) : 5,
      vibeDescriptor: vibeMatch ? vibeMatch[2].trim().replace(/[*_]/g, '').substring(0, 120) : 'Unique communicator',
      energy: energyMatch ? Math.min(10, Math.max(1, parseInt(energyMatch[1]))) : 5,
      energyRole: energyMatch ? energyMatch[2].trim() : 'Balanced',
      presence: presenceMatch ? Math.min(10, Math.max(1, parseInt(presenceMatch[1]))) : 5,
      presenceDescriptor: presenceMatch ? presenceMatch[2].trim() : 'Consistent',
      balance: balance || 'Shows balanced engagement patterns.',
      oneLiner: oneLiner.substring(0, 150) || 'Engaged participant'
    }
  }

  const analyzeChat = async () => {
    if (!userName.trim() || !chatText.trim()) return
    setIsAnalyzing(true)
    setReport('')
    setPeopleReports([])
    setGroupScore(0)
    setGroupSummary('')

    try {
      const systemPrompt = `You are a warm, insightful social-language psychologist analyzing chat conversations.

YOUR TASK:
Analyze the chat deeply and generate a personalized, psychologically-informed vibe report. Each person should have DISTINCT, DYNAMIC insights based on their actual communication patterns—not generic labels. Use tiered explanations that reveal nuance.

STRICT OUTPUT FORMAT (follow exactly):

## Vibe Report for ${userName}
Social Chat Analyzer

---

### 🧩 You (${userName})
**Social Vibe: X / 10** — [specific descriptor reflecting their unique communication pattern and role in the group]

Your Energy: X / 10 (Giver/Taker/Balanced)
Your Presence: X / 10 (Always there/Sometimes/Rarely)
Your Balance: [2–3 sentences with SPECIFIC examples from the chat showing evidence of their actual communication pattern, personality quirks, and interpersonal style]
Your Vibe: "[Short insightful quote capturing their essence]"

### 🍀 [Person Name 1]
**Social Vibe: X / 10** — [specific descriptor reflecting THEIR unique communication pattern]

Your Energy: X / 10 (Giver/Taker/Balanced)
Your Presence: X / 10 (Always there/Sometimes/Rarely)
Your Balance: [2–3 sentences with SPECIFIC examples showing how they interact, their role, and communication style]
Your Vibe: "[Insightful one-liner about them]"

### 🍀 [Person Name 2]
**Social Vibe: X / 10** — [descriptor unique to this person]

Your Energy: X / 10 (Giver/Taker/Balanced)
Your Presence: X / 10 (Always there/Sometimes/Rarely)
Your Balance: [2–3 detailed sentences with examples]
Your Vibe: "[One-liner]"

[CONTINUE FOR EVERY PERSON - INCLUDE MALIK IF PRESENT - never skip anyone. Make sure EACH person has genuinely different scores and nuanced analysis]

---

### 🌐 Group Energy
**Group Score: X / 10**
[1–2 sentences about the overall group dynamic and harmony level]

_Disclaimer: Playful linguistic snapshot, not a personality diagnosis._

---

CRITICAL ANALYSIS RULES:
- Social Vibe Score: 1–10 measuring emotional alignment, reciprocity, and communication fit
- Energy Role: Giver (initiates support, asks questions) vs Taker (seeks support, rarely reciprocates) vs Balanced (healthy mutual exchange)
- Presence: Based on frequency AND depth of engagement in the chat
- Balance: Show REAL evidence—cite actual phrases, patterns, tone shifts, examples from their messages
- Vibe quote: Warm, specific, reveals something true about how they communicate
- UNIQUENESS: Each person must have different vibes, different scores, different insights based on their actual pattern
- Group Score: 1-3 chaotic, 4-6 mixed, 7-10 harmonious

TONE: Warm, insightful, human psychologist who gives specific, evidence-based feedback. Use tiered explanations (simple observation → deeper pattern → psychological insight).

---

CHAT TO ANALYZE:
${chatText}`

      let fullReport = ''

      await blink.ai.streamText(
        {
          messages: [
            { role: "user", content: systemPrompt }
          ],
          maxTokens: 4000
        },
        (chunk) => {
          fullReport += chunk
          setReport(fullReport)
        }
      )

      // Extract group score
      const groupScoreMatch = fullReport.match(/Group Score:\s*([0-9]+)\s*\/\s*10/)
      if (groupScoreMatch) {
        setGroupScore(parseInt(groupScoreMatch[1]))
      }

      // Extract group summary
      const groupSummaryMatch = fullReport.match(/Group Score:[^\n]*\n([^\n]+(?:\n[^\n]+)?)/)
      if (groupSummaryMatch) {
        setGroupSummary(groupSummaryMatch[1].trim())
      }

      // Parse individual person sections - split on ### emoji pattern
      const personSections = fullReport.split(/(?=###\s+[🧩🍀])/g).filter(s => s.trim())
      const parsed: PersonReport[] = []
      
      personSections.forEach(section => {
        const person = parsePersonSection(section)
        if (person) {
          parsed.push(person)
        }
      })

      setPeopleReports(parsed)
    } catch (error) {
      console.error('Analysis failed:', error)
      setReport('Sorry, something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setReport('')
    setChatText('')
    setPeopleReports([])
    setGroupScore(0)
    setGroupSummary('')
  }

  const copyReportToClipboard = () => {
    if (reportRef.current) {
      const text = reportRef.current.innerText
      navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const renderPersonCard = (person: PersonReport) => (
    <div key={person.name} className="bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-pink-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
          <span className="text-2xl">{person.emoji}</span>
          {person.name === `You (${userName})` ? (
            <span>
              You (<strong>{userName}</strong>)
            </span>
          ) : (
            person.name
          )}
        </h3>
      </div>

      <div className="space-y-3">
        {/* Social Vibe */}
        <div className="bg-white rounded-lg p-3">
          <p className="text-sm font-medium text-purple-700">
            🪶 Social Vibe: <strong>{person.vibeScore} / 10</strong> — {person.vibeDescriptor}
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <strong>Your Energy:</strong> {person.energy} / 10 ({person.energyRole})
          </p>
          <p>
            <strong>Your Presence:</strong> {person.presence} / 10 ({person.presenceDescriptor})
          </p>
          <p>
            <strong>Your Balance:</strong> {person.balance}
          </p>
        </div>

        {/* One-Liner */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 border-l-4 border-purple-400">
          <p className="text-sm italic text-purple-900">"{person.oneLiner}"</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-purple-100 bg-white/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Vibe Report</h1>
              <p className="text-xs text-muted-foreground">Social Chat Analyzer</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {!report ? (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Who Are Your REAL Friends?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
                Paste your group chat. The AI shows who gives, who takes, and who's just... there. Like having an expert psychologist in the room with you.
              </p>
            </div>

            <Card className="p-6 md:p-8 border-purple-200 shadow-xl bg-white/80 backdrop-blur">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">My name is...</label>
                  <Input
                    placeholder="e.g., Alex"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Here's my group chat
                  </label>
                  <Textarea
                    placeholder="Paste your chat logs..."
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    className="min-h-[300px] text-base"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Works with any chat format. The AI will automatically detect participants.</p>
                </div>

                <Button
                  onClick={analyzeChat}
                  disabled={!userName.trim() || !chatText.trim() || isAnalyzing}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Analyzing vibes...</span>
                      </div>
                      {loadingMessage && (
                        <span className="text-sm font-normal animate-pulse">{loadingMessage}</span>
                      )}
                    </div>
                  ) : (
                    <>🔍 Analyze My Social Vibes</>
                  )}
                </Button>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <Card className="p-6 border-purple-100 bg-white/60">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">💬 Your Chat Energy</h3>
                <p className="text-sm text-muted-foreground">
                  See how your tone, rhythm, and presence come through in messages — your emotional fingerprint in text.
                </p>
              </Card>
              <Card className="p-6 border-pink-100 bg-white/60">
                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="font-semibold mb-2">🤝 Your Reciprocity Style</h3>
                <p className="text-sm text-muted-foreground">
                  Find out who gives, who takes, and how balanced your friendships really are.
                </p>
              </Card>
              <Card className="p-6 border-purple-100 bg-white/60">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">💫 Your Social Vibe Score</h3>
                <p className="text-sm text-muted-foreground">
                  Get one number that captures closeness, trust, and how in-sync you are with your people.
                </p>
              </Card>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8" ref={reportRef}>
            {/* Report Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-purple-900 mb-1">
                Vibe Report for {userName}
              </h1>
              <p className="text-sm text-muted-foreground">Social Chat Analyzer</p>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mt-4"></div>
            </div>

            {/* Copy Button */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={copyReportToClipboard}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {isCopied ? 'Copied!' : 'Copy Report'}
              </Button>
              <Button
                onClick={resetAnalysis}
                variant="outline"
              >
                ← New Analysis
              </Button>
            </div>

            {/* People Cards */}
            {peopleReports.length > 0 && (
              <div className="space-y-6">
                {peopleReports.map(person => renderPersonCard(person))}
              </div>
            )}

            {/* Group Energy Section */}
            {groupScore > 0 && (
              <Card className="p-8 border-purple-200 shadow-xl bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 text-white">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">🌐 Group Energy</h2>
                  <div className="text-5xl font-bold">{groupScore} / 10</div>
                  {groupSummary && (
                    <p className="text-lg leading-relaxed opacity-95">{groupSummary}</p>
                  )}
                </div>
              </Card>
            )}

            {/* Citations Collapsible */}
            <Card className="p-6 border-purple-200">
              <Collapsible>
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                  <h3 className="text-lg font-semibold text-purple-900">📚 Why This Feels Accurate</h3>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This analysis is grounded in decades of peer-reviewed research on linguistic patterns, social dynamics, and communication psychology. Here's what we're drawing from:
                  </p>
                  {CITATIONS.map((citation, i) => (
                    <div key={i} className="border-l-4 border-purple-200 pl-4 py-2">
                      <p className="text-sm font-semibold text-purple-900">{citation.title}</p>
                      <p className="text-xs text-muted-foreground italic">{citation.subtitle}</p>
                      <p className="text-xs text-muted-foreground">{citation.journal}</p>
                      <p className="text-sm text-purple-700 mt-2">💡 {citation.insight}</p>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground italic mt-4">
                    Disclaimer: This is a playful linguistic snapshot based on conversation patterns, not a clinical personality assessment or diagnostic tool. Use it for fun insights, not life decisions!
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
