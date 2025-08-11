/* script.js - simple frontend logic for demo (vanilla JS) */

const API_BASE = "http://127.0.0.1:5000/api"; // adjust if backend different

// fallback demo data if backend unreachable
const FALLBACK_SIM = {
  scenario: "otp-intercept",
  steps: [
    { step: 1, title: "Attacker requests routing info", description: "Fake network request for routing info." },
    { step: 2, title: "Network replies", description: "Network (trusted) replies with routing details." },
    { step: 3, title: "SMS redirected", description: "OTP duplicated / forwarded to attacker." },
    { step: 4, title: "Attacker uses OTP", description: "Attacker completes a fraudulent transaction." }
  ]
};

const FALLBACK_QUESTIONS = [
  { id:1, question:"Can SMS be intercepted remotely?", options:["Yes","No"] },
  { id:2, question:"Is SMS OTP always safe?", options:["Always safe","Not always safe"] },
  { id:3, question:"Should you share OTP over phone?", options:["Yes","No"] },
  { id:4, question:"Is app-authenticator safer than SMS?", options:["Yes","No"] },
  { id:5, question:"If you suspect interception contact your operator?", options:["Yes","No"] }
];

const FALLBACK_TIPS = {
  en: {
    low:["Good job. Keep using secure practices.","Use app-based authenticators for important accounts."],
    medium:["Avoid sharing OTPs. Use app-based authentication when possible.","Be cautious with calls asking for codes."],
    high:["Stop sharing OTPs. Contact bank & operator.","Switch to app/hardware authentication for critical accounts."],
    general:["Never share your OTP.","Enable two-factor authentication (prefer app-based)."]
  },
  ne: {
    low:["सुविधा राम्रो छ। सुरक्षित अभ्यास जारी राख्नुहोस्।","महत्त्वपूर्ण खाता लागि एप-आधारित प्रमाणीकरण प्रयोग गर्नुहोस्।"],
    medium:["OTP हरू साझेदारी नगर्नुहोस्। सम्भव भए एप-आधारित प्रमाणीकरण प्रयोग गर्नुहोस्।","कोड सोध्ने कल या लिंकहरू प्रति सतर्क रहनुहोस्।"],
    high:["तुरुन्तै OTP साझेदारी रोक्नुहोस्। आफ्नो बैंक र अपरेटरलाई सम्पर्क गर्नुहोस्।","महत्त्वपूर्ण खाताहरूको लागि एप-आधारित वा हार्डवेयर प्रमाणीकरणमा स्विच गर्नुहोस्।"],
    general:["कहिल्यै आफ्नो OTP अरू कसैसँग बाँड्नु हुँदैन।","मजबुत पासवर्ड प्रयोग गर्नुहोस् र दुई-चरणीय प्रमाणीकरण सक्षम गर्नुहोस्।"]
  }
};

// UI elements
const startSimBtn = document.getElementById("startSimBtn");
const goSim = document.getElementById("goSim");
const goQuiz = document.getElementById("goQuiz");
const simulationSection = document.getElementById("simulation");
const timelineEl = document.getElementById("timeline");
const simTitle = document.getElementById("simTitle");
const simDesc = document.getElementById("simDesc");
const nextStepBtn = document.getElementById("nextStep");
const restartSimBtn = document.getElementById("restartSim");
const simSVG = document.getElementById("simSVG");
const routeLine = document.getElementById("routeLine");
const otpBubble = document.getElementById("otpBubble");
const victim = document.getElementById("victim");
const attacker = document.getElementById("attacker");

const quizSection = document.getElementById("quiz");
const quizForm = document.getElementById("quizForm");
const submitQuizBtn = document.getElementById("submitQuiz");
const resetQuizBtn = document.getElementById("resetQuiz");

const resultsSection = document.getElementById("results");
const riskBadge = document.getElementById("riskBadge");
const scoreText = document.getElementById("scoreText");
const tipsList = document.getElementById("tipsList");
const resultLang = document.getElementById("resultLang");
const toSimBtn = document.getElementById("toSim");

const operatorSection = document.getElementById("operator");
const logBox = document.getElementById("logBox");
const regenLogsBtn = document.getElementById("regenLogs");

const langSelect = document.getElementById("langSelect");

let simData = null;
let simIndex = 0;
let questionsData = null;
let userAnswers = [];

