import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// CONSTANTS (mirrors HTML demo data + app.py API)
// ─────────────────────────────────────────────
const API_BASE = "/api";

const TOPIC_KEYWORDS = {
  "Data Structures":   ["data structures","arrays","trees","graphs","linked list","stack","queue","heap","hash","sorting","searching","algorithm"],
  "Operating Systems": ["operating systems","os","processes","threads","memory management","deadlock","scheduling","synchronization","semaphore","mutex"],
  "DBMS":              ["database","dbms","sql","nosql","normalization","indexing","transactions","acid","joins","query"],
  "Computer Networks": ["networking","tcp","udp","http","dns","osi","ip","routing","protocols","socket","rest","api"],
  "System Design":     ["system design","scalability","microservices","distributed","load balancing","caching","cdn","architecture"],
  "Web Development":   ["react","node","javascript","frontend","backend","html","css","web development","angular","vue"],
  "Machine Learning":  ["machine learning","ml","ai","deep learning","neural","model","training","python","tensorflow","pytorch"],
};

const IVD = {
  "Data Structures": {
    jd: ["Arrays & Sorting","Trees & BST","Time Complexity","Linked Lists","Graphs"],
    qs: [
      { text:"Explain how you would find if an element exists in an unsorted array of one million numbers. Walk me through your approach — and think about the cost.", topic:"Arrays & Sorting", weak:"Time Complexity" },
      { text:"You have a Binary Search Tree. A junior developer asks — why use a BST over a sorted array if both are sorted? How do you answer them?", topic:"Trees & BST", weak:"Depth of understanding" },
      { text:"Given a linked list, how would you detect a cycle? Don't just name the algorithm — explain WHY it works.", topic:"Linked Lists", weak:"Causal reasoning" },
    ],
  },
  "Operating Systems": {
    jd: ["Processes & Threads","Memory Management","Deadlocks","Scheduling","Synchronization"],
    qs: [
      { text:"Explain the difference between a process and a thread. Why would you choose one over the other in a real application?", topic:"Processes & Threads", weak:"Conceptual depth" },
      { text:"What is a deadlock? Describe a real-world scenario — outside computers — that mirrors how a deadlock happens.", topic:"Deadlocks", weak:"Analogy reasoning" },
      { text:"Walk me through what happens in memory from the moment you declare int x = 5 in C.", topic:"Memory Management", weak:"Low-level understanding" },
    ],
  },
  DBMS: {
    jd: ["Indexing","Transactions & ACID","Joins","Normalization","SQL"],
    qs: [
      { text:"Explain database indexing to a non-technical person. Then tell me — when would you NOT use an index?", topic:"Indexing", weak:"Trade-off thinking" },
      { text:"What does ACID stand for? Of the four properties, which one is hardest to implement and why?", topic:"Transactions & ACID", weak:"Depth beyond definition" },
      { text:"What is the difference between INNER JOIN and LEFT JOIN? Give me a scenario where using the wrong one breaks your application.", topic:"Joins", weak:"Applied understanding" },
    ],
  },
  "Computer Networks": {
    jd: ["DNS & HTTP","TCP vs UDP","OSI Model","Routing","Security"],
    qs: [
      { text:"Explain what happens at every layer from the moment you type google.com in your browser and press Enter.", topic:"DNS & HTTP", weak:"Systems thinking" },
      { text:"When would you choose UDP over TCP? Give a concrete example where using TCP would actually cause problems.", topic:"TCP vs UDP", weak:"Trade-off reasoning" },
      { text:"What is the OSI model and why does it exist? Be honest — do you think it is actually useful in practice?", topic:"OSI Model", weak:"Critical thinking" },
    ],
  },
};

const KW = {
  0: ["o(n)","linear","search","iterate","binary","hash","complexity","worst","best","average"],
  1: ["insert","search","o(log","balance","traversal","node","pointer","height","rotation"],
  2: ["fast","slow","pointer","floyd","cycle","two pointer","meet","next","null"],
  3: ["memory","stack","heap","context","switch","pid","kernel","user space","resource"],
  4: ["resource","wait","hold","circular","mutual","prevention","banker","dining","philosopher"],
  5: ["stack","heap","register","address","byte","compiler","variable","scope","static"],
  6: ["b-tree","lookup","faster","write","overhead","full scan","clustered","composite"],
  7: ["atomic","consistent","isolated","durable","transaction","rollback","commit","log"],
  8: ["null","match","left table","missing","outer","result","unmatched","all rows"],
  9: ["dns","tcp","ip","syn","ack","request","response","packet","layer","resolver"],
  10:["streaming","gaming","speed","latency","connectionless","loss","reliable","overhead"],
  11:["layer","physical","transport","application","abstraction","protocol","encapsulation"],
};

const SOC_FLOW = [
  "Good — I can see from your interview what we need to work on. Let me ask you something simple to start.\n\nYou have this array: 3, 7, 1, 9, 4, 2. I ask you to find if the number 9 exists. How many steps does your approach take — in the worst case?",
  "Good. Now if the array had one million elements instead of six, and the element does not exist — how many steps? Don't give me a number. Give me a formula in terms of N.",
  "Exactly — O(N). Linear time. Now think about this: if someone told you to do this lookup ten thousand times a day, what starts to bother you? And what would you change — not about the algorithm, but about how the data is organised?",
  "You are getting very close to something important. What if I told you there is a data structure where this lookup takes the same time whether the array has six elements or six million? You have heard of it. What is it — and why does it work that way?",
  "Perfect — a Hash Table. Now tell me WHY the lookup is O(1). Not just that it is — but the actual mechanism. What does a hash function actually do to make it constant time regardless of size?",
  "You arrived at it yourself — the hash function maps a key directly to a memory address. There is no searching. It is a direct jump.\n\nYou went from 'check every element' to 'calculate and jump'. That is the conceptual breakthrough.\n\n✓ Mastery achieved. Well done.",
];

const STRATEGIES = ["counter_example","scale_challenge","analogy","direct_probe","synthesis","guided_discovery"];
const STRAT_REASONS = [
  "Targeting weak causal link in your reasoning",
  "Using scale to expose the cost assumption",
  "Building analogy from concrete to abstract",
  "Probing the exact mechanism you glossed over",
  "Synthesising your scattered correct pieces",
  "Guiding you to the insight independently",
];

const TOPIC_CARDS = [
  { topic:"Data Structures", icon:"🌳", sub:"Arrays, Trees, Graphs" },
  { topic:"Operating Systems", icon:"⚙️", sub:"Processes, Memory, I/O" },
  { topic:"DBMS", icon:"🗄️", sub:"SQL, Indexing, ACID" },
  { topic:"Computer Networks", icon:"🌐", sub:"TCP/IP, DNS, HTTP" },
];

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function extractTopics(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const hits = keywords.filter(k => lower.includes(k)).length;
    if (hits >= 2) found.push({ topic, hits });
  }
  found.sort((a, b) => b.hits - a.hits);
  return found.slice(0, 5).map(f => f.topic);
}

