import { useState, useRef, useEffect } from "react";

// ─── Palette — warm beige / Claude-inspired light ────────────────────────────
const C = {
  bg:        "#f5f3ef",
  surface:   "#ffffff",
  surfaceAlt:"#faf8f4",
  border:    "#e5e1d8",
  borderMed: "#cdc9be",
  accent:    "#c96a2e",
  accentBg:  "#fdf0e8",
  protein:   "#3d7abf",
  proteinBg: "#eef4fc",
  carbs:     "#b07d2a",
  carbsBg:   "#fdf5e4",
  fat:       "#7a5ea6",
  fatBg:     "#f4f0fb",
  text:      "#1a1916",
  textSub:   "#6b6760",
  textMuted: "#9e9990",
  danger:    "#b83232",
};

const DEFAULT_GOALS = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function MacroBar({ label, value, goal, color }) {
  const pct = Math.min((value / goal) * 100, 100);
  const over = value > goal;
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ color: C.textSub, fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: 12, color: C.textSub }}>
          <span style={{ color: over ? C.danger : color, fontWeight: 500 }}>{value}</span>
          <span style={{ color: C.textMuted }}>/{goal}g</span>
        </span>
      </div>
      <div style={{ background: C.border, borderRadius: 3, height: 5, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: over ? C.danger : color, borderRadius: 3, transition: "width 0.5s cubic-bezier(.4,0,.2,1)" }} />
      </div>
    </div>
  );
}

function CalorieRing({ value, goal }) {
  const pct = Math.min(value / goal, 1);
  const r = 50;
  const circ = 2 * Math.PI * r;
  const over = value > goal;
  const stroke = over ? C.danger : C.accent;
  return (
    <div style={{ position: "relative", width: 128, height: 128, flexShrink: 0 }}>
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke={C.border} strokeWidth="8" />
        <circle cx="64" cy="64" r={r} fill="none" stroke={stroke} strokeWidth="8"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: over ? C.danger : C.text, lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: 11, color: C.textMuted, marginTop: 3, letterSpacing: "0.04em" }}>/ {goal} kcal</span>
      </div>
    </div>
  );
}

function Tag({ label, color, bg }) {
  return (
    <span style={{ background: bg, color, border: `1px solid ${color}30`, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 500, letterSpacing: "0.03em" }}>
      {label}
    </span>
  );
}

const inputSt = {
  background: C.surfaceAlt, border: `1px solid ${C.border}`, color: C.text,
  borderRadius: 8, padding: "9px 12px", fontSize: 14, outline: "none",
  width: "100%", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color .15s",
};

