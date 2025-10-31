import { useState, useEffect } from 'react'
import { MessageCircle, Users, Loader2, Sparkles, Copy, ChevronDown, LogOut, Share2, Download, X } from 'lucide-react'
import html2canvas from 'html2canvas'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
import { Input } from './components/ui/input'
import { Card } from './components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible'
import { blink } from './blink/client'
import { useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu'
import toast, { Toaster } from 'react-hot-toast'

// Sample synthetic chat for testing
const SYNTHETIC_CHAT = `Alex: Hey team! Just finished the project presentation 🎉
Jordan: Nice! Let's celebrate this weekend
Casey: lol finally done with that
Alex: Super excited about how it turned out. Jordan, what did you think of the flow?
Jordan: honestly the story arc was perfect, I loved the pacing you set up
Alex: Thanks! I really tried to make it flow naturally. Casey thoughts?
Casey: looked fine
Alex: Would love your feedback too! What could we improve?
Jordan: I think we should emphasize the data section more. Super compelling stuff
Alex: Good call, noted. Casey?
Casey: idk its good enough
Alex: I appreciate that. Let me know if anything comes up!
Jordan: I'm thinking we should do a debrief? I can share my detailed notes
Alex: YES please! That would be so helpful for next project
Casey: not really necessary but ok
Jordan: I've been thinking about team dynamics and I'm impressed with the collab
Alex: Aww thanks Jordan, means a lot. Your attention to detail made the difference
Casey: yep good work everyone
Jordan: Alex, your leadership really shaped this whole thing positively
Alex: That's so kind of you to say. I learned a lot from your feedback process
Casey: same
Jordan: Think we should grab coffee and celebrate properly?
Alex: Absolutely! Would love that. Casey you in?
Casey: sure why not
Alex: Can't wait to decompress with you both!
Jordan: This whole experience reinforced how much I value working with you both
Alex: Same energy. You two made this genuinely fun
Casey: ok cool`

const LOADING_MESSAGES = [
  "Detecting sarcasm levels... 😏",
  "Measuring chaos energy... 🌀",
  "Calculating group harmony... 🎵",
  "Reading between the lines... 👀",
  "Analyzing emoji usage... ✨"
]

const PLAYFUL_SLOGANS = [
  "Prepare to be dazzled",
  "Getting the tea ready",
  "Decoding your vibes",
  "Unlocking social secrets",
  "Reading the room",
  "Vibes are loading",
  "Plot twist incoming",
  "Analyzing the energy",
  "Friends or foes?",
  "Let's spill the truth"
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
  socialVibe: string
  socialVibeScore: number
  reciprocityStyle: number
  reciprocityCategory: string
  socialPresence: number
  socialPresenceCategory: string
  communicationPattern: string
  isCurrentUser: boolean
}

interface GroupReport {
  score: number
  summary: string
}

interface TokenPackage {
  priceId: string
  tokens: number
  price: number
  savings?: number
}

const getReciprocityCategory = (score: number): string => {
  if (score <= 2.5) return 'Extreme Taker'
  if (score <= 5) return 'Taker'
  if (score <= 7.5) return 'Giver'
  return 'Extreme Giver'
}

const TOKEN_PACKAGES: TokenPackage[] = [
  { priceId: 'price_1SL21LCvKngy5LHX2Wd4g1g7', tokens: 5, price: 4.99 },
  { priceId: 'price_1SL21MCvKngy5LHXVvlL6oMU', tokens: 15, price: 9.99, savings: 5 },
  { priceId: 'price_1SL21MCvKngy5LHXvy8LtMuA', tokens: 40, price: 19.99, savings: 20 }
]

const getSocialPresenceCategory = (score: number): string => {
  if (score <= 2) return 'Never Around'
  if (score <= 5) return 'Sometimes Around'
  if (score <= 8) return 'Mostly Present'
  return 'Always Present'
}

// Define SignInModal component since it was imported but not defined
const SignInModal = ({ open, onOpenChange, onSignInSuccess }: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  onSignInSuccess: () => void 
}) => {
  const handleGoogleSignIn = async () => {
    try {
      await blink.auth.signInWithGoogle()
      onSignInSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Google sign-in failed:', error)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sign In Required</h3>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Please sign in to share your vibe report with others.
        </p>

        <Button onClick={handleGoogleSignIn} className="w-full">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </Button>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState('')
  const [chatText, setChatText] = useState('')
  const [report, setReport] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [playfulSlogan, setPlayfulSlogan] = useState('')
  const [peopleReports, setPeopleReports] = useState<PersonReport[]>([])
  const [groupReport, setGroupReport] = useState<GroupReport | null>(null)
  const [isCopied, setIsCopied] = useState(false)
  const [isSynthetic, setIsSynthetic] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [pendingShareAction, setPendingShareAction] = useState(false)
  const [shareImage, setShareImage] = useState<string | null>(null)
  const [credits, setCredits] = useState(0)
  const [guestCredits, setGuestCredits] = useState(2)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isLoadingCredits, setIsLoadingCredits] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)
  const reportContainerRef = useRef<HTMLDivElement>(null)

  // Check for successful payment return
  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const isSuccess = urlParams.get('success') === 'true'
  const creditsParam = urlParams.get('credits')

  // Prevent double processing if already handled once in this session
  // const hasProcessed = sessionStorage.getItem('credits_added') 
    const hasProcessed = false
  if (isSuccess && creditsParam && !hasProcessed) {
    const creditsAdded = parseInt(creditsParam, 10)
    if (isNaN(creditsAdded)) return

    // console.log('✅ Stripe success detected. Adding credits:', creditsAdded)

    toast.success(`🎉 ${creditsAdded} credits added!`, { duration: 4000 })
    setShowUpgradeModal(false)

    if (user && user.id) {
      (async () => {
        try {
          // 1️⃣ Get the user's current credits
          const usersList = await blink.db.users?.list({ where: { id: user.id } })
          const currentCredits = Number(usersList?.[0]?.credits || 0)
          const newCredits = currentCredits + creditsAdded

          // 2️⃣ Update in Blink DB
          await blink.db.users?.update(user.id, { credits: newCredits })

          // 3️⃣ Update local state immediately
          setCredits(newCredits)

          // console.log(`✅ Credits successfully updated to ${newCredits}`)

          // 4️⃣ Mark as processed (avoid double increment)
          sessionStorage.setItem('credits_added', 'true')
        } catch (error) {
          console.error('❌ Failed to update credits after checkout:', error)
          toast.error('Could not update your credits. Please refresh.')
        }
      })()
    } else {
      console.warn('⚠️ No user found — cannot update credits.')
    }

    // 5️⃣ Clean up the URL after a brief delay
    setTimeout(() => {
      window.history.replaceState({}, '', window.location.pathname)
    }, 800)
  } else if (isSuccess && hasProcessed) {
    // console.log('ℹ️ Stripe success URL detected again but already processed — skipping.')
    setTimeout(() => {
      window.history.replaceState({}, '', window.location.pathname)
    }, 500)
  } else if (!isSuccess && !creditsParam) {
    // Normal load or refresh without Stripe params
    // console.log('ℹ️ Normal app load — no Stripe params found.')
  }
}, [user])


  const loadUserCredits = async (userId: string) => {
    try {
      setIsLoadingCredits(true)
      // Query the users table to get credits
      const usersList = await blink.db.users?.list({
        where: { id: userId }
      })
      
      if (usersList && usersList.length > 0) {
        const creditsValue = Number(usersList[0].credits) || 0
        // console.log('Loaded credits:', creditsValue)
        setCredits(creditsValue)
      } else {
        // Create new user with 2 credits
        await blink.db.users?.insert([{
          id: userId,
          credits: '2'
        }])
        // console.log('Created new user with 2 credits')
        setCredits(2)
      }
    } catch (error) {
      console.error('Failed to load or create user credits:', error)
      setCredits(0)
    } finally {
      setIsLoadingCredits(false)
    }
  }

  // Load guest credits when no user
  useEffect(() => {
    if (!user) {
      const stored = localStorage.getItem('guest_credits')
      const initial = stored !== null ? parseInt(stored, 10) : 2
      setGuestCredits(initial)
      if (stored === null) {
        localStorage.setItem('guest_credits', '2')
      }
    }
  }, [user])

  // Load credits whenever user is set (including after checkout)
  useEffect(() => {
    if (user && user.id) {
      loadUserCredits(user.id)
    }
  }, [user?.id])

  // Auth state listener
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      const prevUser = user
      setUser(state.user)
      
      // Execute pending share action after sign-in
      if (state.user && !prevUser && pendingShareAction) {
        setPendingShareAction(false)
        executeShareFlow()
      }
    })
    return unsubscribe
  }, [pendingShareAction])

  // Detect /synthetic route and auto-trigger analysis
  useEffect(() => {
    const path = window.location.pathname
    if (path.includes('/synthetic') || path.includes('synthetic')) {
      setIsSynthetic(true)
      setUserName('Alex')
      setChatText(SYNTHETIC_CHAT)
      // Trigger analysis after a short delay to ensure state is set
      setTimeout(() => {
        triggerAnalysis('Alex', SYNTHETIC_CHAT)
      }, 300)
    }
  }, [])

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

  // Set random slogan when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      const randomSlogan = PLAYFUL_SLOGANS[Math.floor(Math.random() * PLAYFUL_SLOGANS.length)]
      setPlayfulSlogan(randomSlogan)
    }
  }, [isAnalyzing])

  const parsePersonSection = (section: string): PersonReport | null => {
    // Extract name from 🧩 **Name** format
    const nameMatch = section.match(/🧩\s+\*\*([^*]+)\*\*/)
    let name = nameMatch ? nameMatch[1].trim() : null
    
    if (!name || name.length > 50 || name.trim() === '') return null

    const isCurrentUser = section.includes('**Your Reciprocity Style:**')

    // Extract Social Vibe score directly from the line
    const socialVibeMatch = section.match(/🪶\s+Social Vibe[:\s]*([0-9.]+)\s*\/\s*10\s*[—-]\s*\[([^\]]+)\]/i)
    let socialVibeScore = 5.0
    let socialVibe = 'Engaged participant'
    
    if (socialVibeMatch) {
      socialVibeScore = parseFloat(socialVibeMatch[1])
      socialVibe = socialVibeMatch[2].trim()
    }

    // Extract Reciprocity Style: X / 10
    const reciprocityMatch = section.match(/\*\*Your Reciprocity Style:\*\*\s*([0-9.]+)\s*\/\s*10|\*\*Reciprocity Style:\*\*\s*([0-9.]+)\s*\/\s*10/i)
    const reciprocityStyle = reciprocityMatch ? parseFloat(reciprocityMatch[1] || reciprocityMatch[2]) : 5
    const reciprocityCategory = getReciprocityCategory(reciprocityStyle)

    // Extract Social Presence: X / 10 
    const socialPresenceMatch = section.match(/\*\*Your Social Presence:\*\*\s*([0-9.]+)\s*\/\s*10|\*\*Social Presence:\*\*\s*([0-9.]+)\s*\/\s*10/i)
    const socialPresence = socialPresenceMatch ? parseFloat(socialPresenceMatch[1] || socialPresenceMatch[2]) : 5
    const socialPresenceCategory = getSocialPresenceCategory(socialPresence)

    // Extract Communication Pattern: paragraph after **Your Communication Pattern:** or **Communication Pattern:**
    const patternMatch = section.match(/\*\*Your Communication Pattern:\*\*\s*([^\n]+(?:\n(?!\*\*Your|\*\*[A-Z])[^\n]*)*?)|\*\*Communication Pattern:\*\*\s*([^\n]+(?:\n(?!\*\*[A-Z])[^\n]*)*?)/i)
    const communicationPattern = patternMatch ? (patternMatch[1] || patternMatch[2] || '').trim() : ''

    return {
      name: name.trim(),
      socialVibe,
      socialVibeScore,
      reciprocityStyle,
      reciprocityCategory,
      socialPresence,
      socialPresenceCategory,
      communicationPattern,
      isCurrentUser
    }
  }

  const triggerAnalysis = async (name: string, chat: string) => {
    if (!name.trim() || !chat.trim()) {
      toast.error('Please enter your name and paste your chat conversation')
      return
    }

    const isGuest = !user
    const currentCredits = isGuest ? guestCredits : credits

    // Check credits
    if (currentCredits < 1) {
      setShowUpgradeModal(true)
      toast.error('No credits left! Please upgrade to continue.')
      return
    }

    setIsAnalyzing(true)
    setReport('')
    setPeopleReports([])
    setGroupReport(null)

    try {
      const systemPrompt = `You are a social-language psychologist analyzing group chat conversations.

CRITICAL RULE: You MUST give each person DIFFERENT scores. If you give the same Social Vibe score to multiple people, you have FAILED this task.

Generate a detailed Vibe Report for ${name} using this EXACT format:

# ✨ Vibe Report

## ${name}

🧩 **${name}**
🪶 Social Vibe: X.X / 10 — [warm, observational 2-3 word phrase]

**Your Reciprocity Style:** X.X / 10
**Your Social Presence:** X.X / 10
**Your Communication Pattern:** [1-2 sentences analyzing tone, empathy, engagement, reciprocity]

---

[For EACH other participant - exact same structure, but WITHOUT "Your" language]

🧩 **[Name]**
🪶 Social Vibe: X.X / 10 — [warm, observational 2-3 word phrase]

**Reciprocity Style:** X.X / 10
**Social Presence:** X.X / 10
**Communication Pattern:** [1-2 sentences analyzing tone, empathy, engagement, reciprocity]

---

## 🌐 Group Social Vibe
Score: X.X / 10 — [warm, observational single-line reflection about collective energy]

---

SCORING METHOD - FOLLOW THIS EXACTLY:

STEP 1: COUNT MESSAGES
- Count how many messages each person sent
- Most messages = higher Social Presence (7-9)
- Medium messages = medium Social Presence (4-6)
- Fewest messages = lower Social Presence (2-4)

STEP 2: ANALYZE MESSAGE CONTENT
For Social Vibe, look at ACTUAL MESSAGE PATTERNS:
- Uses exclamation marks, emojis, encouragement = HIGH (7-9)
- Asks questions about others, validates feelings = HIGH (7-9)
- Long thoughtful responses = HIGH (7-9)
- Short responses like "ok", "lol", "sure" = LOW (2-4)
- Flat tone, minimal emotion = LOW (2-4)
- Never asks questions about others = LOW (2-4)

For Reciprocity Style:
- Asks 3+ questions about others = GIVER (7-9)
- Asks 1-2 questions = BALANCED (5-6)
- Asks 0 questions, only talks about self = TAKER (2-4)

STEP 3: ASSIGN SCORES THAT REFLECT DIFFERENCES
If Person A is enthusiastic and Person B is flat → Their scores MUST be 3+ points apart
If Person A sends 10 messages and Person B sends 3 → Social Presence must be 4+ points apart

MANDATORY SCORE SPREAD:
Between highest and lowest scorer: AT LEAST 4 points difference
Example:
- Highest: 8.5/10
- Middle: 6.2/10  
- Lowest: 3.8/10

❌ FORBIDDEN: Giving everyone 5.0/10 or similar scores
✅ REQUIRED: Clear numeric differences based on measurable behavior

CONCRETE EXAMPLE (use as template):
Alex (13 messages, enthusiastic, asks questions): Social Vibe 8.3/10, Reciprocity 7.5/10, Presence 9.0/10
Jordan (10 messages, supportive, validates): Social Vibe 7.8/10, Reciprocity 8.2/10, Presence 7.5/10
Casey (6 messages, short/flat responses): Social Vibe 3.2/10, Reciprocity 4.0/10, Presence 5.0/10

For ${name}, use "Your" language. For others, use NO "Your" or "you".

CHAT TO ANALYZE:
 ${chat}`

      let fullReport = ''

      await blink.ai.streamText(
        {
          messages: [
            { role: "user", content: systemPrompt }
          ],
          maxTokens: 6000
        },
        (chunk) => {
          fullReport += chunk
          setReport(fullReport)
        }
      )

      // Parse group score from Group Social Vibe section
      const groupScoreMatch = fullReport.match(/🌐\s+Group Social Vibe\s*\nScore[:\s]*([0-9.]+)\s*\/\s*10\s*[—-]\s*([^\n]+)/i)
      const groupScore = groupScoreMatch ? parseFloat(groupScoreMatch[1]) : 5.5
      const groupSummary = groupScoreMatch ? groupScoreMatch[2].trim() : 'A mix of energies and dynamics'

      setGroupReport({
        score: groupScore,
        summary: groupSummary
      })

      // Deduct credit
      const newCredits = Math.max(0, currentCredits - 1)
      if (isGuest) {
        setGuestCredits(newCredits)
        localStorage.setItem('guest_credits', newCredits.toString())
      } else {
        setCredits(newCredits)
          
        // Update users table with new credits
        await blink.db.users?.update(user.id, {
          credits: newCredits
        })
      }

      // Parse individual person sections
      const parsed: PersonReport[] = []
      
      // Split by person blocks starting with 🧩 **Name**
      const personRegex = /🧩\s+\*\*([^*]+)\*\*[\s\S]*?(?=🧩|🌐|##|$)/g
      let match
      
      while ((match = personRegex.exec(fullReport)) !== null) {
        const fullSection = match[0]
        const person = parsePersonSection(fullSection)
        if (person) {
          parsed.push(person)
        }
      }

      setPeopleReports(parsed)
    } catch (error) {
      console.error('Analysis failed:', error)
      setReport('Sorry, something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeChat = () => {
    triggerAnalysis(userName, chatText)
  }

  const resetAnalysis = () => {
    setReport('')
    setChatText('')
    setPeopleReports([])
    setGroupReport(null)
  }

  const handleGoogleSignIn = async () => {
    try {
      await blink.auth.signInWithGoogle()
    } catch (error) {
      console.error('Google sign-in failed:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await blink.auth.logout()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const generateShareCaption = () => {
    if (!groupReport || peopleReports.length === 0) return "Check out my social vibe report! 👇"
    
    const currentUserReport = peopleReports.find(p => p.isCurrentUser)
    const archetype = currentUserReport?.reciprocityCategory || 'Balanced'
    const vibeScore = groupReport.score.toFixed(1)
    const groupSize = peopleReports.length
    
    return `Here's what our group chat says about our vibe 👇\n\n🧩 Type: ${archetype}  •  💫 Vibe: ${vibeScore}/10  •  🤝 Group: ${groupSize} people`
  }

  const generateReportImage = async (): Promise<string | null> => {
    if (!reportContainerRef.current) return null
    
    try {
      const canvas = await html2canvas(reportContainerRef.current, {
        backgroundColor: '#FAFAFA',
        scale: 2,
        logging: false,
        width: 1080,
        height: 1920,
      })
      
      const image = canvas.toDataURL('image/png')
      return image
    } catch (error) {
      console.error('Failed to generate image:', error)
      return null
    }
  }

  const executeShareFlow = async () => {
    setIsExporting(true)
    
    try {
      const imageDataUrl = await generateReportImage()
      if (!imageDataUrl) {
        setIsExporting(false)
        return
      }

      setShareImage(imageDataUrl)

      // Try native share first
      if (navigator.share && navigator.canShare) {
        try {
          // Convert data URL to blob
          const blob = await (await fetch(imageDataUrl)).blob()
          const file = new File([blob], `vibe-report-${Date.now()}.png`, { type: 'image/png' })
          
          const shareData = {
            title: 'Social Vibe Report',
            text: generateShareCaption(),
            files: [file]
          }

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData)
            // Success toast
            return
          }
        } catch (shareError) {
          // console.log('Native share failed, showing modal:', shareError)
        }
      }

      // Fallback: show modal
      setShowShareModal(true)
    } catch (error) {
      console.error('Failed to share:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShareVibes = async () => {
    // Require Google login before sharing
    if (!user) {
      try {
        // Trigger Google sign-in flow immediately
        await blink.auth.signInWithGoogle()
        // After successful sign-in, the auth state listener will trigger executeShareFlow
        setPendingShareAction(true)
      } catch (error) {
        console.error('Google sign-in failed:', error)
        toast.error('Sign in required to share your vibe report')
      }
      return
    }
    
    // User is signed in, proceed with share
    await executeShareFlow()
  }

  const handleSignInSuccess = () => {
    // This will be triggered after successful sign-in
    // The auth state listener will handle the pending action
  }

  const handleBuyTokens = async (tokenPackage: TokenPackage) => {
    if (!user) {
      try {
        await blink.auth.signInWithGoogle()
        // After sign-in, trigger purchase
        setPendingShareAction(true)
      } catch (error) {
        console.error('Sign-in failed:', error)
        toast.error('Sign in required to purchase tokens')
      }
      return
    }

    try {
      // Create Stripe checkout session
      const successUrl = `${window.location.origin}/?success=true&credits=${tokenPackage.tokens}`
      const cancelUrl = window.location.origin
      
      const response = await blink.data.fetch({
        url: 'https://api.stripe.com/v1/checkout/sessions',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer {{STRIPE_SECRET_KEY}}',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `line_items[0][price]=${tokenPackage.priceId}&line_items[0][quantity]=1&mode=payment&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}&metadata[user_id]=${user.id}&metadata[tokens]=${tokenPackage.tokens}&customer_email=${encodeURIComponent(user.email || '')}&allow_promotion_codes=true`
      })

      // The response from blink.data.fetch includes a 'body' property
      let sessionData: any
      
      // Check if response has a body property
      if (response && typeof response === 'object' && 'body' in response) {
        const bodyContent = (response as any).body
        
        // Parse the body if it's a string
        if (typeof bodyContent === 'string') {
          try {
            sessionData = JSON.parse(bodyContent)
          } catch (e) {
            console.error('Failed to parse response body:', e)
            toast.error('Invalid response from payment provider')
            return
          }
        } else if (bodyContent && typeof bodyContent === 'object') {
          sessionData = bodyContent
        }
      } else if (typeof response === 'string') {
        // Fallback: try parsing response directly
        try {
          sessionData = JSON.parse(response)
        } catch (e) {
          console.error('Failed to parse response:', e)
        }
      } else if (response && typeof response === 'object') {
        // Direct object response
        sessionData = response
      }

      if (!sessionData) {
        console.error('No session data found in response:', response)
        toast.error('Failed to create checkout session')
        return
      }

      if (sessionData.url) {
        // Open in new tab for better UX
        window.open(sessionData.url, '_blank')
      } else {
        console.error('No checkout URL in session data:', sessionData)
        toast.error('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      toast.error('Failed to start checkout. Please try again.')
    }
  }

  // Cross-platform clipboard utility for text
  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Try modern Clipboard API first (works on web and most modern mobile)
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text)
        return true
      } catch (error) {
        // console.log('Clipboard API failed, trying fallback:', error)
      }
    }
    
    // Fallback for older browsers and mobile Safari
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      
      // Select text
      textArea.focus()
      textArea.select()
      
      // Try to copy
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      return success
    } catch (error) {
      console.error('Fallback copy failed:', error)
      return false
    }
  }

  const copyImageToClipboard = async () => {
    if (!shareImage) return
    
    try {
      const blob = await (await fetch(shareImage)).blob()
      
      // Try modern Clipboard API for images (iOS 16.1+, Android)
      if (navigator.clipboard && navigator.clipboard.write) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 2000)
          toast.success('📸 Image copied to clipboard!')
          return
        } catch (imageError) {
          // console.log('Image clipboard API failed, trying text fallback:', imageError)
        }
      }
      
      // Fallback: Copy as text data URL (works on most mobile devices)
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUrl = reader.result as string
        const success = await copyToClipboard(dataUrl)
        if (success) {
          setIsCopied(true)
          setTimeout(() => setIsCopied(false), 2000)
          toast.success('📸 Image copied to clipboard!')
        } else {
          toast.error('Failed to copy image. Try Download instead.')
        }
      }
      reader.onerror = () => {
        toast.error('Failed to read image')
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Failed to copy image:', error)
      toast.error('Failed to copy image. Try Download instead.')
    }
  }

  const copyCaption = async () => {
    const caption = generateShareCaption()
    const success = await copyToClipboard(caption)
    if (success) {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast.success('✅ Caption copied to clipboard!')
    } else {
      toast.error('Failed to copy caption')
    }
  }

  const downloadPNG = () => {
    if (!shareImage) return
    
    const link = document.createElement('a')
    link.href = shareImage
    link.download = `vibe-report-${Date.now()}.png`
    link.click()
  }

  const renderPersonCard = (person: PersonReport) => (
    <div key={person.name} className="bg-white rounded-lg border border-purple-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🧩</span>
          <h3 className="text-lg font-semibold text-purple-900">{person.name}</h3>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-2xl">🪶</span>
          <div>
            <p className="text-purple-900 font-bold">Social Vibe: {person.socialVibeScore.toFixed(1)}/10</p>
            <p className="text-sm text-purple-600">— {person.socialVibe}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-sm border-t border-purple-100 pt-4">
        <div>
          <p className="text-purple-600 font-medium">
            {person.isCurrentUser ? 'Your Reciprocity Style' : 'Reciprocity Style'}: {person.reciprocityStyle} / 10 ({person.reciprocityCategory})
          </p>
        </div>
        <div>
          <p className="text-purple-600 font-medium">
            {person.isCurrentUser ? 'Your Social Presence' : 'Social Presence'}: {person.socialPresence} / 10 ({person.socialPresenceCategory})
          </p>
        </div>
        {person.communicationPattern && (
          <div>
            <p className="text-purple-600 font-medium">{person.isCurrentUser ? 'Your Communication Pattern' : 'Communication Pattern'}:</p>
            <p className="text-gray-700 mt-1 leading-relaxed">{person.communicationPattern}</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <Toaster position="top-center" />
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
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-purple-200 hover:bg-purple-50 font-medium cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mr-2 text-amber-500" />
              {user && isLoadingCredits ? '...' : `${user ? credits : guestCredits} credits`}
            </Button>
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium"
              aria-label="Buy more credits"
            >
              Buy Credits
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-purple-50">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xs">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={handleGoogleSignIn} variant="outline" className="border-purple-200 hover:bg-purple-50">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </Button>
            )}
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
                Paste your group chat. The AI shows who gives, who takes, and who's just... there. Like having an expert psychologist in the room with you (but not so creepy).
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
        ) : isAnalyzing ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="text-center space-y-6">
              {/* Animated Loading Spinner */}
              <div className="flex justify-center">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 border-r-pink-600 animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl animate-pulse">✨</span>
                  </div>
                </div>
              </div>
              
              {/* Playful Slogan */}
              <div>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 min-h-[2rem] animate-fade-in">
                  {playfulSlogan}
                </p>
              </div>

              {/* Loading Messages Ticker */}
              {loadingMessage && (
                <p className="text-muted-foreground animate-pulse text-sm min-h-[1.5rem]">
                  {loadingMessage}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                This usually takes about 10 seconds...
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6" ref={reportRef}>
            <div ref={reportContainerRef} className="bg-white rounded-lg p-8 space-y-6" role="img" aria-label={`Vibe Report for ${userName} — ${peopleReports.find(p => p.isCurrentUser)?.reciprocityCategory || 'Balanced'}, score ${groupReport?.score.toFixed(1) || 'N/A'}/10`}>
              {/* Group Score Card with Animated Emojis */}
              {groupReport && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white text-center shadow-lg">
                  <h2 className="text-lg font-semibold mb-2">🌐 Group Social Vibe</h2>
                  <div className="text-5xl font-bold mb-4">{groupReport.score.toFixed(1)} / 10</div>
                  <p className="text-lg mb-6">{groupReport.summary}</p>
                  
                  {/* Animated emojis based on vibe score */}
                  <div className="flex justify-center gap-4 items-center h-16">
                    {groupReport.score >= 7.5 && (
                      <>
                        <span className="text-4xl animate-emoji-pop-pulse-1">🎉</span>
                        <span className="text-4xl animate-emoji-pop-pulse-2">✨</span>
                        <span className="text-4xl animate-emoji-pop-pulse-3">🎊</span>
                      </>
                    )}
                    {groupReport.score >= 5 && groupReport.score < 7.5 && (
                      <>
                        <span className="text-4xl animate-emoji-float-pulse-1">😊</span>
                        <span className="text-4xl animate-emoji-float-pulse-2">💬</span>
                        <span className="text-4xl animate-emoji-float-pulse-3">👫</span>
                      </>
                    )}
                    {groupReport.score < 5 && (
                      <>
                        <span className="text-4xl animate-emoji-slow-pulse-1">🤔</span>
                        <span className="text-4xl animate-emoji-slow-pulse-2">💭</span>
                        <span className="text-4xl animate-emoji-slow-pulse-3">👤</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Report Title */}
              <h1 className="text-3xl font-bold text-purple-900">✨ Vibe Report</h1>

              {/* People Cards */}
              {peopleReports.length > 0 ? (
                <div className="space-y-4">
                  {peopleReports.map(person => renderPersonCard(person))}
                </div>
              ) : (
                <Card className="p-8 text-center border-purple-200">
                  <p className="text-muted-foreground">No individual reports were parsed.</p>
                </Card>
              )}

              {/* Why This Feels Accurate */}
              <Card className="p-6 border-purple-200">
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
                    <h3 className="text-lg font-semibold text-purple-900">🌿 Why This Feels Accurate</h3>
                    <ChevronDown className="w-5 h-5 text-purple-600" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This report isn't just vibes—it's built on actual research about how language reveals personality and connection.
                    </p>
                    {CITATIONS.map((citation, index) => (
                      <div key={index} className="pl-4 border-l-2 border-purple-200">
                        <p className="font-semibold text-sm">{citation.title}</p>
                        <p className="text-sm italic text-muted-foreground">{citation.subtitle}</p>
                        <p className="text-xs text-muted-foreground mb-2">{citation.journal}</p>
                        <p className="text-sm">→ {citation.insight}</p>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground italic mt-4">
                      Disclaimer: This report is a playful snapshot of your chat patterns, not a personality diagnosis. Use it for fun insights, not life decisions. ☕
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>

            {/* Action Buttons */}
            {!isAnalyzing && (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={resetAnalysis} variant="outline" className="border-purple-200">
                  Analyze Another
                </Button>
                <Button
                  onClick={handleShareVibes}
                  disabled={isExporting}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      📤 Share My Vibes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Upgrade Modal - Fixed z-index and positioning */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Get More Credits</h2>
                <p className="text-purple-100">Each analysis uses 1 credit</p>
              </div>
              <button onClick={() => setShowUpgradeModal(false)} className="text-white hover:bg-white/20 rounded-lg p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {TOKEN_PACKAGES.map((pkg, idx) => (
                  <div key={idx} className={`border-2 rounded-lg p-6 transition-all ${idx === 1 ? 'border-purple-600 bg-purple-50 relative' : 'border-gray-200 hover:border-purple-300'}`}>
                    {idx === 1 && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    )}
                    <div className="mb-4">
                      <div className="text-3xl font-bold text-purple-900 mb-1">{pkg.tokens}</div>
                      <div className="text-sm text-gray-600">Credits</div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-gray-900">${pkg.price.toFixed(2)}</div>
                      {pkg.savings && (
                        <div className="text-sm text-green-600 font-medium">Save ${pkg.savings.toFixed(2)}</div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleBuyTokens(pkg)
                      }}
                      type="button"
                      className={`w-full px-4 py-2 rounded-lg font-semibold transition-all ${
                        idx === 1 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'border-2 border-purple-200 hover:bg-purple-50 text-purple-900'
                      }`}
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Testing? Use this 100% off promo code:
                    </p>
                    <div className="bg-white border-2 border-green-300 rounded-lg px-4 py-2 inline-block">
                      <code className="text-lg font-bold text-green-700">NAU1TNI4</code>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Enter this code at checkout to test with any credit card — you won't be charged!
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">What's included</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span> Full AI vibe analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span> Per-person breakdown
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span> Share & export reports
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span> No expiration on credits
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign-In Modal */}
      <SignInModal
        open={showSignInModal}
        onOpenChange={setShowSignInModal}
        onSignInSuccess={handleSignInSuccess}
      />

      {/* Share Fallback Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Your Vibe Report</h3>
              <button onClick={() => setShowShareModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              No share menu? Use Copy or Download instead.
            </p>

            <div className="space-y-2">
              <Button
                onClick={copyImageToClipboard}
                variant="outline"
                className="w-full justify-start"
              >
                <Copy className="w-4 h-4 mr-2" />
                {isCopied ? '✅ Copied!' : 'Copy Image'}
              </Button>

              <Button
                onClick={copyCaption}
                variant="outline"
                className="w-full justify-start"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Caption
              </Button>

              <Button
                onClick={downloadPNG}
                variant="outline"
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center py-8 text-sm text-muted-foreground">
        <p>Built with ✨ by Blink • A playful tool for social insights</p>
      </footer>
    </div>
  )
}

export default App