function analyseAnswer(ans, qIdx) {
  const lower = ans.toLowerCase();
  const len = ans.trim().length;
  const kws = KW[qIdx % 12] || [];
  const hits = kws.filter(k => lower.includes(k)).length;
  const ratio = hits / Math.max(kws.length, 1);
  const depth = Math.min(92, Math.round(ratio * 78 + (len > 250 ? 14 : len > 120 ? 7 : 0)));
  const acc   = Math.min(88, Math.round(ratio * 72 + Math.random() * 10));
  const conf  = len > 60 ? Math.round(52 + Math.random() * 32) : Math.round(18 + Math.random() * 22);
  const cons  = Math.round(40 + ratio * 40 + Math.random() * 12);
  const orig  = len > 200 ? Math.round(55 + Math.random() * 28) : Math.round(20 + Math.random() * 30);
  const fluency = Math.max(
    18,
    Math.min(
      95,
      Math.round((len > 120 ? 40 : 20) + ratio * 45 + (/\b(um|uh|like)\b/gi.test(ans) ? -10 : 8)),
    ),
  );
  return { depth, acc, conf, cons, orig, fluency };
}

function buildConciseFeedback(scores, questionText) {
  const strengths = [];
  const weakAreas = [];
  if (scores.acc >= 65) strengths.push("accuracy");
  if (scores.depth >= 60) strengths.push("reasoning depth");
  if (scores.conf >= 60) strengths.push("confidence");
  if (scores.fluency >= 60) strengths.push("fluency");
  if (scores.acc < 55) weakAreas.push("concept accuracy");
  if (scores.depth < 50) weakAreas.push("depth of explanation");
  if (scores.conf < 45) weakAreas.push("confidence under pressure");
  if (scores.fluency < 50) weakAreas.push("delivery fluency");

  const concise =
    scores.acc >= 65 && scores.depth >= 60
      ? "Strong and structured response with good conceptual clarity."
      : scores.acc >= 50
        ? "Partially correct answer; improve depth and precision."
        : "Core concepts need reinforcement before progressing to advanced questions.";

  return {
    question: questionText,
    concise_feedback: concise,
    strengths: strengths.length ? strengths : ["attempted reasoning"],
    weak_areas: weakAreas.length ? weakAreas : ["minor edge-case handling"],
    metrics: {
      confidence: scores.conf,
      accuracy: scores.acc,
      depth: scores.depth,
      fluency: scores.fluency,
      consistency: scores.cons,
      originality: scores.orig,
    },
  };
}

function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

async function callApi(method, path, body, isFormData = false) {
  try {
    const opts = { method: method.toUpperCase() };
    if (body) {
      if (isFormData) { opts.body = body; }
      else { opts.headers = { "Content-Type": "application/json" }; opts.body = JSON.stringify(body); }
    }
    const resp = await fetch(`${API_BASE}${path}`, opts);
    if (!resp.ok) return null;
    return await resp.json();
  } catch { return null; }
}