function MealCard({ meal, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...meal });
  function save() { onEdit({ ...draft, calories: +draft.calories, protein: +draft.protein, carbs: +draft.carbs, fat: +draft.fat }); setEditing(false); }
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 14px", marginBottom: 8, display: "flex", gap: 12, alignItems: "flex-start" }}>
      {meal.imageUrl && (
        <img src={meal.imageUrl} alt="" style={{ width: 58, height: 58, borderRadius: 8, objectFit: "cover", flexShrink: 0, border: `1px solid ${C.border}` }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} style={inputSt} placeholder="Meal name" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["calories","kcal",C.accent],["protein","g",C.protein],["carbs","g",C.carbs],["fat","g",C.fat]].map(([k,unit,color]) => (
                <div key={k}>
                  <label style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 3 }}>{k} ({unit})</label>
                  <input type="number" min="0" value={draft[k]} onChange={e => setDraft({ ...draft, [k]: e.target.value })} style={{ ...inputSt, color }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} style={btnPrimary}>Save</button>
              <button onClick={() => setEditing(false)} style={btnSecondary}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontWeight: 500, fontSize: 14, color: C.text, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {meal.name || "Unnamed meal"}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Tag label={`${meal.calories} kcal`} color={C.accent} bg={C.accentBg} />
              <Tag label={`P ${meal.protein}g`} color={C.protein} bg={C.proteinBg} />
              <Tag label={`C ${meal.carbs}g`} color={C.carbs} bg={C.carbsBg} />
              <Tag label={`F ${meal.fat}g`} color={C.fat} bg={C.fatBg} />
            </div>
            {meal.note && <div style={{ color: C.textMuted, fontSize: 12, marginTop: 5, lineHeight: 1.4 }}>{meal.note}</div>}
          </>
        )}
      </div>
      {!editing && (
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          <button onClick={() => setEditing(true)} style={{ background:"none",border:"none",cursor:"pointer",padding:"4px",borderRadius:6,lineHeight:0 }} title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textMuted} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={onDelete} style={{ background:"none",border:"none",cursor:"pointer",padding:"4px",borderRadius:6,lineHeight:0 }} title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

const btnPrimary  = { background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "opacity .15s" };
const btnSecondary = { background: C.surfaceAlt, color: C.textSub, border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 18px", fontSize: 13, fontWeight: 400, cursor: "pointer", fontFamily: "inherit" };
const btnGhost    = { background: "transparent", color: C.textSub, border: `1px solid ${C.borderMed}`, borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 400, cursor: "pointer", fontFamily: "inherit", width: "100%" };

export default function App() {
  const [tab, setTab]           = useState("today");
  const [goals, setGoals]       = useState(DEFAULT_GOALS);
  const [goalDraft, setGoalDraft] = useState(DEFAULT_GOALS);
  const [meals, setMeals]       = useState([]);
  const [history, setHistory]   = useState({});
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [note, setNote]         = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError]   = useState(null);
  const [editResult, setEditResult] = useState(null);
  const [refineFeedback, setRefineFeedback] = useState("");
  const [refining, setRefining] = useState(false);
  const fileRef = useRef();
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    try {
      const g = localStorage.getItem("ct_goals");
      const h = localStorage.getItem("ct_history");
      if (g) { const p = JSON.parse(g); setGoals(p); setGoalDraft(p); }
      if (h) { const ph = JSON.parse(h); setHistory(ph); setMeals(ph[today] || []); }
    } catch(err) {}
  }, [today]);

  useEffect(() => {
    const nh = { ...history, [today]: meals };
    setHistory(nh);
    localStorage.setItem("ct_history", JSON.stringify(nh));
  }, [meals, history, today]);

  useEffect(() => { localStorage.setItem("ct_goals", JSON.stringify(goals)); }, [goals]);

  function onFileChange(e) {
    const f = e.target.files[0]; if (!f) return;
    setImageFile(f); setImagePreview(URL.createObjectURL(f));
    setAiResult(null); setEditResult(null); setAiError(null); setRefineFeedback("");
  }

  const JSON_SHAPE = `{"name":"short meal name","calories":420,"protein":35,"carbs":30,"fat":12,"note":"brief 1-sentence description"}`;
  const JSON_RULES = `All macro values are integers in grams. calories is an integer in kcal. Return ONLY valid JSON (no markdown, no backticks).`;

  async function callAI(content) {
    const res = await fetch("/api/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 400, messages: [{ role: "user", content }] }),
    });
    const text = await res.text(); let data; try { data = JSON.parse(text); } catch(e) { throw new Error("API returned: " + text.slice(0, 100)); }
    const raw = data.content?.find(b => b.type === "text")?.text || "";
    if (!raw) throw new Error("Empty AI response"); return JSON.parse(raw.replace(/```json|```/g, "").trim());
  }

  async function analyse() {
    if (!imageFile) return;
    setAnalysing(true); setAiError(null); setAiResult(null); setEditResult(null);
    try {
      const b64 = await toBase64(imageFile);
      const parsed = await callAI([
        { type: "image", source: { type: "base64", media_type: imageFile.type || "image/jpeg", data: b64 } },
        { type: "text", text: `You are a nutrition expert. Analyse the food in this image${note ? ` (additional context: "${note}")` : ""}.\n\nReturn ONLY valid JSON in this exact shape:\n${JSON_SHAPE}\n\n${JSON_RULES}` },
      ]);
      setAiResult(parsed); setEditResult({ ...parsed });
    } catch(err) {
      setAiError("Error: " + err.message);
      setEditResult({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0, note: "" });
    } finally { setAnalysing(false); }
  }

  async function analyseText() {
    if (!note.trim()) return;
    setAnalysing(true); setAiError(null); setAiResult(null); setEditResult(null);
    try {
      const parsed = await callAI([
        { type: "text", text: `You are a nutrition expert. Estimate the nutritional content of this meal based on the description:\n\n"${note}"\n\nBe realistic about typical portion sizes if not specified. Return ONLY valid JSON in this exact shape:\n${JSON_SHAPE}\n\n${JSON_RULES}` },
      ]);
      setAiResult(parsed); setEditResult({ ...parsed });
    } catch(err) {
      setAiError("Error: " + err.message);
      setEditResult({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0, note: "" });
    } finally { setAnalysing(false); }
  }

  async function reanalyse() {
    if (!refineFeedback.trim()) return;
    setRefining(true); setAiError(null);
    try {
      const prevSummary = `Name: ${aiResult.name}, Calories: ${aiResult.calories} kcal, Protein: ${aiResult.protein}g, Carbs: ${aiResult.carbs}g, Fat: ${aiResult.fat}g.`;
      const content = imageFile
        ? [
            { type: "image", source: { type: "base64", media_type: imageFile.type || "image/jpeg", data: await toBase64(imageFile) } },
            { type: "text", text: `You are a nutrition expert. You previously analysed this meal as:\n${prevSummary}\n\nThe user's correction: "${refineFeedback}"\n\nRe-analyse taking this into account. Return ONLY valid JSON:\n${JSON_SHAPE}\n\n${JSON_RULES}` },
          ]
        : [{ type: "text", text: `You are a nutrition expert. You previously estimated this meal as:\n${prevSummary}\nOriginal description: "${note}"\n\nThe user's correction: "${refineFeedback}"\n\nRe-estimate taking this into account. Return ONLY valid JSON:\n${JSON_SHAPE}\n\n${JSON_RULES}` }];
      const parsed = await callAI(content);
      setAiResult(parsed); setEditResult({ ...parsed }); setRefineFeedback("");
    } catch(err) {
      setAiError("Re-analysis failed. You can still edit the values manually.");
    } finally { setRefining(false); }
  }

  function addMeal() {
    if (!editResult) return;
    setMeals(prev => [...prev, { id: Date.now(), imageUrl: imagePreview, ...editResult, calories: +editResult.calories, protein: +editResult.protein, carbs: +editResult.carbs, fat: +editResult.fat }]);
    setImageFile(null); setImagePreview(null); setNote(""); setAiResult(null); setEditResult(null); setRefineFeedback("");
    if (fileRef.current) fileRef.current.value = "";
  }

  const totals = meals.reduce((a, m) => ({ calories: a.calories+m.calories, protein: a.protein+m.protein, carbs: a.carbs+m.carbs, fat: a.fat+m.fat }), { calories:0, protein:0, carbs:0, fat:0 });
  const todayLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Helvetica Neue', Helvetica, Arial, sans-serif", paddingBottom:80 }}>
      <style>{`
        *{box-sizing:border-box}
        input:focus{border-color:${C.accent}!important;outline:none;box-shadow:0 0 0 3px ${C.accent}18}
        button:hover{opacity:.82}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${C.borderMed};border-radius:4px}
      `}</style>

      {/* Header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:10, padding:"0 20px" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <div style={{ paddingTop:16, display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
            <span style={{ fontSize:16, fontWeight:600, letterSpacing:"-0.01em", color:C.text }}>NutriTrack</span>
            <span style={{ fontSize:12, color:C.textMuted }}>{todayLabel}</span>
          </div>
          <div style={{ display:"flex", marginTop:10 }}>
            {[["today","Today"],["history","History"],["goals","Goals"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background:"none", border:"none", color: tab===id ? C.accent : C.textSub,
                fontSize:13, fontWeight: tab===id ? 500 : 400, cursor:"pointer",
                padding:"8px 14px 10px", borderBottom:`2px solid ${tab===id ? C.accent : "transparent"}`,
                marginBottom:-1, fontFamily:"inherit", transition:"color .15s", letterSpacing:"0.01em",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"20px 16px" }}>

        {/* TODAY */}
        {tab === "today" && <>
          {/* Summary */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18, marginBottom:16, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
            <CalorieRing value={totals.calories} goal={goals.calories} />
            <div style={{ flex:1, minWidth:160 }}>
              <MacroBar label="Protein" value={totals.protein} goal={goals.protein} color={C.protein} />
              <MacroBar label="Carbs"   value={totals.carbs}   goal={goals.carbs}   color={C.carbs} />
              <MacroBar label="Fat"     value={totals.fat}     goal={goals.fat}     color={C.fat} />
            </div>
          </div>

          {/* Add meal */}
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18, marginBottom:16 }}>
            <div style={{ fontSize:11, color:C.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>Add meal</div>

            <div onClick={() => fileRef.current?.click()} style={{
              border:`1.5px dashed ${imagePreview ? C.accent : C.borderMed}`, borderRadius:10,
              overflow:"hidden", height: imagePreview ? "auto" : 96,
              display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
              background: imagePreview ? "transparent" : C.surfaceAlt, marginBottom:12, transition:"border-color .2s",
            }}>
              {imagePreview
                ? <img src={imagePreview} alt="food preview" style={{ width:"100%", maxHeight:200, objectFit:"cover", display:"block" }} />
                : <div style={{ textAlign:"center", color:C.textMuted, padding:12 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.borderMed} strokeWidth="1.5" strokeLinecap="round" style={{ display:"block", margin:"0 auto 6px" }}>
                      <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize:12 }}>Upload a food photo</span>
                  </div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display:"none" }} />

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={imageFile ? "Describe what's in the photo (optional) — e.g. large portion, grilled not fried…" : "Describe your meal — e.g. 2 scrambled eggs, 2 slices of toast with butter and a black coffee…"}
              rows={imageFile ? 2 : 3}
              style={{ ...inputSt, marginBottom:12, fontSize:13, resize:"vertical", lineHeight:1.5 }}
            />

            {!editResult && (imageFile || note.trim()) && (
              <button
                onClick={imageFile ? analyse : analyseText}
                disabled={analysing || (!imageFile && !note.trim())}
                style={{ ...btnPrimary, width:"100%", padding:"10px 0", opacity: analysing ? 0.65 : 1, marginBottom: 8 }}>
                {analysing ? "Analysing…" : imageFile ? "Analyse photo with AI" : "Analyse description with AI"}
              </button>
            )}

            {aiError && (
              <div style={{ color:C.danger, fontSize:12, marginTop:8, padding:"8px 10px", background:"#fceeee", borderRadius:7, border:`1px solid ${C.danger}20` }}>
                {aiError}
              </div>
            )}

            {editResult && (
              <div style={{ background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:10, padding:14, marginTop:4 }}>
                {aiResult && (
                  <div style={{ fontSize:11, color:C.accent, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:10, fontWeight:500 }}>
                    AI estimate — edit if needed
                  </div>
                )}
                <input value={editResult.name} onChange={e => setEditResult({ ...editResult, name: e.target.value })}
                  placeholder="Meal name" style={{ ...inputSt, marginBottom:10 }} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
                  {[["calories","Calories (kcal)",C.accent],["protein","Protein (g)",C.protein],["carbs","Carbs (g)",C.carbs],["fat","Fat (g)",C.fat]].map(([k,label,color]) => (
                    <div key={k}>
                      <label style={{ fontSize:10, color:C.textMuted, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:4 }}>{label}</label>
                      <input type="number" min="0" value={editResult[k]} onChange={e => setEditResult({ ...editResult, [k]: e.target.value })} style={{ ...inputSt, color, fontWeight:500 }} />
                    </div>
                  ))}
                </div>
                <input value={editResult.note||""} onChange={e => setEditResult({ ...editResult, note: e.target.value })}
                  placeholder="Notes (optional)" style={{ ...inputSt, marginBottom:12, fontSize:13 }} />

                {/* Refine with feedback */}
                {aiResult && (
                  <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12, marginBottom:12 }}>
                    <div style={{ fontSize:11, color:C.textMuted, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:8 }}>
                      Refine with a correction
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <input
                        value={refineFeedback}
                        onChange={e => setRefineFeedback(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !refining && refineFeedback.trim() && reanalyse()}
                        placeholder="e.g. it was without sugar, double portion, skimmed milk…"
                        style={{ ...inputSt, flex:1, fontSize:13 }}
                      />
                      <button
                        onClick={reanalyse}
                        disabled={refining || !refineFeedback.trim()}
                        style={{ ...btnPrimary, padding:"9px 14px", whiteSpace:"nowrap", opacity: (refining || !refineFeedback.trim()) ? 0.5 : 1, flexShrink:0 }}
                      >
                        {refining ? "…" : "Re-analyse"}
                      </button>
                    </div>
                  </div>
                )}

                <button onClick={addMeal} style={{ ...btnPrimary, width:"100%", padding:"10px 0" }}>Add to today</button>
              </div>
            )}

            {!editResult && !imageFile && !note.trim() && (
              <button onClick={() => setEditResult({ name:"", calories:0, protein:0, carbs:0, fat:0, note:"" })} style={btnGhost}>
                Enter manually
              </button>
            )}
          </div>

          {meals.length > 0 && <>
            <div style={{ fontSize:11, color:C.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Today's meals</div>
            {meals.map(m => <MealCard key={m.id} meal={m} onDelete={() => setMeals(p => p.filter(x => x.id !== m.id))} onEdit={u => setMeals(p => p.map(x => x.id === m.id ? { ...x, ...u } : x))} />)}
          </>}

          {meals.length === 0 && (
            <div style={{ textAlign:"center", color:C.textMuted, fontSize:13, marginTop:30, lineHeight:1.6 }}>
              No meals logged yet.<br />Upload a photo or enter manually above.
            </div>
          )}
        </>}

        {/* HISTORY */}
        {tab === "history" && <>
          <div style={{ fontSize:11, color:C.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:14 }}>Past 14 days</div>
          {Object.entries(history).filter(([d]) => d !== today).sort(([a],[b]) => b.localeCompare(a)).slice(0,14).map(([date, dayMeals]) => {
            const dt = dayMeals.reduce((a,m) => ({ calories:a.calories+m.calories, protein:a.protein+m.protein, carbs:a.carbs+m.carbs, fat:a.fat+m.fat }), { calories:0,protein:0,carbs:0,fat:0 });
            const calPct = Math.round((dt.calories / goals.calories) * 100);
            return (
              <div key={date} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"13px 14px", marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:500, color:C.text }}>
                    {new Date(date+"T12:00:00").toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" })}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:13, fontWeight:600, color: dt.calories > goals.calories ? C.danger : C.accent }}>{dt.calories} kcal</span>
                    <span style={{ fontSize:11, color:C.textMuted, background:C.surfaceAlt, border:`1px solid ${C.border}`, borderRadius:5, padding:"2px 7px" }}>{calPct}%</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Tag label={`P ${dt.protein}g`} color={C.protein} bg={C.proteinBg} />
                  <Tag label={`C ${dt.carbs}g`}   color={C.carbs}   bg={C.carbsBg} />
                  <Tag label={`F ${dt.fat}g`}      color={C.fat}     bg={C.fatBg} />
                  <Tag label={`${dayMeals.length} meal${dayMeals.length>1?"s":""}`} color={C.textSub} bg={C.surfaceAlt} />
                </div>
              </div>
            );
          })}
          {Object.keys(history).filter(d => d !== today).length === 0 && (
            <div style={{ textAlign:"center", color:C.textMuted, fontSize:13, marginTop:40, lineHeight:1.6 }}>
              No history yet.<br />Start logging meals on the Today tab.
            </div>
          )}
        </>}

        {/* GOALS */}
        {tab === "goals" && (
          <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20 }}>
            <div style={{ fontSize:11, color:C.textMuted, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:18 }}>Daily targets</div>
            {[["calories","Calories","kcal",C.accent],["protein","Protein","g",C.protein],["carbs","Carbohydrates","g",C.carbs],["fat","Fat","g",C.fat]].map(([k,label,unit,color]) => (
              <div key={k} style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, color:C.textSub, letterSpacing:"0.03em", display:"block", marginBottom:5 }}>
                  {label} <span style={{ color:C.textMuted }}>({unit})</span>
                </label>
                <input type="number" min="0" value={goalDraft[k]} onChange={e => setGoalDraft({ ...goalDraft, [k]: +e.target.value })}
                  style={{ ...inputSt, color, fontWeight:500 }} />
              </div>
            ))}
            <button onClick={() => setGoals({ ...goalDraft })} style={{ ...btnPrimary, width:"100%", padding:"11px 0", marginTop:4 }}>
              Save goals
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