// helpers
function showSection(sec){
  [simulationSection, quizSection, resultsSection, operatorSection].forEach(s => s.classList.add("hidden"));
  sec.classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

async function fetchJson(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error("Network error");
    return await res.json();
  }catch(e){
    console.warn("Fetch failed:", url, e);
    return null;
  }
}

// load simulation steps
async function loadSimulation(scenario="otp-intercept"){
  simData = await fetchJson(`${API_BASE}/simulate/${scenario}`);
  if(!simData) simData = FALLBACK_SIM;
  renderTimeline(simData.steps);
  simIndex = 0;
  simTitle.textContent = `Simulation — ${toTitleCase(simData.scenario.replace("-"," "))}`;
  simDesc.textContent = "A step-by-step, safe visualization of how an attacker could exploit SS7 to intercept SMS.";
  // reset SVG visuals
  routeLine.style.opacity = 0;
  otpBubble.style.opacity = 0;
}

// render timeline
function renderTimeline(steps){
  timelineEl.innerHTML = "";
  steps.forEach(s => {
    const div = document.createElement("div");
    div.className = "sim-step";
    div.innerHTML = `<div class="num">${s.step}</div><div><h4>${escapeHtml(s.title)}</h4><p>${escapeHtml(s.description)}</p></div>`;
    timelineEl.appendChild(div);
  });
  // highlight first
  highlightStep(0);
}

function highlightStep(idx){
  // remove selected class
  const nodes = timelineEl.querySelectorAll(".sim-step");
  nodes.forEach((n,i)=> n.style.opacity = (i===idx?1:0.7));
}

// animation for steps
function playStep(idx){
  const step = simData.steps[idx];
  if(!step) return;
  highlightStep(idx);

  // simple mapping of animations by step index
  if(idx === 0){
    // attacker sends request: ping from attacker to victim
    routeLine.setAttribute("d","M420 80 C 360 130 320 170 240 200");
    routeLine.style.opacity = 1;
    routeLine.style.strokeDasharray = "0";
    routeLine.animate([{strokeDasharray:"0 1000"},{strokeDasharray:"1000 0"}],{duration:900,fill:"forwards"});
  } else if(idx === 1){
    // network replies: small pulse near victim
    pulseElement(victim, "#60a5fa");
  } else if(idx === 2){
    // otp bubble appears and moves towards attacker
    otpBubble.style.opacity = 1;
    otpBubble.animate([{cx:260, cy:190},{cx:400, cy:100}],{duration:900,fill:"forwards"});
    // fade after animation
    setTimeout(()=> otpBubble.style.opacity = 0,1000);
  } else if(idx === 3){
    // attacker uses OTP: attacker pulse
    pulseElement(attacker,"#fb7185");
  }
}

function pulseElement(el, color){
  // quick CSS pulse via SVG scale
  el.animate([{transform:"scale(1)"},{transform:"scale(1.6)"},{transform:"scale(1)"}],{duration:700,fill:"forwards"});
}

// Next step
nextStepBtn.addEventListener("click",()=>{
  if(!simData) return;
  if(simIndex >= simData.steps.length) return;
  playStep(simIndex);
  simIndex++;
  if(simIndex >= simData.steps.length){
    nextStepBtn.disabled = true;
  } else {
    nextStepBtn.disabled = false;
  }
});

// restart
restartSimBtn.addEventListener("click",()=>{
  simIndex = 0;
  routeLine.style.opacity = 0;
  otpBubble.style.opacity = 0;
  nextStepBtn.disabled = false;
  highlightStep(0);
});

// UI bindings
startSimBtn.addEventListener("click",()=> {
  loadSimulation();
  showSection(simulationSection);
});
goSim.addEventListener("click",()=> {
  loadSimulation();
  showSection(simulationSection);
});
goQuiz.addEventListener("click", ()=> {
  loadQuiz();
  showSection(quizSection);
});

// quiz
async function loadQuiz(){
  const data = await fetchJson(`${API_BASE}/quiz/questions`);
  if(!data || !data.questions) questionsData = FALLBACK_QUESTIONS;
  else questionsData = data.questions;
  renderQuiz(questionsData);
}