// ─────────────────────────────────────────────
// VOICE ENGINE
// ─────────────────────────────────────────────
function useVoice() {
  const recogRef = useRef(null);
  const isListeningRef = useRef(false);
  const isSpeakingRef = useRef(false);

  const speak = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google"))
                   || voices.find(v => v.lang.startsWith("en"))
                   || voices[0];
    if (preferred) utter.voice = preferred;
    utter.rate = 0.92; utter.pitch = 1.0; utter.volume = 1;
    isSpeakingRef.current = true;
    utter.onend = () => { isSpeakingRef.current = false; onEnd?.(); };
    window.speechSynthesis.speak(utter);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
  }, []);

  const startListening = useCallback((onInterim, onFinal, onError) => {
    if (isSpeakingRef.current) stopSpeaking();
    if (isListeningRef.current) {
      recogRef.current?.stop();
      return false;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { onError?.("not-supported"); return false; }
    const r = new SpeechRecognition();
    r.continuous = true; r.interimResults = true; r.lang = navigator.language || "en-US";
    recogRef.current = r;
    isListeningRef.current = true;
    let accumulated = "";
    r.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (final) { accumulated += " " + final; onFinal?.(accumulated.trim()); }
      else onInterim?.(accumulated + " " + interim + "...");
    };
    r.onend = () => {
      isListeningRef.current = false;
      if (accumulated.trim()) onFinal?.(accumulated.trim());
    };
    r.onerror = (e) => { isListeningRef.current = false; onError?.(e.error); };
    r.start();
    return true;
  }, [stopSpeaking]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    isListeningRef.current = false;
  }, []);

  return { speak, stopSpeaking, startListening, stopListening, isSpeakingRef, isListeningRef };
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
:root{
  --bg:#09090f;--bg2:#111119;--bg3:#1c1c28;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.11);
  --text:#e6e6f0;--muted:#5e5e78;
  --accent:#7c6ff7;--accent2:#a78bfa;
  --teal:#2dd4bf;--amber:#fbbf24;--red:#f87171;--green:#34d399;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px;}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,.3);}50%{box-shadow:0 0 0 8px rgba(248,113,113,0);}}
@keyframes fadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@keyframes tb{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
`;

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function Header({ phase }) {
  const labels = ["setup","interview","gap analysis","learning mode","report"];
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",borderBottom:"1px solid var(--border)",background:"rgba(9,9,15,0.96)",backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100 }}>
      <div style={{ display:"flex",alignItems:"center",gap:9,fontSize:15,fontWeight:600,letterSpacing:"-.3px" }}>
        <div style={{ width:7,height:7,borderRadius:"50%",background:"var(--accent)",boxShadow:"0 0 10px var(--accent)" }}/>
        CognitiveInt <span style={{ color:"var(--muted)",fontWeight:300,margin:"0 5px" }}>×</span> SocraticMind
      </div>
      <div style={{ display:"flex",gap:5,alignItems:"center",fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:6,height:6,borderRadius:"50%",
            background: i < phase ? "var(--green)" : i === phase ? "var(--accent)" : "var(--border2)",
            boxShadow: i === phase ? "0 0 8px var(--accent)" : "none",
            transition:"all .3s"
          }}/>
        ))}
        <span style={{ marginLeft:6 }}>{labels[phase]}</span>
      </div>
    </div>
  );
}

// ── SCREEN 0: SETUP ──
function SetupScreen({ onStart }) {
  const [tab, setTab] = useState("paste");
  const [jdText, setJdText] = useState("");
  const [parsedTopics, setParsedTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [jdFromJD, setJdFromJD] = useState(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [scenarioMode, setScenarioMode] = useState("both");
  const [uploadNote, setUploadNote] = useState("");

  const parseJD = (text) => {
    setJdText(text);
    if (text.length < 30) { setParsedTopics([]); setSelectedTopic(null); return; }
    const topics = extractTopics(text);
    setParsedTopics(topics);
    if (topics.length > 0) { setSelectedTopic(topics[0]); setJdFromJD(topics); }
  };

  const handlePDF = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadNote("Parsing PDF...");
    const form = new FormData();
    form.append("file", file);

    callApi("post", "/jd/extract", form, true).then((resp) => {
      if (resp?.text) {
        parseJD(resp.text.slice(0, 5000));
        setTab("paste");
        setUploadNote(`PDF uploaded (${Math.min(resp.char_count || 0, 5000)} chars extracted). You can now start.`);
        return;
      }
      setUploadNote("Could not parse this PDF. Try pasting JD text directly.");
    });
  };

  const canStart = Boolean(selectedTopic || parsedTopics.length > 0 || jdText.trim().length >= 40);

  const handleStart = () => {
    const topic = selectedTopic || parsedTopics[0];
    onStart({ topic, jdText, jdFromJD, numQuestions, scenarioMode });
  };

  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px",minHeight:"calc(100vh - 54px)",position:"relative",overflow:"hidden" }}>
      {/* glow */}
      <div style={{ position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,111,247,.07) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none" }}/>
      <div style={{ maxWidth:560,width:"100%",position:"relative",zIndex:1 }}>
        <div style={{ display:"inline-flex",alignItems:"center",gap:6,padding:"5px 13px",borderRadius:100,border:"1px solid rgba(124,111,247,.3)",background:"rgba(124,111,247,.07)",fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"var(--accent2)",letterSpacing:.5,marginBottom:24 }}>
          ● HackMol 7.0 · Freshers Track
        </div>
        <h1 style={{ fontSize:"clamp(26px,4vw,40px)",fontWeight:700,letterSpacing:"-1.2px",lineHeight:1.1,marginBottom:10 }}>
          Know <span style={{ color:"var(--accent2)" }}>how</span> you think.<br/>Not just what you know.
        </h1>
        <p style={{ fontSize:14,color:"var(--muted)",lineHeight:1.6,marginBottom:32 }}>
          Paste your Job Description or upload a PDF — or pick a topic to begin a voice-first adaptive interview.
        </p>

        {/* Tabs */}
        <div style={{ display:"flex",border:"1px solid var(--border2)",borderRadius:10,overflow:"hidden",marginBottom:16 }}>
          {["paste","pdf","topic"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex:1,padding:10,fontSize:13,fontWeight:500,border:"none",background: tab===t ? "var(--bg3)" : "transparent",color: tab===t ? "var(--text)" : "var(--muted)",cursor:"pointer",transition:"all .2s",fontFamily:"'Space Grotesk',sans-serif" }}>
              {t === "paste" ? "Paste JD" : t === "pdf" ? "Upload PDF" : "Pick Topic"}
            </button>
          ))}
        </div>

        {tab === "paste" && (
          <textarea value={jdText} onChange={e => parseJD(e.target.value)} placeholder={"Paste job description here...\n\ne.g. We are looking for a Software Engineer with strong knowledge of Data Structures, System Design, Operating Systems and DBMS..."} rows={5} style={{ width:"100%",background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:10,padding:14,color:"var(--text)",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,resize:"none",outline:"none",minHeight:120,transition:"border-color .2s",lineHeight:1.6 }} onFocus={e => e.target.style.borderColor="var(--accent)"} onBlur={e => e.target.style.borderColor="var(--border2)"}/>
        )}

        {tab === "pdf" && (
          <div onClick={() => document.getElementById("pdf-input").click()} style={{ width:"100%",minHeight:100,border:"1.5px dashed var(--border2)",borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",padding:20,transition:"all .2s" }} onMouseOver={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.background="rgba(124,111,247,.04)"; }} onMouseOut={e => { e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.background="transparent"; }}>
            <div style={{ fontSize:24 }}>📄</div>
            <div style={{ fontSize:13,color:"var(--muted)" }}>Click to upload JD PDF</div>
            <div style={{ fontSize:11,color:"var(--muted)",opacity:.6 }}>PDF parsing uses backend extractor for better reliability</div>
            <input id="pdf-input" type="file" accept=".pdf" style={{ display:"none" }} onChange={handlePDF}/>
          </div>
        )}

        {tab === "topic" && (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:20 }}>
            {TOPIC_CARDS.map(({ topic, icon, sub }) => (
              <div key={topic} onClick={() => { setSelectedTopic(topic); setJdFromJD(null); }} style={{ padding:"13px 15px",borderRadius:9,border: selectedTopic===topic ? "1px solid var(--accent)" : "1px solid var(--border)",background: selectedTopic===topic ? "rgba(124,111,247,.09)" : "var(--bg2)",cursor:"pointer",transition:"all .2s",textAlign:"left" }}>
                <div style={{ fontSize:18,marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:13,fontWeight:600 }}>{topic}</div>
                <div style={{ fontSize:11,color:"var(--muted)",marginTop:2 }}>{sub}</div>
              </div>
            ))}
          </div>
        )}

        {parsedTopics.length > 0 && (
          <div style={{ marginTop:12,padding:"10px 14px",borderRadius:8,background:"rgba(52,211,153,.07)",border:"1px solid rgba(52,211,153,.2)",fontSize:12,color:"var(--green)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.6 }}>
            ✓ Extracted {parsedTopics.length} topics: {parsedTopics.join(" · ")}<br/>
            Primary topic for interview: <strong>{parsedTopics[0]}</strong>
          </div>
        )}
        {uploadNote && (
          <div style={{ marginTop:10,padding:"8px 12px",borderRadius:8,background:"rgba(45,212,191,.07)",border:"1px solid rgba(45,212,191,.2)",fontSize:12,color:"var(--teal)" }}>
            {uploadNote}
          </div>
        )}

        {/* Settings */}
        <div style={{ marginTop:20,padding:"14px",background:"var(--bg2)",borderRadius:10,border:"1px solid var(--border2)",display:"flex",gap:20,flexWrap:"wrap" }}>
          <label style={{ fontSize:12,color:"var(--muted)",display:"flex",flexDirection:"column",gap:5 }}>
            Questions
            <select value={numQuestions} onChange={e => setNumQuestions(+e.target.value)} style={{ background:"var(--bg3)",border:"1px solid var(--border2)",color:"var(--text)",borderRadius:6,padding:"4px 8px",fontSize:12,fontFamily:"'Space Grotesk',sans-serif" }}>
              {[5,8,10,12,15].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label style={{ fontSize:12,color:"var(--muted)",display:"flex",flexDirection:"column",gap:5 }}>
            Question Style
            <select value={scenarioMode} onChange={e => setScenarioMode(e.target.value)} style={{ background:"var(--bg3)",border:"1px solid var(--border2)",color:"var(--text)",borderRadius:6,padding:"4px 8px",fontSize:12,fontFamily:"'Space Grotesk',sans-serif" }}>
              <option value="no">Concepts Only</option>
              <option value="scenario">Scenario-Based</option>
              <option value="both">Both (Mix)</option>
            </select>
          </label>
        </div>

        <button onClick={handleStart} disabled={!canStart} style={{ padding:"13px 36px",borderRadius:9,border:"none",background: canStart ? "var(--accent)" : "var(--bg3)",color: canStart ? "#fff" : "var(--muted)",fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:600,cursor: canStart ? "pointer" : "not-allowed",transition:"all .2s",letterSpacing:"-.2px",marginTop:20,width:"100%",opacity: canStart ? 1 : 0.35 }}>
          Start Voice Interview →
        </button>
      </div>
    </div>
  );
}

// ── SCREEN 1: INTERVIEW ──
function InterviewScreen({ state, onAnswer, voice }) {
  const [answer, setAnswer] = useState("");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("Click mic to answer by voice");
  const [speaking, setSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const topic = state.topic;
  const questions = IVD[topic]?.qs || [];
  const fallbackQuestion = questions[state.questionIndex] || { text: "Loading...", topic:"—" };
  const question = state.currentQuestion ? { ...fallbackQuestion, text: state.currentQuestion } : fallbackQuestion;
  const total = state.totalQuestions || questions.length;

  // Speak the question when it changes
  useEffect(() => {
    setSpeaking(true);
    setVoiceStatus("🔊 Speaking question...");
    voice.speak(question.text, () => {
      setSpeaking(false);
      setVoiceStatus("Click mic to answer");
    });
    return () => voice.stopSpeaking();
  }, [state.questionIndex]);

  const toggleMic = () => {
    if (listening) { voice.stopListening(); setListening(false); setVoiceStatus("Done — review and submit"); return; }
    const started = voice.startListening(
      (interim) => {
        setLiveTranscript(interim);
        setVoiceStatus("● Listening... live transcript updating");
      },
      (final) => {
        setLiveTranscript(final);
        if (final?.trim()) {
          setAnswer(prev => (prev ? `${prev} ${final}`.trim() : final.trim()));
        }
        setListening(false);
        setVoiceStatus("Done — review and submit");
      },
      (err) => { setListening(false); setVoiceStatus(err === "not-allowed" ? "Mic blocked — allow access" : "Voice error — try typing"); }
    );
    if (started) { setListening(true); setVoiceStatus("● Listening..."); }
    else setVoiceStatus("Voice not supported — type below");
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    const scores = analyseAnswer(answer, state.questionIndex);

    // Try real API first, fall back to local analysis
    let apiResult = null;
    if (state.sessionId) {
      apiResult = await callApi("post", "/answer", { session_id: state.sessionId, answer });
    }

    const feedback = buildConciseFeedback(scores, question.text);
    setAnswer("");
    setLiveTranscript("");
    setSubmitting(false);
    onAnswer(scores, apiResult, feedback);
  };

  const jdTopics = state.jdTopics;
  const fp = state.fp;

  const barColor = (v) => v < 35 ? "var(--red)" : v < 60 ? "var(--amber)" : "var(--green)";

  return (
    <div style={{ display:"flex",flexDirection:"row",height:"calc(100vh - 54px)" }}>
      {/* LEFT */}
      <div style={{ flex:1,padding:28,borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:16,overflowY:"auto" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)",letterSpacing:1,textTransform:"uppercase" }}>QUESTION {state.questionIndex+1} OF {total}</div>
          <div style={{ fontSize:11,color:"var(--accent2)",fontFamily:"'JetBrains Mono',monospace" }}>▸ {state.questionIndex === 0 ? "Baseline" : "Adaptive"}</div>
        </div>
        <div style={{ background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:12,padding:18 }}>
          <div style={{ fontSize:16,lineHeight:1.6,fontWeight:500,marginBottom:6 }}>{question.text}</div>
          <div style={{ fontSize:11,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace" }}>topic: {question.topic}</div>
        </div>

        {/* Voice area */}
        <div style={{ border:"1px solid var(--border2)",borderRadius:12,background:"var(--bg2)",padding:16,display:"flex",flexDirection:"column",gap:12 }}>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <button onClick={toggleMic} style={{ width:48,height:48,borderRadius:"50%",border: listening ? "1.5px solid var(--red)" : speaking ? "1.5px solid var(--teal)" : "1.5px solid var(--border2)",background: listening ? "rgba(248,113,113,.15)" : speaking ? "rgba(45,212,191,.12)" : "var(--bg3)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all .2s",animation: listening || speaking ? "pulse 1.2s ease-in-out infinite" : "none",flexShrink:0 }}>
              {speaking ? "🔊" : "🎤"}
            </button>
            <div>
              <div style={{ fontSize:12,fontFamily:"'JetBrains Mono',monospace",color: listening ? "var(--red)" : speaking ? "var(--teal)" : "var(--muted)" }}>{voiceStatus}</div>
              <div style={{ fontSize:10,color:"var(--muted)",marginTop:2,fontFamily:"'JetBrains Mono',monospace" }}>or type below</div>
            </div>
          </div>
          <div style={{ borderTop:"1px solid var(--border)",paddingTop:12 }}>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Speak using the mic above — or type your answer here..." rows={3} style={{ width:"100%",background:"transparent",border:"none",color:"var(--text)",fontFamily:"'Space Grotesk',sans-serif",fontSize:14,outline:"none",resize:"none",lineHeight:1.6,minHeight:50 }}/>
            <div style={{ marginTop:8,padding:"8px 10px",borderRadius:8,background:"var(--bg3)",fontSize:11,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",minHeight:28 }}>
              Live transcript: {liveTranscript || "waiting for speech..."}
            </div>
          </div>
        </div>

        <div style={{ display:"flex",gap:10,alignItems:"center" }}>
          <button onClick={handleSubmit} disabled={!answer.trim() || submitting} style={{ padding:"10px 24px",borderRadius:8,border:"none",background:"var(--accent)",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:600,cursor: answer.trim() ? "pointer" : "not-allowed",transition:"all .2s",opacity: answer.trim() ? 1 : 0.35 }}>
            {submitting ? "Analysing..." : "Analyse Answer →"}
          </button>
          <button onClick={() => setAnswer("")} style={{ padding:"10px 16px",borderRadius:8,border:"1px solid var(--border2)",background:"transparent",color:"var(--muted)",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,cursor:"pointer" }}>
            Clear
          </button>
        </div>

        <div style={{ background:"rgba(124,111,247,.06)",border:"1px solid rgba(124,111,247,.2)",borderRadius:10,padding:12,fontSize:12,color:"var(--accent2)" }}>
          Per-question feedback is being collected silently and will be shown in the final report.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:300,padding:20,display:"flex",flexDirection:"column",gap:14,overflowY:"auto" }}>
        <div>
          <div style={{ fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:10 }}>🧠 Reasoning Fingerprint</div>
          <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
            {[["Conceptual Depth",fp.depth],["Technical Accuracy",fp.acc],["Confidence",fp.conf],["Consistency",fp.cons],["Originality",fp.orig]].map(([label, val]) => (
              <div key={label} style={{ display:"flex",flexDirection:"column",gap:3 }}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:11 }}>
                  <span style={{ fontWeight:500 }}>{label}</span>
                  <span style={{ color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace" }}>{val ? val+"%" : "—"}</span>
                </div>
                <div style={{ height:4,borderRadius:100,background:"var(--bg3)",overflow:"hidden" }}>
                  <div style={{ height:"100%",borderRadius:100,width: val ? val+"%" : "0%",background: val ? barColor(val) : "var(--bg3)",transition:"width .8s cubic-bezier(.4,0,.2,1)" }}/>
                </div>
              </div>
            ))}
          </div>
          {state.pattern && <div style={{ marginTop:12,padding:"9px 13px",borderRadius:8,fontSize:11,border:"1px solid rgba(251,191,36,.25)",background:"rgba(251,191,36,.07)",color:"var(--amber)",fontFamily:"'JetBrains Mono',monospace" }}>Pattern: {state.pattern}</div>}
          {state.weakSpots.length > 0 && <div style={{ marginTop:6,padding:"9px 13px",borderRadius:8,fontSize:11,border:"1px solid rgba(248,113,113,.2)",background:"rgba(248,113,113,.06)",color:"var(--red)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.5 }}>⚠ Probing: {state.weakSpots[0]}<br/><span style={{ fontSize:9,opacity:.7 }}>Next question targets this gap</span></div>}
        </div>
        <div style={{ height:1,background:"var(--border)" }}/>
        <div>
          <div style={{ fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:10 }}>📋 JD Coverage</div>
          <div style={{ display:"flex",flexDirection:"column",gap:5 }}>
            {jdTopics.map(t => (
              <div key={t.name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11 }}>
                <span>{t.name}</span>
                <span style={{ padding:"2px 7px",borderRadius:100,fontSize:9,fontFamily:"'JetBrains Mono',monospace",fontWeight:600,background: t.status==="covered" ? "rgba(52,211,153,.15)" : t.status==="gap" ? "rgba(248,113,113,.15)" : "rgba(107,107,128,.2)",color: t.status==="covered" ? "var(--green)" : t.status==="gap" ? "var(--red)" : "var(--muted)" }}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SCREEN 2: TRANSITION ──
function TransitionScreen({ state, onEnterSocratic }) {
  const gaps = state.weakSpots.slice(0, 3);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (countdown <= 0) {
      onEnterSocratic();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onEnterSocratic]);

  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px",minHeight:"calc(100vh - 54px)",position:"relative",overflow:"hidden" }}>
      <div style={{ position:"absolute",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,111,247,.07) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none" }}/>
      <div style={{ maxWidth:500,width:"100%",background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:18,padding:36,position:"relative",zIndex:1,textAlign:"center" }}>
        <div style={{ fontSize:32,marginBottom:14 }}>🔍</div>
        <div style={{ fontSize:26,fontWeight:700,letterSpacing:"-.8px",marginBottom:8 }}>Interview Complete</div>
        <p style={{ fontSize:13,color:"var(--muted)",lineHeight:1.6,marginBottom:24 }}>Your Reasoning Fingerprint is mapped.<br/>SocraticMind will now teach your exact gaps — by asking questions, never giving answers.</p>
        <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",marginBottom:10,textTransform:"uppercase",letterSpacing:1 }}>Confirmed gaps</div>
        <div style={{ display:"flex",flexDirection:"column",gap:7,marginBottom:24 }}>
          {gaps.map(g => (
            <div key={g} style={{ display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderRadius:8,background:"rgba(248,113,113,.07)",border:"1px solid rgba(248,113,113,.15)",fontSize:12,color:"var(--red)",textAlign:"left" }}>
              <div style={{ width:5,height:5,borderRadius:"50%",background:"var(--red)",flexShrink:0 }}/>{g}
            </div>
          ))}
        </div>
        <button onClick={onEnterSocratic} style={{ padding:"13px 36px",borderRadius:9,border:"none",background:"var(--accent)",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all .2s",width:"100%" }}>
          Enter Learning Mode {countdown > 0 ? `(${countdown})` : ""} →
        </button>
      </div>
    </div>
  );
}

// ── SCREEN 3: SOCRATIC ──
function SocraticScreen({ state, onViewReport, voice }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [chatStep, setChatStep] = useState(0);
  const [rewardTotal, setRewardTotal] = useState(0);
  const [masteryPct, setMasteryPct] = useState(5);
  const [hintCount, setHintCount] = useState(0);
  const [stratIdx, setStratIdx] = useState(0);
  const [rewardLog, setRewardLog] = useState([]);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);
  const initDone = useRef(false);
  const [mentorTopic, setMentorTopic] = useState("");
  const [mentorTopics, setMentorTopics] = useState([]);

  const addAiMsg = useCallback((text, isTyping = true) => {
    if (isTyping) {
      setMessages(prev => [...prev, { type:"ai", text:"...", id: Date.now() }]);
      setTimeout(() => {
        setMessages(prev => prev.map((m, i) => i === prev.length-1 ? { ...m, text } : m));
        chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
      }, 850);
    } else {
      setMessages(prev => [...prev, { type:"ai", text, id: Date.now() }]);
    }
  }, []);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    (async () => {
      if (state.sessionId) {
        const mentorStart = await callApi("post", "/mentor/start", { session_id: state.sessionId });
        if (mentorStart && !mentorStart.error && mentorStart.question) {
          setMentorTopic(mentorStart.current_topic || "");
          setMentorTopics(mentorStart.topics || []);
          addAiMsg(mentorStart.question, false);
          voice.speak(mentorStart.question);
          return;
        }
      }
      setTimeout(() => {
        addAiMsg(SOC_FLOW[0]);
        voice.speak(SOC_FLOW[0]);
      }, 500);
    })();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages]);

  const sendChat = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    setMessages(prev => [...prev, { type:"user", text, id: Date.now() }]);

    const rewards = [5,8,10,12,12,15];
    const masteryGains = [8,12,16,18,18,24];
    const step = chatStep;
    const rwd = rewards[Math.min(step, rewards.length-1)];
    const newReward = rewardTotal + rwd;
    const newMastery = Math.min(95, masteryPct + masteryGains[Math.min(step, masteryGains.length-1)]);

    setRewardTotal(newReward);
    setMasteryPct(newMastery);
    setHintCount(h => h+1);
    const newStratIdx = step % STRATEGIES.length;
    setStratIdx(newStratIdx);
    setRewardLog(prev => [...prev, `+${rwd} · reasoning step detected`]);

    const nextIdx = Math.min(step + 1, SOC_FLOW.length-1);
    setChatStep(nextIdx);

    if (state.sessionId && mentorTopic) {
      const mentorResult = await callApi("post", "/mentor/answer", {
        session_id: state.sessionId,
        topic: mentorTopic,
        answer: text,
      });
      if (mentorResult && !mentorResult.error && mentorResult.question) {
        addAiMsg(mentorResult.question);
        voice.speak(mentorResult.question);
        return;
      }
    }

    setTimeout(() => {
      const response = SOC_FLOW[nextIdx];
      addAiMsg(response);
      voice.speak(response);
    }, 500);
  };

  const toggleSocMic = () => {
    if (listening) { voice.stopListening(); setListening(false); return; }
    const started = voice.startListening(
      (i) => setInputText(i),
      (f) => { setInputText(f); setListening(false); },
      () => setListening(false)
    );
    if (started) setListening(true);
  };

  return (
    <div style={{ display:"flex",flexDirection:"row",height:"calc(100vh - 54px)" }}>
      {/* CHAT */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",borderRight:"1px solid var(--border)" }}>
        <div style={{ padding:"14px 22px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,var(--accent),var(--teal))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>🦉</div>
          <div>
            <div style={{ fontSize:13,fontWeight:600 }}>SocraticMind</div>
            <div style={{ fontSize:10,color:"var(--teal)",fontFamily:"'JetBrains Mono',monospace" }}>never gives answers · only guides · voice-first</div>
          </div>
        </div>
        <div style={{ flex:1,overflowY:"auto",padding:"18px 22px",display:"flex",flexDirection:"column",gap:14 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display:"flex",gap:9,maxWidth:"88%",alignSelf: m.type==="user" ? "flex-end" : "flex-start",flexDirection: m.type==="user" ? "row-reverse" : "row",animation:"fadeIn .3s ease" }}>
              <div style={{ width:26,height:26,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,background: m.type==="ai" ? "linear-gradient(135deg,var(--accent),var(--teal))" : "var(--bg3)",border: m.type==="user" ? "1px solid var(--border2)" : "none",color: m.type==="user" ? "var(--muted)" : "#fff" }}>
                {m.type==="ai" ? "🦉" : "U"}
              </div>
              <div style={{ padding:"11px 15px",borderRadius:11,fontSize:13,lineHeight:1.6,background: m.type==="ai" ? "var(--bg2)" : "rgba(124,111,247,.14)",border: m.type==="ai" ? "1px solid var(--border)" : "1px solid rgba(124,111,247,.24)",borderTopLeftRadius: m.type==="ai" ? 3 : 11,borderTopRightRadius: m.type==="user" ? 3 : 11,color: m.type==="user" ? "var(--accent2)" : "var(--text)" }}>
                {m.text === "..." ? (
                  <div style={{ display:"flex",gap:4,alignItems:"center",padding:"3px 0" }}>
                    {[0,.2,.4].map(d => <div key={d} style={{ width:4,height:4,borderRadius:"50%",background:"var(--muted)",animation:`tb 1.2s ease-in-out ${d}s infinite` }}/>)}
                  </div>
                ) : m.text.split("\n").map((line, i) => <span key={i}>{line}{i < m.text.split("\n").length-1 ? <br/> : null}</span>)}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}/>
        </div>
        <div style={{ padding:"14px 22px",borderTop:"1px solid var(--border)",display:"flex",flexDirection:"column",gap:10 }}>
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            <button onClick={toggleSocMic} style={{ width:40,height:40,borderRadius:"50%",border: listening ? "1.5px solid var(--red)" : "1.5px solid var(--border2)",background: listening ? "rgba(248,113,113,.15)" : "var(--bg2)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,transition:"all .2s",flexShrink:0,animation: listening ? "pulse 1.2s ease-in-out infinite" : "none" }}>🎤</button>
            <textarea value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); }}} placeholder="Speak or type your response..." rows={1} style={{ flex:1,background:"var(--bg2)",border:"1px solid var(--border2)",borderRadius:9,padding:"10px 13px",color:"var(--text)",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,minHeight:40,outline:"none",resize:"none",transition:"border-color .2s",lineHeight:1.5 }}/>
            <button onClick={sendChat} style={{ width:38,height:38,borderRadius:8,border:"none",background:"var(--accent)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }}>↑</button>
          </div>
          <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",textAlign:"center" }}>🎤 mic active — speak or type · Enter to send</div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:260,padding:20,display:"flex",flexDirection:"column",gap:16,overflowY:"auto" }}>
        <div>
          <div style={{ fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:10 }}>📡 Teaching Signal</div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11,padding:"7px 11px",borderRadius:7,background:"var(--bg3)",fontFamily:"'JetBrains Mono',monospace" }}>
            <span>Total rewards</span><span style={{ fontWeight:600,color:"var(--green)" }}>+{rewardTotal}</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11,padding:"7px 11px",borderRadius:7,background:"var(--bg3)",fontFamily:"'JetBrains Mono',monospace",marginTop:5 }}>
            <span>Strategy</span><span style={{ fontSize:10,color:"var(--teal)" }}>{STRATEGIES[stratIdx]}</span>
          </div>
          <div style={{ padding:"10px 13px",borderRadius:9,border:"1px solid rgba(45,212,191,.2)",background:"rgba(45,212,191,.05)",fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"var(--teal)",lineHeight:1.5,marginTop:8 }}>{STRAT_REASONS[stratIdx]}</div>
        </div>
        <div style={{ height:1,background:"var(--border)" }}/>
        <div>
          <div style={{ fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:10 }}>🎯 Mastery Progress</div>
          <div style={{ fontSize:11,color:"var(--muted)",marginBottom:5 }}>{state.weakSpots[0] || "Time Complexity"}</div>
          <div style={{ height:7,borderRadius:100,background:"var(--bg3)",overflow:"hidden",marginTop:5 }}>
            <div style={{ height:"100%",borderRadius:100,background:"linear-gradient(90deg,var(--accent),var(--teal))",width: masteryPct+"%",transition:"width 1s cubic-bezier(.4,0,.2,1)" }}/>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:9,color:"var(--muted)",marginTop:3,fontFamily:"'JetBrains Mono',monospace" }}>
            <span>0%</span><span>{masteryPct}%</span><span>100%</span>
          </div>
        </div>
        <div style={{ height:1,background:"var(--border)" }}/>
        <div>
          <div style={{ fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)",letterSpacing:1,textTransform:"uppercase",marginBottom:10 }}>📊 Reward Log</div>
          <div style={{ display:"flex",flexDirection:"column",gap:3,fontSize:10,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)" }}>
            {rewardLog.length === 0 ? <span>Waiting...</span> : rewardLog.map((l,i) => <div key={i} style={{ color:"var(--green)" }}>{l}</div>)}
          </div>
        </div>
        <div style={{ height:1,background:"var(--border)" }}/>
        {mentorTopics.length > 0 && (
          <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",lineHeight:1.5 }}>
            Mentor topics: {mentorTopics.slice(0, 3).join(" • ")}
          </div>
        )}
        <button onClick={() => onViewReport(rewardTotal, masteryPct, hintCount, STRATEGIES[stratIdx], messages)} style={{ width:"100%",fontSize:12,padding:"11px 22px",borderRadius:8,border:"1px solid var(--border2)",background:"transparent",color:"var(--text)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:500,cursor:"pointer",transition:"all .2s" }}>
          View Final Report →
        </button>
      </div>
    </div>
  );
}

// ── SCREEN 4: REPORT ──
function ReportScreen({ state, socStats, onRestart }) {
  const { rewardTotal, masteryPct, hintCount, strategyUsed, mentorMessages } = socStats;
  const patDescriptions = {
    "Overconfident":"You answer with high confidence but accuracy lags behind. Focus on verifying your intuitions before committing.",
    "Surface Knower":"You know the names and definitions but struggle to explain the why. Dig one level deeper — always ask yourself: what is the mechanism?",
    "Inconsistent":"Your reasoning shifts between questions. Build a stable mental model of foundational concepts before moving to advanced topics.",
    "Deep Thinker":"Strong conceptual understanding. Your weak area is precision — sharpen the technical details and edge cases.",
  };

  const barColor = (v) => v < 35 ? "var(--red)" : v < 60 ? "var(--amber)" : "var(--green)";

  return (
    <div style={{ padding:"36px 28px",overflowY:"auto",maxWidth:860,margin:"0 auto",width:"100%" }}>
      <div style={{ fontSize:28,fontWeight:700,letterSpacing:-1,marginBottom:6 }}>Cognitive Report</div>
      <div style={{ fontSize:13,color:"var(--muted)",marginBottom:28 }}>Session complete · Topic: {state.topic}</div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20,width:"100%" }}>
        {/* Before → After */}
        <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:18 }}>
          <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>Before → After Learning</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
            {[["Before",[25,30,72,38],"var(--red)"],["After",[64,70,66,74],"var(--green)"]].map(([label,vals,col]) => (
              <div key={label} style={{ display:"flex",flexDirection:"column",gap:7 }}>
                <div style={{ fontSize:9,fontFamily:"'JetBrains Mono',monospace",color:"var(--muted)",textTransform:"uppercase",letterSpacing:.8,marginBottom:3 }}>{label}</div>
                {["Depth","Accuracy","Confidence","Consistency"].map((m, i) => (
                  <div key={m} style={{ display:"flex",alignItems:"center",gap:7 }}>
                    <span style={{ fontSize:11,color:"var(--muted)",flex:1 }}>{m}</span>
                    <div style={{ width:50,height:3,borderRadius:100,background:"var(--bg3)",overflow:"hidden" }}>
                      <div style={{ height:"100%",borderRadius:100,background:col,width: vals[i]+"%" }}/>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pattern */}
        <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:18 }}>
          <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>Pattern Detected</div>
          <div style={{ fontSize:20,fontWeight:700,color:"var(--amber)",marginBottom:6 }}>{state.pattern || "Deep Thinker"}</div>
          <div style={{ fontSize:12,color:"var(--muted)",lineHeight:1.6 }}>{patDescriptions[state.pattern] || "Keep developing your reasoning depth."}</div>
        </div>

        {/* JD Coverage */}
        <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:18 }}>
          <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>JD Coverage Map</div>
          <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
            {state.jdTopics.map(t => (
              <div key={t.name} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:11 }}>
                <span style={{ color:"var(--text)" }}>{t.name}</span>
                <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                  <div style={{ width:50,height:3,borderRadius:100,background:"var(--bg3)",overflow:"hidden" }}>
                    <div style={{ height:"100%",borderRadius:100,background: t.status==="covered" ? "var(--green)" : t.status==="gap" ? "var(--red)" : "var(--muted)",width: t.status==="covered" ? "80%" : t.status==="gap" ? "28%" : "0%" }}/>
                  </div>
                  <span style={{ fontSize:9,fontFamily:"'JetBrains Mono',monospace",color: t.status==="covered" ? "var(--green)" : t.status==="gap" ? "var(--red)" : "var(--muted)" }}>{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Stats */}
        <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:18 }}>
          <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>Learning Loop Stats</div>
          <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
            {[["Rewards earned","+"+rewardTotal,"var(--green)"],["Strategy used",strategyUsed,"var(--teal)"],["Mastery reached",masteryPct+"%","var(--accent2)"],["Hints to breakthrough",hintCount+" hints","var(--amber)"]].map(([label,val,col]) => (
              <div key={label} style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
                <span style={{ color:"var(--muted)" }}>{label}</span>
                <span style={{ color:col,fontFamily:"'JetBrains Mono',monospace" }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:18,marginBottom:16 }}>
        <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>
          Per-Question Feedback Summary
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {(state.questionFeedbacks || []).map((item, idx) => (
            <div key={`${item.question}-${idx}`} style={{ border:"1px solid var(--border2)",borderRadius:10,padding:12,background:"var(--bg3)" }}>
              <div style={{ fontSize:12,fontWeight:600,marginBottom:6 }}>Q{idx + 1}. {item.question}</div>
              <div style={{ fontSize:12,color:"var(--muted)",marginBottom:8 }}>{item.concise_feedback}</div>
              <div style={{ fontSize:11,color:"var(--text)" }}>
                Confidence: <b>{item.metrics.confidence}%</b> · Accuracy: <b>{item.metrics.accuracy}%</b> · Fluency: <b>{item.metrics.fluency}%</b> · Weak areas: <b>{item.weak_areas.join(", ")}</b>
              </div>
            </div>
          ))}
          {(!state.questionFeedbacks || state.questionFeedbacks.length === 0) && (
            <div style={{ fontSize:12,color:"var(--muted)" }}>No per-question feedback captured.</div>
          )}
        </div>
      </div>

      <div style={{ background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:12,padding:18,marginBottom:18 }}>
        <div style={{ fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,textTransform:"uppercase",marginBottom:12 }}>
          Socratic Mentor Feedback
        </div>
        <div style={{ fontSize:12,color:"var(--muted)",lineHeight:1.7 }}>
          {mentorMessages?.filter(m => m.type === "ai").slice(-4).map((m, i) => (
            <div key={i} style={{ marginBottom:8 }}>• {m.text}</div>
          ))}
          {!mentorMessages?.length && "Mentor feedback not available for this run."}
        </div>
      </div>

      <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
        <button onClick={onRestart} style={{ padding:"11px 22px",borderRadius:8,border:"none",background:"var(--accent)",color:"#fff",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:600,cursor:"pointer" }}>
          Start New Interview →
        </button>
        <button onClick={onRestart} style={{ padding:"11px 22px",borderRadius:8,border:"1px solid var(--border2)",background:"transparent",color:"var(--text)",fontFamily:"'Space Grotesk',sans-serif",fontSize:13,fontWeight:500,cursor:"pointer" }}>
          Change Topic
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
const INITIAL_STATE = {
  screen: "setup", // setup | interview | transition | socratic | report
  phase: 0,
  topic: null,
  sessionId: null,
  questionIndex: 0,
  fp: { depth:0, acc:0, conf:0, cons:0, orig:0 },
  pattern: "",
  weakSpots: [],
  jdTopics: [],
  jdFromJD: null,
  numQuestions: 10,
  scenarioMode: "both",
  questionFeedbacks: [],
  currentQuestion: "",
  totalQuestions: 3,
};

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [socStats, setSocStats] = useState({ rewardTotal:0, masteryPct:5, hintCount:0, strategyUsed:"counter_example", mentorMessages:[] });
  const voice = useVoice();

  // Inject CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    window.speechSynthesis?.getVoices();
    setTimeout(() => window.speechSynthesis?.getVoices(), 500);
    return () => document.head.removeChild(style);
  }, []);

  const handleStart = async ({ topic, jdText, jdFromJD, numQuestions, scenarioMode }) => {
    const fallbackTopic = topic || "Data Structures";
    const topicData = IVD[fallbackTopic] || IVD["Data Structures"];
    const jdTopics = (jdFromJD || topicData.jd).map(name => ({ name, status:"pending" }));

    // Try real API
    let sessionId = null;
    const hasJdText = Boolean(jdText?.trim());
    const apiData = await callApi("post", "/start", {
      domain: hasJdText ? "" : fallbackTopic,
      jd_text: hasJdText ? jdText : "",
      num_questions: numQuestions,
      scenario_mode: scenarioMode,
    });
    if (apiData && !apiData.error) sessionId = apiData.session_id;
    const firstQuestion = apiData?.question || (topicData.qs?.[0]?.text ?? "");
    const totalQuestions = apiData?.max_questions || topicData.qs?.length || numQuestions;

    setState(prev => ({
      ...prev,
      screen: "interview",
      phase: 1,
      topic: fallbackTopic,
      sessionId,
      questionIndex: 0,
      fp: { depth:0, acc:0, conf:0, cons:0, orig:0 },
      pattern: "",
      weakSpots: [],
      jdTopics,
      jdFromJD,
      numQuestions,
      scenarioMode,
      questionFeedbacks: [],
      currentQuestion: firstQuestion,
      totalQuestions,
    }));
  };

  const handleAnswer = (scores, apiResult, feedback) => {
    setState(prev => {
      const newFp = {
        depth: lerp(prev.fp.depth, scores.depth, 0.6),
        acc:   lerp(prev.fp.acc,   scores.acc,   0.6),
        conf:  lerp(prev.fp.conf,  scores.conf,  0.5),
        cons:  lerp(prev.fp.cons,  scores.cons,  0.4),
        orig:  lerp(prev.fp.orig,  scores.orig,  0.5),
      };
      const gap = newFp.conf - newFp.acc;
      const pattern = gap > 20 ? "Overconfident" : newFp.depth < 40 ? "Surface Knower" : newFp.cons < 40 ? "Inconsistent" : "Deep Thinker";
      const ti = prev.questionIndex % prev.jdTopics.length;
      const newJdTopics = prev.jdTopics.map((t,i) => i === ti ? { ...t, status: scores.acc > 55 ? "covered" : "gap" } : t);
      const weakSpots = newJdTopics.filter(t => t.status !== "covered").map(t => t.name);
      const nextIndex = prev.questionIndex + 1;
      const maxQ = prev.totalQuestions || IVD[prev.topic]?.qs.length || 3;
      const apiCompleted = Boolean(apiResult?.completed);
      const nextQuestion = apiResult?.next_question || prev.currentQuestion;

      if (apiCompleted || nextIndex >= maxQ) {
        const finalGaps = newJdTopics.filter(t => t.status !== "covered").map(t => t.name);
        return {
          ...prev,
          fp: newFp,
          pattern,
          jdTopics: newJdTopics,
          weakSpots: finalGaps.length > 0 ? finalGaps : [newJdTopics[0]?.name || "Fundamentals"],
          screen:"transition",
          phase:2,
          questionFeedbacks: [...prev.questionFeedbacks, feedback],
        };
      }
      return {
        ...prev,
        fp: newFp,
        pattern,
        jdTopics: newJdTopics,
        weakSpots,
        questionIndex: nextIndex,
        questionFeedbacks: [...prev.questionFeedbacks, feedback],
        currentQuestion: nextQuestion,
      };
    });
  };

  const handleEnterSocratic = () => setState(prev => ({ ...prev, screen:"socratic", phase:3 }));

  const handleViewReport = (rewardTotal, masteryPct, hintCount, strategyUsed, mentorMessages = []) => {
    setSocStats({ rewardTotal, masteryPct, hintCount, strategyUsed, mentorMessages });
    setState(prev => ({ ...prev, screen:"report", phase:4 }));
  };

  const handleRestart = () => {
    voice.stopSpeaking();
    setState(INITIAL_STATE);
    setSocStats({ rewardTotal:0, masteryPct:5, hintCount:0, strategyUsed:"counter_example", mentorMessages:[] });
  };

  return (
    <div style={{ minHeight:"100vh",background:"var(--bg)",color:"var(--text)" }}>
      <Header phase={state.phase}/>
      {state.screen === "setup" && <SetupScreen onStart={handleStart}/>}
      {state.screen === "interview" && <InterviewScreen state={state} onAnswer={handleAnswer} voice={voice}/>}
      {state.screen === "transition" && <TransitionScreen state={state} onEnterSocratic={handleEnterSocratic}/>}
      {state.screen === "socratic" && <SocraticScreen state={state} onViewReport={handleViewReport} voice={voice}/>}
      {state.screen === "report" && <ReportScreen state={state} socStats={socStats} onRestart={handleRestart}/>}
    </div>
  );
}
