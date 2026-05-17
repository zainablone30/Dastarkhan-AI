"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

type ChatMessage = { role: "user" | "assistant"; content: string }
type Phase = "idle" | "peekIn" | "walk" | "walkFar" | "jump" | "spin" | "dance" | "runBack" | "happy"
type Mood  = "idle" | "happy" | "waving"

// ─── Formatting ──────────────────────────────────────────────────────────────

function renderInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <span key={i}>{part}</span>
  )
}

function FormattedMessage({ content }: { content: string }) {
  return (
    <div className="space-y-1.5 leading-relaxed">
      {content.split("\n").map((line, i) => {
        const t = line.trim()
        if (!t) return <div key={i} className="h-1" />
        if (t.startsWith("### "))
          return <p key={i} className="pt-1 text-[13px] font-bold uppercase tracking-wide text-orange-700">{t.replace(/^###\s+/, "")}</p>
        if (/^\*\*\d+\./.test(t))
          return <p key={i} className="mt-2 rounded-lg bg-white/70 px-2 py-1.5 font-semibold text-gray-950 shadow-sm">{renderInline(t)}</p>
        const lm = t.match(/^(Restaurant|Why|Tags|Price|Area):\s*(.*)$/i)
        if (lm)
          return <p key={i} className="text-gray-700"><span className="font-semibold text-gray-900">{lm[1]}:</span> {lm[2]}</p>
        if (/^[-*]\s+/.test(t))
          return <p key={i} className="pl-3 text-gray-700"><span className="mr-1 text-orange-500">*</span>{renderInline(t.replace(/^[-*]\s+/, ""))}</p>
        return <p key={i}>{renderInline(t)}</p>
      })}
    </div>
  )
}

// ─── Pingu SVG character ──────────────────────────────────────────────────────

function PinguCompanion({ mood }: { mood: Mood }) {
  return (
    <svg viewBox="0 0 200 215" className="w-full h-full drop-shadow-xl" style={{ overflow: "visible" }}>
      {/* Body */}
      <ellipse cx="100" cy="148" rx="52" ry="56" fill="#1a1a2e" />
      {/* White belly */}
      <ellipse cx="100" cy="153" rx="37" ry="43" fill="#f5f5f5" />
      {/* Head */}
      <circle cx="100" cy="73" r="47" fill="#1a1a2e" />
      {/* White face */}
      <ellipse cx="100" cy="78" rx="36" ry="32" fill="#f5f5f5" />
      {/* Chef hat base */}
      <ellipse cx="100" cy="30" rx="38" ry="19" fill="#fff" stroke="#ddd" strokeWidth="2" />
      <rect x="67" y="30" width="66" height="26" fill="#fff" />
      {/* Hat puff */}
      <ellipse cx="100" cy="19" rx="26" ry="16" fill="#fff" />
      {/* Hat orange stripe */}
      <rect x="67" y="41" width="66" height="5" fill="#ff9500" opacity="0.65" rx="1" />
      {/* Eyes */}
      <ellipse cx="83" cy="72" rx="9" ry="11" fill="#1a1a2e" />
      <ellipse cx="117" cy="72" rx="9" ry="11" fill="#1a1a2e" />
      {/* Eye shine */}
      <circle cx="85.5" cy="67.5" r="3.5" fill="#fff" />
      <circle cx="119.5" cy="67.5" r="3.5" fill="#fff" />
      {/* Beak */}
      <ellipse cx="100" cy="91" rx="13" ry="8.5" fill="#ff9500" />
      {/* Smile (when happy/waving) */}
      {mood !== "idle" && (
        <path d="M 89 96 Q 100 105 111 96" stroke="#e07a00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {/* Blush */}
      <ellipse cx="67" cy="82" rx="9.5" ry="6" fill="#ffb4b4" opacity="0.6" />
      <ellipse cx="133" cy="82" rx="9.5" ry="6" fill="#ffb4b4" opacity="0.6" />
      {/* Left wing — animated via framer */}
      <motion.ellipse
        cx="46" cy="130" rx="15" ry="37"
        fill="#1a1a2e"
        style={{ transformBox: "fill-box", transformOrigin: "30% 10%" }}
        animate={{ rotate: mood === "waving" ? -60 : -20 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
      />
      {/* Right wing */}
      <ellipse cx="154" cy="130" rx="15" ry="37" fill="#1a1a2e" transform="rotate(20 154 130)" />
      {/* Feet */}
      <ellipse cx="78" cy="200" rx="20" ry="10" fill="#ff9500" />
      <ellipse cx="122" cy="200" rx="20" ry="10" fill="#ff9500" />
      {/* Apron */}
      <path d="M 72 120 Q 100 110 128 120 L 123 166 Q 100 172 77 166 Z" fill="#fff" stroke="#e0e0e0" strokeWidth="2" />
      <rect x="85" y="137" width="30" height="21" rx="4" fill="#f0f0f0" stroke="#e0e0e0" />
    </svg>
  )
}

// ─── Quotes & helpers ─────────────────────────────────────────────────────────

const QUOTES = [
  "Bhook lagi hai? 🍛",
  "Biryani suggest karoon? 🤤",
  "Click karo, chat karein! 🐧",
  "Aaj kya khana hai? ✨",
  "Ghar ka khana best hai! 🫓",
  "Halka ya spicy? Batao! 🌶️",
  "Kuch achha dhundtay hain 😋",
]

const NAUGHTY_QUOTES = [
  "Naach ke dikhaata hoon! 💃",
  "Main superstar hoon! ⭐",
  "Weeeee! 🎉",
  "Pakad sako toh pakdo! 😜",
  "Yay yay yay yay! 🎊",
  "Koi dekh raha hai? 👀",
  "Pingu rocks! 🤘",
  "Haha gotcha! 😈",
  "I am free!! 🐧💨",
]

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

// ─── X position per phase ─────────────────────────────────────────────────────
// positive = right (off-screen edge), negative = walked out to the left

const X_BY_PHASE: Record<Phase, number> = {
  idle:     64,   // mostly hidden — peeks from right edge
  peekIn:    0,   // fully slides in
  walk:    -80,   // walks a good distance left
  walkFar: -180,  // runs WAY out — naughty mode
  jump:    -180,  // stays at walkFar x while jumping
  spin:    -180,  // stays at walkFar x while spinning
  dance:   -140,  // shuffles around while dancing
  runBack:  64,   // dashes back to hiding
  happy:     0,   // click celebration
}

const TRANSITION_BY_PHASE: Record<Phase, object> = {
  idle:     { type: "spring", stiffness: 70,  damping: 14 },
  peekIn:   { type: "spring", stiffness: 130, damping: 18 },
  walk:     { type: "spring", stiffness: 50,  damping: 10 },
  walkFar:  { type: "spring", stiffness: 90,  damping: 8  }, // fast rush out
  jump:     { type: "spring", stiffness: 200, damping: 22 }, // snap in place
  spin:     { type: "spring", stiffness: 200, damping: 22 },
  dance:    { type: "spring", stiffness: 60,  damping: 10 },
  runBack:  { type: "tween",  duration: 0.2,  ease: "easeIn" },
  happy:    { type: "spring", stiffness: 320, damping: 12 },
}

function getGesture(phase: Phase): object {
  switch (phase) {
    case "idle":
      return {
        y: [0, -6, 0],
        transition: { y: { repeat: Infinity, duration: 2.4, ease: "easeInOut" } },
      }
    case "peekIn":
      return { y: [0, -12, 0], transition: { duration: 0.7 } }
    case "walk":
      return {
        y:      [0, -8, 0, -8, 0],
        rotate: [-5, 5, -5, 5, -5],
        transition: { duration: 0.38, repeat: Infinity, ease: "easeInOut" },
      }
    case "walkFar":
      return {
        y:      [0, -10, 0, -10, 0],
        rotate: [-8, 8, -8, 8, -8],
        transition: { duration: 0.28, repeat: Infinity, ease: "easeInOut" },
      }
    case "jump":
      return {
        y:     [0, -70, 8, -50, 5, -30, 0, -14, 0],
        scale: [1, 1.15, 0.9, 1.12, 0.95, 1.08, 1, 1.04, 1],
        transition: { duration: 1.6, ease: "easeOut" },
      }
    case "spin":
      return {
        rotate: [0, 25, -25, 25, -25, 15, -10, 0],
        y:      [0, -20, 0, -20, 0, -10, 0],
        scale:  [1, 1.2, 0.85, 1.15, 0.9, 1.05, 1],
        transition: { duration: 1.0 },
      }
    case "dance":
      return {
        y:      [0, -30, 0, -30, 0, -30, 0, -20, 0],
        rotate: [-18, 18, -18, 18, -18, 18, -10, 0],
        scale:  [1, 1.12, 0.9, 1.12, 0.9, 1.12, 1, 1.05, 1],
        transition: { duration: 0.25, repeat: 5, ease: "easeInOut" },
      }
    case "runBack":
      return {
        rotate: [-10, 10, -10],
        transition: { duration: 0.09, repeat: Infinity },
      }
    case "happy":
      return {
        y:     [0, -35, 5, -22, 0, -10, 0],
        scale: [1, 1.25, 0.88, 1.18, 0.95, 1.08, 1],
        transition: { duration: 0.55 },
      }
    default:
      return {}
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PinguChatbot() {
  const [open, setOpen]       = useState(false)
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Assalam o Alaikum! Main Pingu hoon. Aaj kya khana hai? Mood, budget, ya health preference batao." },
  ])

  const [phase,      setPhase]      = useState<Phase>("idle")
  const [mood,       setMood]       = useState<Mood>("idle")
  const [showBubble, setShowBubble] = useState(false)
  const [bubbleText, setBubbleText] = useState("")

  const isRunning  = useRef(false)
  const cancelRef  = useRef(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Peek / walk / run-back cycle
  useEffect(() => {
    if (open) {
      cancelRef.current = true
      isRunning.current = false
      setShowBubble(false)
      return
    }

    cancelRef.current = false

    function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)] }

    async function go(fn: () => Promise<void>) {
      if (isRunning.current || cancelRef.current) return
      isRunning.current = true
      await fn()
      isRunning.current = false
    }

    // helper — set phase then wait, bail if cancelled
    async function phase(p: Phase, ms: number): Promise<boolean> {
      setPhase(p)
      await sleep(ms)
      return !cancelRef.current
    }

    // ── Routine A: quick wave and walk ────────────────────────────────────
    async function routineQuick() {
      setMood("waving")
      setBubbleText(pick(QUOTES))
      if (!await phase("peekIn", 600))  return
      setShowBubble(true)
      if (!await phase("peekIn", 1400)) return
      setShowBubble(false)
      if (!await phase("walk", 1200))   return
      setMood("idle")
      if (!await phase("runBack", 320)) return
      setPhase("idle")
    }

    // ── Routine B: run out far → jump spree → run back ────────────────────
    async function routineJump() {
      setMood("waving")
      if (!await phase("peekIn", 500)) return
      setBubbleText(pick(NAUGHTY_QUOTES))
      setShowBubble(true)
      if (!await phase("walkFar", 900)) return
      setShowBubble(false)
      // jump 2–3 times
      for (let i = 0; i < pick([2, 3]); i++) {
        if (cancelRef.current) return
        setPhase("jump")
        await sleep(1700)
        if (cancelRef.current) return
      }
      setBubbleText("Catch me if you can! 😜")
      setShowBubble(true)
      await sleep(700)
      setShowBubble(false)
      setMood("idle")
      if (!await phase("runBack", 280)) return
      setPhase("idle")
    }

    // ── Routine C: run out → wild dance → spin → run back ─────────────────
    async function routineDance() {
      setMood("waving")
      if (!await phase("peekIn", 500)) return
      setBubbleText(pick(NAUGHTY_QUOTES))
      setShowBubble(true)
      if (!await phase("walkFar", 800)) return
      setShowBubble(false)
      if (!await phase("dance", 1800)) return
      setBubbleText("🎉 Woohoo! 🎉")
      setShowBubble(true)
      if (!await phase("spin", 1100)) return
      setShowBubble(false)
      setMood("idle")
      if (!await phase("runBack", 280)) return
      setPhase("idle")
    }

    // ── Routine D: peek → walk → jump → walk closer → run back ────────────
    async function routineExplore() {
      setMood("waving")
      setBubbleText(pick(QUOTES))
      if (!await phase("peekIn", 600)) return
      setShowBubble(true)
      if (!await phase("walk", 1000))  return
      setShowBubble(false)
      if (!await phase("walkFar", 900)) return
      setBubbleText(pick(NAUGHTY_QUOTES))
      setShowBubble(true)
      if (!await phase("jump", 1700))  return
      setShowBubble(false)
      if (!await phase("dance", 1400)) return
      setMood("idle")
      if (!await phase("runBack", 280)) return
      setPhase("idle")
    }

    const ROUTINES = [routineQuick, routineQuick, routineJump, routineDance, routineExplore]

    async function playSequence() {
      await go(pick(ROUTINES))
    }

    const first    = setTimeout(playSequence, 2500)
    const interval = setInterval(playSequence, 9500)

    return () => {
      cancelRef.current = true
      isRunning.current = false
      clearTimeout(first)
      clearInterval(interval)
    }
  }, [open])

  function handleCharacterClick() {
    setPhase("happy")
    setMood("happy")
    setShowBubble(false)
    setTimeout(() => {
      setOpen(true)
    }, 460)
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg: ChatMessage = { role: "user", content: input.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput("")
    setLoading(true)
    try {
      const res  = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply || "Pingu ko response nahi mila. Dobara try karo.",
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Network masla lag raha hai yaar. Thori dair baad try karo.",
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Chatbot panel ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chatbot-panel"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-5rem)] overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-2xl sm:inset-x-auto sm:right-4 sm:w-[22rem]"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/20 p-1">
                  <PinguCompanion mood="happy" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Pingu Chef 🐧</p>
                  <p className="text-[11px] text-orange-100">Live menu se smart picks</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Close chatbot"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="max-h-[55dvh] space-y-3 overflow-y-auto bg-orange-50/40 p-3 sm:max-h-96">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[92%] rounded-2xl p-3 text-sm shadow-sm ${
                    m.role === "user"
                      ? "ml-auto bg-orange-500 text-white"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {m.role === "assistant" ? <FormattedMessage content={m.content} /> : m.content}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs italic text-gray-400">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    🐧
                  </motion.span>
                  Pingu best picks tayyar kar raha hai...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 border-t border-orange-100 bg-white p-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="budget biryani, healthy dinner..."
                className="flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-orange-400"
              />
              <button
                onClick={send}
                disabled={loading}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pingu companion ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="pingu-companion"
            className="fixed bottom-3 right-0 z-50 h-24 w-24 cursor-pointer sm:bottom-4 sm:h-28 sm:w-28"
            initial={{ x: X_BY_PHASE.idle }}
            animate={{ x: X_BY_PHASE[phase] }}
            transition={TRANSITION_BY_PHASE[phase]}
            exit={{ x: X_BY_PHASE.idle, opacity: 0, transition: { duration: 0.2 } }}
            whileHover={phase === "idle" ? { x: 0, scale: 1.08 } : { scale: 1.05 }}
            onClick={handleCharacterClick}
            aria-label="Open Pingu chatbot"
          >
            {/* Speech bubble */}
            <AnimatePresence>
              {showBubble && (
                <motion.div
                  key="bubble"
                  initial={{ opacity: 0, scale: 0.75, y: 8 }}
                  animate={{ opacity: 1, scale: 1,    y: 0 }}
                  exit={{    opacity: 0, scale: 0.75, y: 8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute -top-[68px] -left-[130px] z-10 w-[138px] rounded-2xl border-2 border-orange-200 bg-white px-3 py-2 shadow-lg"
                >
                  <p className="text-center text-[11px] font-semibold leading-snug text-gray-800">
                    {bubbleText}
                  </p>
                  {/* Tail pointing to Pingu */}
                  <div className="absolute -bottom-[9px] right-8 h-4 w-4 rotate-45 border-b-2 border-r-2 border-orange-200 bg-white" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* "Tap me" hint badge */}
            <AnimatePresence>
              {phase === "peekIn" && !showBubble && (
                <motion.div
                  key="tap-hint"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, y: 4 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow"
                >
                  tap me! 🐧
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sparkles — happy click or naughty phases */}
            <AnimatePresence>
              {(phase === "happy" || phase === "dance" || phase === "spin") && (
                <motion.div
                  key={`sparkle-${phase}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0.8, 0], scale: [0.4, 1.6, 1.2, 0.4] }}
                  transition={{ duration: phase === "dance" ? 0.5 : 0.55, repeat: phase === "dance" ? Infinity : 0 }}
                  className="pointer-events-none absolute -top-5 -right-3 text-2xl select-none"
                >
                  {phase === "spin" ? "🌀" : phase === "dance" ? "💃" : "✨"}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Naughty emoji floats up when walking far */}
            <AnimatePresence>
              {(phase === "walkFar" || phase === "jump") && (
                <motion.div
                  key="naughty-float"
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -40, scale: [0.5, 1.2, 1, 0.8] }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 text-xl select-none"
                >
                  😈
                </motion.div>
              )}
            </AnimatePresence>

            {/* Character with gesture wrapper */}
            <motion.div className="h-full w-full" animate={getGesture(phase) as any}>
              <PinguCompanion mood={mood} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