function renderQuiz(questions){
  quizForm.innerHTML = "";
  userAnswers = [];
  questions.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "q-card";
    const qhtml = `<p><strong>${idx+1}. ${escapeHtml(q.question)}</strong></p>`;
    let opts = '<div class="q-options">';
    q.options.forEach(opt => {
      const val = opt;
      const name = `q_${q.id}`;
      opts += `<label><input type="radio" name="${name}" value="${escapeHtml(val)}"> ${escapeHtml(val)}</label>`;
    });
    opts += '</div>';
    card.innerHTML = qhtml + opts;
    quizForm.appendChild(card);
  });
}

submitQuizBtn.addEventListener("click", async (e)=>{
  e.preventDefault();
  // gather answers
  const answers = [];
  questionsData.forEach(q => {
    const sel = document.querySelector(`input[name="q_${q.id}"]:checked`);
    answers.push({ id: q.id, answer: sel ? sel.value : "" });
  });

  // post to backend
  const payload = { answers };
  let res = null;
  try{
    const r = await fetch(`${API_BASE}/quiz/submit`, {
      method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
    });
    if(r.ok) res = await r.json();
  }catch(e){
    console.warn("Quiz submit failed, falling back:", e);
  }
  if(!res){
    // simple local scoring fallback
    let score = 0;
    answers.forEach(a=>{
      const q = FALLBACK_QUESTIONS.find(x=>x.id===a.id);
      if(q && a.answer.toLowerCase() === (q.options[0] || "").toLowerCase()) score++;
    });
    res = { score: score, total: questionsData.length, risk: (score >= questionsData.length - 1 ? "Low" : (score >= Math.floor(questionsData.length/2) ? "Medium" : "High")) };
  }

  showResults(res.score, res.total, res.risk);
});

resetQuizBtn.addEventListener("click", ()=>{
  renderQuiz(questionsData);
});

// show results and fetch tips
async function showResults(score, total, risk){
  showSection(resultsSection);
  const badge = risk.toLowerCase();
  riskBadge.textContent = risk;
  riskBadge.className = "risk-badge";
  if(badge === "low") riskBadge.classList.add("risk-low");
  else if(badge === "medium") riskBadge.classList.add("risk-medium");
  else riskBadge.classList.add("risk-high");
  scoreText.textContent = `Score: ${score} / ${total}`;

  const lang = resultLang.value || langSelect.value || "en";
  let tipsData = null;
  try{
    const r = await fetch(`${API_BASE}/tips/${lang}/${badge}`);
    if(r.ok) tipsData = await r.json();
  }catch(e){
    console.warn("Tips fetch failed, using fallback", e);
  }
  // fallback
  const tipsArray = tipsData && tipsData.tips ? tipsData.tips : (FALLBACK_TIPS[lang] ? FALLBACK_TIPS[lang][badge] : FALLBACK_TIPS["en"][badge]);
  tipsList.innerHTML = "";
  (tipsArray || []).forEach(t => {
    const li = document.createElement("li"); li.textContent = t; tipsList.appendChild(li);
  });
}

// lang switcher
resultLang.addEventListener("change", async ()=>{
  // re-fetch tips for same risk
  const currentRisk = riskBadge.textContent || "Medium";
  await showResults(parseInt(scoreText.textContent.split(" ")[1] || 0), parseInt(scoreText.textContent.split(" ")[3] || 5), currentRisk);
});
toSimBtn.addEventListener("click", ()=>{
  showSection(simulationSection);
});

// operator logs demo
regenLogsBtn.addEventListener("click", ()=>{
  const lines = [
    "[ALERT] 2025-08-11 09:23:12 - Unusual SendRoutingInfo from /203.45.12.8",
    "[NOTICE] 2025-08-11 09:23:13 - High volume location queries for subscriber +977-98xxxxxxx",
    "[ALERT] 2025-08-11 09:23:15 - Potential SMS redirect detected (OTP patterns)"
  ];
  logBox.textContent = lines.join("\n");
  showSection(operatorSection);
});

// init: load default simulation quietly
(async function init(){
  const online = await fetchJson(`${API_BASE}/health`);
  try{ await loadSimulation(); }catch(e){}
})();
  
// small util functions
function toTitleCase(s){ return s.replace(/\b\S/g, t => t.toUpperCase()); }
function escapeHtml(str){ return (str||"").replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); }); }
