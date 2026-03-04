"use client";
import React, { useState, useEffect, useRef, CSSProperties } from "react";

// ═══════════════════════════════════════════
// Design Tokens — Riverwood brand
// ═══════════════════════════════════════════

const C = {
  bg: "#F7F6F3",
  surface: "#FFFFFF",
  border: "#E8E6E1",
  navy: "#0B1D3A",
  green: "#1B5E3B",
  greenBg: "rgba(27,94,59,0.06)",
  greenAccent: "#3AA06B",
  yellow: "#C4960A",
  yellowBg: "rgba(196,150,10,0.08)",
  red: "#B5362A",
  redBg: "rgba(181,54,42,0.08)",
  text: "#1A1A1A",
  dim: "#5A5A52",
  muted: "#9A9A90",
  white: "#FFFFFF",
  shadowLg: "0 8px 30px rgba(11,29,58,0.1)",
};

// ═══════════════════════════════════════════
// Data constants
// ═══════════════════════════════════════════

const SP_SUBS = [
  "Analysis",
  "Confirmatory",
  "NDA",
  "RW Presentations",
  "Term Sheet",
  "VDR",
];

const PLAYS = [
  { title: "Sales Capacity Modeling", file: "RSP - Sales Capacity Modeling v2.pdf", icon: "📊", category: "GTM" },
  { title: "R&D Efficiency & Cloud FinOps", file: "RSP Case Study - R&D Efficiency & Cloud FinOps.pdf", icon: "☁️", category: "Operations" },
  { title: "TAM and Segmentation", file: "RSP Case Study - TAM and Segmentation.pdf", icon: "🎯", category: "GTM" },
  { title: "AI M&A", file: "RSP Play - AI M&A.pdf", icon: "🤖", category: "Strategy" },
  { title: "O-SaaS", file: "RSP Play - O-SaaS.pdf", icon: "⚙️", category: "Strategy" },
  { title: "Pricing Models", file: "RSP Play - Pricing Models.pdf", icon: "💰", category: "GTM" },
  { title: "Churn Reduction", file: "RSP Playbook - Churn Reduction.pdf", icon: "🔄", category: "Customer Success" },
  { title: "Pipeline & Forecasting", file: "RSP-Pipeline and Tops Down Forecasting-vF.pdf", icon: "📈", category: "GTM" },
  { title: "2024 Offsite Plays", file: "2024 Offsite Plays.pdf", icon: "📋", category: "General" },
];

const TEMPLATES = [
  { title: "Exit Planning Template", file: "Exit Planning Template.pdf", icon: "🚀" },
  { title: "RSP Tracker Template", file: "RSP Tracker Template.pdf", icon: "📝" },
];

// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

interface Co {
  id: string; name: string; stage: string; sector: string; health: string;
  invested: string; deployed: string; ownership: string; board: string;
  logo: string; sp_folder: string; sp_group: string;
}
interface Mat {
  id: string; company_id: string; title: string; date: string;
  snippet: string; source: string; folder: string;
}
interface Init {
  id: string; company_id: string; title: string; status: string;
  owner: string; due_date: string; notes: string;
}
interface Mem {
  id: string; company_id: string; insight: string; created_at: string;
}
interface Play {
  title: string; file: string; icon: string; category: string;
}

// ═══════════════════════════════════════════
// API helpers
// ═══════════════════════════════════════════

const api = {
  get: async (url: string) => {
    const r = await fetch(url);
    return r.json();
  },
  post: async (url: string, body: Record<string, unknown>) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json();
  },
  put: async (url: string, body: Record<string, unknown>) => {
    const r = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json();
  },
  del: async (url: string, body: Record<string, unknown>) => {
    const r = await fetch(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json();
  },
};

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

const sColor = (s: string) =>
  s === "complete" ? C.green : s === "in-progress" ? C.yellow : C.muted;
const sBg = (s: string) =>
  s === "complete" ? C.greenBg : s === "in-progress" ? C.yellowBg : "rgba(154,154,144,0.08)";
const sLabel = (s: string) =>
  s === "complete" ? "Complete" : s === "in-progress" ? "In Progress" : "Not Started";
const hColor = (h: string) =>
  h === "green" ? C.greenAccent : h === "yellow" ? C.yellow : C.red;
const hBg = (h: string) =>
  h === "green" ? C.greenBg : h === "yellow" ? C.yellowBg : C.redBg;
const hLabel = (h: string) =>
  h === "green" ? "Healthy" : h === "yellow" ? "Watch" : "At Risk";

// ═══════════════════════════════════════════
// Shared UI components
// ═══════════════════════════════════════════

function Badge({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 3, color, background: bg, letterSpacing: 0.5, textTransform: "uppercase" }}>
      {children}
    </span>
  );
}

function Btn({ children, primary, small, disabled, onClick, style: sx }: {
  children: React.ReactNode; primary?: boolean; small?: boolean;
  disabled?: boolean; onClick?: () => void; style?: CSSProperties;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: small ? "6px 14px" : "9px 20px", borderRadius: 4,
      border: primary ? "none" : `1px solid ${C.border}`,
      background: primary ? C.navy : C.white,
      color: primary ? C.white : C.text,
      fontSize: small ? 12 : 13, fontWeight: 500,
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1, letterSpacing: 0.2, ...sx,
    }}>
      {children}
    </button>
  );
}

function Modal({ open, onClose, title, width, children }: {
  open: boolean; onClose: () => void; title: string;
  width?: number; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(11,29,58,0.3)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 8, padding: 28, width: "90%", maxWidth: width || 500, maxHeight: "80vh", overflowY: "auto", boxShadow: C.shadowLg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 18, fontWeight: 600, color: C.navy }}>{title}</span>
          <span onClick={onClose} style={{ cursor: "pointer", color: C.muted, fontSize: 20 }}>×</span>
        </div>
        {children}
      </div>
    </div>
  );
}

const inp: CSSProperties = {
  width: "100%", padding: "9px 14px", borderRadius: 4,
  border: `1px solid ${C.border}`, background: C.white, color: C.text,
  fontSize: 13, outline: "none", marginBottom: 12, fontFamily: "inherit",
};

// ═══════════════════════════════════════════
// Tab: RSP Plays (firm-wide)
// ═══════════════════════════════════════════

function PlaybooksTab({ company, onApplied }: { company: Co; onApplied: () => void }) {
  const [viewing, setViewing] = useState<Play | null>(null);
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  const view = async (play: Play) => {
    setViewing(play); setDetail(""); setLoading(true);
    const res = await api.post("/api/plays", {
      fileName: play.file, title: play.title,
      category: play.category, action: "summarize",
    });
    setDetail(res.summary || "Could not load.");
    setLoading(false);
  };

  const apply = async () => {
    if (!viewing) return;
    const res = await api.post("/api/plays", {
      fileName: viewing.file, title: viewing.title,
      category: viewing.category, action: "apply",
      companyName: company.name, companySector: company.sector,
      companyStage: company.stage,
    });
    if (res.steps?.length) {
      for (const s of res.steps) {
        await api.post("/api/initiatives", {
          company_id: company.id, title: s.title,
          owner: s.owner || "TBD",
          notes: `RSP Play: ${viewing.title}`, status: "not-started",
        });
      }
      onApplied();
    }
    setViewing(null);
  };

  const cats = [...new Set(PLAYS.map((p) => p.category))];

  return (
    <div>
      <p style={{ fontSize: 13, color: C.dim, marginBottom: 20, lineHeight: 1.6 }}>
        Riverwood&apos;s operating playbooks from{" "}
        <span style={{ color: C.green, fontWeight: 500 }}>SharePoint / RSP.AI</span>.
        These apply across all portfolio companies.
      </p>
      {cats.map((cat) => (
        <div key={cat} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>{cat}</div>
          {PLAYS.filter((p) => p.category === cat).map((play) => (
            <div key={play.file} onClick={() => view(play)} style={{ padding: "14px 16px", background: C.white, borderRadius: 6, border: `1px solid ${C.border}`, cursor: "pointer", marginBottom: 6, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 22, width: 36, textAlign: "center" }}>{play.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.navy }}>{play.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{play.file}</div>
              </div>
              <span style={{ fontSize: 12, color: C.muted }}>→</span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Templates</div>
      {TEMPLATES.map((t) => (
        <div key={t.file} style={{ padding: "14px 16px", background: C.white, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 22, width: 36, textAlign: "center" }}>{t.icon}</span>
          <div><div style={{ fontSize: 14, fontWeight: 500, color: C.navy }}>{t.title}</div></div>
        </div>
      ))}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.title || ""} width={620}>
        {viewing && (
          <div>
            <div style={{ marginBottom: 20 }}><Badge color={C.green} bg={C.greenBg}>{viewing.category}</Badge></div>
            {loading ? (
              <p style={{ color: C.muted, padding: 30, textAlign: "center", animation: "pulse 1.5s infinite" }}>Reading from SharePoint…</p>
            ) : (
              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.75, whiteSpace: "pre-wrap", marginBottom: 24 }}>{detail}</div>
            )}
            <Btn primary onClick={apply} style={{ width: "100%" }}>
              Apply to {company.name} → Create Initiatives
            </Btn>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// Tab: Initiatives (per company)
// ═══════════════════════════════════════════

function InitiativesTab({ company, refreshKey }: { company: Co; refreshKey: number }) {
  const [inits, setInits] = useState<Init[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", owner: "", due_date: "", notes: "" });

  const load = async () => {
    const d = await api.get(`/api/initiatives?companyId=${company.id}`);
    if (Array.isArray(d)) setInits(d);
  };

  useEffect(() => { load(); }, [company.id, refreshKey]);

  const add = async () => {
    if (!form.title.trim()) return;
    await api.post("/api/initiatives", { company_id: company.id, ...form, status: "not-started" });
    setForm({ title: "", owner: "", due_date: "", notes: "" });
    setShowAdd(false);
    load();
  };

  const cycle = async (ini: Init) => {
    const order = ["not-started", "in-progress", "complete"];
    const next = order[(order.indexOf(ini.status) + 1) % 3];
    await api.put("/api/initiatives", { id: ini.id, status: next });
    load();
  };

  const remove = async (id: string) => {
    await api.del("/api/initiatives", { id });
    load();
  };

  const fromPlay = inits.filter((i) => i.notes?.startsWith("RSP Play"));
  const manual = inits.filter((i) => !i.notes?.startsWith("RSP Play"));

  const renderList = (list: Init[], label?: string) => (
    <>
      {label && list.length > 0 && (
        <div style={{ fontSize: 11, fontWeight: 600, color: label === "FROM RSP PLAYS" ? C.green : C.muted, letterSpacing: 1, marginBottom: 8, marginTop: label === "CUSTOM" ? 20 : 0, textTransform: "uppercase" }}>{label}</div>
      )}
      {list.map((ini) => (
        <div key={ini.id} style={{ padding: "14px 16px", background: C.white, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div onClick={() => cycle(ini)} style={{ width: 18, height: 18, borderRadius: 3, border: `2px solid ${sColor(ini.status)}`, background: ini.status === "complete" ? C.green : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.white, flexShrink: 0 }}>
              {ini.status === "complete" ? "✓" : ""}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: ini.status === "complete" ? C.muted : C.navy, flex: 1, textDecoration: ini.status === "complete" ? "line-through" : "none" }}>{ini.title}</span>
            <Badge color={sColor(ini.status)} bg={sBg(ini.status)}>{sLabel(ini.status)}</Badge>
            <span onClick={() => remove(ini.id)} style={{ cursor: "pointer", color: C.muted, fontSize: 16 }}>×</span>
          </div>
          {ini.notes && <div style={{ fontSize: 12, color: ini.notes.startsWith("RSP") ? C.green : C.dim, marginLeft: 28, marginBottom: 4 }}>{ini.notes}</div>}
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.muted, marginLeft: 28 }}>
            {ini.owner && <span>Owner: {ini.owner}</span>}
            {ini.due_date && <span>Due: {ini.due_date}</span>}
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Btn primary small onClick={() => setShowAdd(true)}>+ Add Initiative</Btn>
      </div>
      {!inits.length && <p style={{ color: C.muted, fontSize: 13, padding: 30, textAlign: "center" }}>No initiatives yet. Add manually or apply an RSP Play.</p>}
      {renderList(fromPlay, fromPlay.length ? "FROM RSP PLAYS" : undefined)}
      {renderList(manual, manual.length && fromPlay.length ? "CUSTOM" : undefined)}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Initiative">
        <input style={inp} placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <input style={inp} placeholder="Owner" value={form.owner} onChange={(e) => setForm((p) => ({ ...p, owner: e.target.value }))} />
        <input style={inp} placeholder="Due (YYYY-MM-DD)" value={form.due_date} onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))} />
        <input style={{ ...inp, marginBottom: 18 }} placeholder="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        <Btn primary onClick={add} style={{ width: "100%" }}>Add</Btn>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════
// Tab: Materials (per company)
// ═══════════════════════════════════════════

function MaterialsTab({ company }: { company: Co }) {
  const [mats, setMats] = useState<Mat[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [log, setLog] = useState("");

  const load = async () => {
    const d = await api.get(`/api/materials?companyId=${company.id}`);
    if (Array.isArray(d)) setMats(d);
  };

  useEffect(() => { load(); }, [company.id]);

  const syncSP = async () => {
    if (!company.sp_folder) return;
    setSyncing(true); setLog("Syncing…");
    const res = await api.post("/api/sharepoint", {
      companyId: company.id, companyName: company.name,
      spGroup: company.sp_group, spFolder: company.sp_folder,
      subfolders: SP_SUBS,
    });
    setLog(`${res.added || 0} new documents synced.`);
    setSyncing(false);
    load();
  };

  const spPath = company.sp_folder
    ? `CompaniesDataRoom/${company.sp_group}/${company.sp_folder}`
    : null;

  return (
    <div>
      {spPath && (
        <div style={{ fontSize: 13, color: C.dim, marginBottom: 16, padding: "10px 14px", background: C.greenBg, borderRadius: 4, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: C.greenAccent }} />
          <span>Connected to <strong style={{ color: C.navy }}>{spPath}</strong></span>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Btn primary small onClick={syncSP} disabled={syncing || !spPath}>{syncing ? "Syncing…" : "Sync SharePoint"}</Btn>
      </div>
      {log && <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{log}</p>}
      {!mats.length && <p style={{ color: C.muted, fontSize: 13, padding: 30, textAlign: "center" }}>{spPath ? "Sync to pull documents." : "No SharePoint folder linked."}</p>}
      {mats.map((m) => (
        <div key={m.id} style={{ padding: "14px 16px", background: C.white, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 22, height: 22, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: m.source === "Notion" ? C.bg : C.greenBg, color: m.source === "Notion" ? C.muted : C.green }}>
              {m.source === "Notion" ? "N" : "SP"}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.navy, flex: 1 }}>{m.title}</span>
            <span style={{ fontSize: 12, color: C.muted }}>{m.date}</span>
          </div>
          <div style={{ fontSize: 13, color: C.dim, lineHeight: 1.6, marginLeft: 32 }}>{m.snippet}</div>
          {m.folder && <div style={{ marginLeft: 32, marginTop: 6 }}><Badge color={C.muted} bg={C.bg}>{m.folder}</Badge></div>}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Tab: Diagnose & Ask (per company + plays)
// ═══════════════════════════════════════════

function DiagnoseTab({ company }: { company: Co }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  useEffect(() => { setMessages([]); }, [company.id]);

  const send = async () => {
    if (!query.trim() || loading) return;
    const userMsg = { role: "user", content: query };
    const nm = [...messages, userMsg];
    setMessages(nm);
    setQuery("");
    setLoading(true);
    try {
      const system = `You are RSP.ai, Riverwood Capital's Scalability Playbook intelligence engine.

COMPANY: ${company.name} | ${company.sector} | ${company.stage} | Health: ${company.health} | Deployed: ${company.deployed} | Ownership: ${company.ownership}
SHAREPOINT: CompaniesDataRoom/${company.sp_group}/${company.sp_folder}

AVAILABLE RSP PLAYS: ${PLAYS.map((p) => p.title).join(", ")}

INSTRUCTIONS:
- Be direct, specific, and action-oriented.
- Reference Riverwood RSP plays when relevant.
- Recommend specific next steps with owners.
- End EVERY response with "MEMORY:" followed by one key insight to remember.`;

      const res = await api.post("/api/claude", { system, messages: nm });
      let text: string = res.text || "Unable to respond.";

      // Extract memory
      const mm = text.match(/MEMORY:\s*(.+)/i);
      if (mm) {
        await api.post("/api/memory", {
          company_id: company.id,
          insight: mm[1].trim(),
        });
        text = text.replace(/MEMORY:\s*.+/i, "").trim();
      }
      setMessages((p) => [...p, { role: "assistant", content: text }]);
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "Connection error." }]);
    }
    setLoading(false);
  };

  const renderMd = (t: string) =>
    t.split("\n").map((ln, i) => (
      <div key={i} style={{ marginBottom: ln === "" ? 10 : 2 }}>
        {ln.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j} style={{ color: C.navy }}>{p.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{p}</span>
          )
        )}
      </div>
    ));

  const starters = [
    `What are the biggest risks for ${company.name}?`,
    `Which RSP play should we apply?`,
    `How should we think about scaling ${company.name}?`,
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 240px)", minHeight: 400 }}>
      <div ref={ref} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 14 }}>
        {!messages.length && (
          <div style={{ padding: 30, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: C.navy, marginBottom: 6 }}>{company.name}</div>
            {company.sp_folder && <p style={{ fontSize: 12, color: C.green, marginBottom: 24 }}>SharePoint connected</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 440, margin: "0 auto" }}>
              {starters.map((s, i) => (
                <div key={i} onClick={() => setQuery(s)} style={{ padding: "12px 16px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, fontSize: 13, color: C.dim, cursor: "pointer", textAlign: "left" }}>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "82%", padding: "12px 16px", borderRadius: 8,
            background: m.role === "user" ? C.navy : C.white,
            border: m.role === "user" ? "none" : `1px solid ${C.border}`,
            color: m.role === "user" ? C.white : C.text,
            fontSize: 14, lineHeight: 1.7,
          }}>
            {m.role === "assistant" ? renderMd(m.content) : m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", padding: "12px 16px", borderRadius: 8, background: C.white, border: `1px solid ${C.border}`, color: C.muted, fontSize: 13 }}>
            <span style={{ animation: "pulse 1.5s infinite" }}>Analyzing…</span>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={`Ask about ${company.name}…`}
          style={{ flex: 1, padding: "11px 16px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
        <Btn primary onClick={send} disabled={loading || !query.trim()}>Send</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Tab: Memory (per company)
// ═══════════════════════════════════════════

function MemoryTab({ company }: { company: Co }) {
  const [mem, setMem] = useState<Mem[]>([]);

  useEffect(() => {
    (async () => {
      const d = await api.get(`/api/memory?companyId=${company.id}`);
      if (Array.isArray(d)) setMem(d);
    })();
  }, [company.id]);

  if (!mem.length) {
    return <p style={{ color: C.muted, fontSize: 13, padding: 30, textAlign: "center" }}>Conversations will build institutional memory here.</p>;
  }

  return (
    <div>
      <p style={{ fontSize: 13, color: C.dim, marginBottom: 16 }}>Key insights about {company.name}.</p>
      {mem.map((m) => (
        <div key={m.id} style={{ padding: "12px 16px", background: C.white, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 6, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 3, height: 36, borderRadius: 2, background: C.green, flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 14, color: C.text, lineHeight: 1.6 }}>{m.insight}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{m.created_at?.split("T")[0]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Main App
// ═══════════════════════════════════════════

export default function RSPApp() {
  const [companies, setCompanies] = useState<Co[]>([]);
  const [selected, setSelected] = useState<Co | null>(null);
  const [tab, setTab] = useState("diagnose");
  const [sidebar, setSidebar] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [initKey, setInitKey] = useState(0);
  const [form, setForm] = useState({
    name: "", stage: "Series B", sector: "", deployed: "", ownership: "",
    board: "No", health: "green", invested: "", sp_folder: "", sp_group: "",
  });

  const loadCompanies = async () => {
    const d = await api.get("/api/companies");
    if (Array.isArray(d)) {
      setCompanies(d);
      if (!selected && d.length) setSelected(d[0]);
    }
  };

  useEffect(() => { loadCompanies(); }, []);

  const addCo = async () => {
    if (!form.name.trim()) return;
    const nw = await api.post("/api/companies", form);
    setShowAdd(false);
    setForm({ name: "", stage: "Series B", sector: "", deployed: "", ownership: "", board: "No", health: "green", invested: "", sp_folder: "", sp_group: "" });
    await loadCompanies();
    setSelected(nw);
    setTab("materials");
  };

  const removeCo = async (id: string) => {
    await api.del("/api/companies", { id });
    setConfirmDel(null);
    await loadCompanies();
    if (selected?.id === id && companies.length > 1) {
      setSelected(companies.find((c) => c.id !== id) || null);
    }
  };

  const sum = {
    g: companies.filter((c) => c.health === "green").length,
    y: companies.filter((c) => c.health === "yellow").length,
    r: companies.filter((c) => c.health === "red").length,
  };

  const tabs = [
    { key: "diagnose", label: "Diagnose" },
    { key: "materials", label: "Materials" },
    { key: "playbooks", label: `RSP Plays (${PLAYS.length})` },
    { key: "initiatives", label: "Initiatives" },
    { key: "memory", label: "Memory" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text }}>
      {/* ── Sidebar ── */}
      <div style={{ width: sidebar ? 272 : 0, overflow: "hidden", transition: "width 0.2s", borderRight: `1px solid ${C.border}`, background: C.white, display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <rect width="28" height="28" rx="4" fill={C.navy} />
              <path d="M7 8h4l3 5 3-5h4v12h-3.5v-7l-3.5 5.5L10.5 13v7H7V8z" fill="#fff" />
            </svg>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, letterSpacing: -0.5 }}>RSP.ai</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 1.5, textTransform: "uppercase" }}>Riverwood Capital</div>
            </div>
          </div>
        </div>

        {/* Health Summary */}
        <div style={{ padding: "14px 20px", display: "flex", gap: 8, borderBottom: `1px solid ${C.border}` }}>
          {([["Healthy", sum.g, C.greenAccent, C.greenBg], ["Watch", sum.y, C.yellow, C.yellowBg], ["At Risk", sum.r, C.red, C.redBg]] as const).map(([l, n, c, bg]) => (
            <div key={l} style={{ flex: 1, padding: "8px 6px", borderRadius: 4, background: bg, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{n}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: C.muted, letterSpacing: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Portfolio List */}
        <div style={{ padding: "14px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>Portfolio ({companies.length})</span>
          <span onClick={() => setShowAdd(true)} style={{ width: 22, height: 22, borderRadius: 4, border: `1px solid ${C.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.muted, fontSize: 14 }}>+</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 10px 10px" }}>
          {companies.map((co) => (
            <div key={co.id} onClick={() => { setSelected(co); setTab("diagnose"); setConfirmDel(null); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                borderRadius: 6, cursor: "pointer", marginBottom: 2, position: "relative",
                background: selected?.id === co.id ? C.greenBg : "transparent",
                border: `1px solid ${selected?.id === co.id ? "rgba(27,94,59,0.15)" : "transparent"}`,
              }}>
              <div style={{ width: 36, height: 36, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: C.navy, color: C.white, fontSize: 12, fontWeight: 700 }}>{co.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{co.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{co.sector}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: 4, background: hColor(co.health) }} />
                <span onClick={(e) => { e.stopPropagation(); setConfirmDel(co.id === confirmDel ? null : co.id); }}
                  style={{ color: C.muted, fontSize: 14, cursor: "pointer", opacity: 0.3 }}>×</span>
              </div>
              {confirmDel === co.id && (
                <div onClick={(e) => e.stopPropagation()}
                  style={{ position: "absolute", right: -4, top: "100%", zIndex: 50, background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14, width: 200, boxShadow: C.shadowLg }}>
                  <p style={{ fontSize: 13, marginBottom: 10 }}>Remove <strong>{co.name}</strong>?</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn small onClick={() => removeCo(co.id)} style={{ flex: 1, background: C.red, color: C.white, border: "none" }}>Remove</Btn>
                    <Btn small onClick={() => setConfirmDel(null)} style={{ flex: 1 }}>Cancel</Btn>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        {selected && (
          <div style={{ padding: "16px 28px", borderBottom: `1px solid ${C.border}`, background: C.white, display: "flex", alignItems: "center", gap: 20 }}>
            <div onClick={() => setSidebar(!sidebar)} style={{ cursor: "pointer", color: C.muted }}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <path d="M1 1h16M1 7h16M1 13h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: C.navy, color: C.white, fontSize: 15, fontWeight: 700 }}>{selected.logo}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{selected.name}</div>
                <div style={{ fontSize: 13, color: C.dim }}>
                  {selected.sector} · {selected.stage}
                  {selected.sp_folder && <span style={{ color: C.green }}> · {selected.sp_group}/{selected.sp_folder}</span>}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              {([["Deployed", selected.deployed], ["Ownership", selected.ownership], ["Board", selected.board]] as const).map(([l, v]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{v || "—"}</div>
                </div>
              ))}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Health</div>
                <Badge color={hColor(selected.health)} bg={hBg(selected.health)}>{hLabel(selected.health)}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Tabs + Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 28px 28px" }}>
          {selected ? (
            <>
              <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
                {tabs.map((t) => (
                  <div key={t.key} onClick={() => setTab(t.key)}
                    style={{
                      padding: "14px 18px", fontSize: 13, cursor: "pointer",
                      fontWeight: tab === t.key ? 600 : 400,
                      color: tab === t.key ? C.navy : C.muted,
                      borderBottom: `2px solid ${tab === t.key ? C.green : "transparent"}`,
                      whiteSpace: "nowrap",
                    }}>
                    {t.label}
                  </div>
                ))}
              </div>
              {tab === "diagnose" && <DiagnoseTab company={selected} />}
              {tab === "materials" && <MaterialsTab company={selected} />}
              {tab === "playbooks" && <PlaybooksTab company={selected} onApplied={() => setInitKey((k) => k + 1)} />}
              {tab === "initiatives" && <InitiativesTab company={selected} refreshKey={initKey} />}
              {tab === "memory" && <MemoryTab company={selected} />}
            </>
          ) : (
            <div style={{ padding: 60, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.navy, marginBottom: 8 }}>RSP.ai</div>
              <p style={{ color: C.muted }}>Add a portfolio company to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Company Modal ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Portfolio Company">
        <input style={inp} placeholder="Company name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <div style={{ display: "flex", gap: 8 }}>
          <select style={{ ...inp, flex: 1 }} value={form.stage} onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))}>
            {["Seed", "Series A", "Series B", "Series C", "Growth", "Late Stage"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select style={{ ...inp, flex: 1 }} value={form.health} onChange={(e) => setForm((p) => ({ ...p, health: e.target.value }))}>
            <option value="green">Healthy</option>
            <option value="yellow">Watch</option>
            <option value="red">At Risk</option>
          </select>
        </div>
        <input style={inp} placeholder="Sector" value={form.sector} onChange={(e) => setForm((p) => ({ ...p, sector: e.target.value }))} />
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Capital deployed" value={form.deployed} onChange={(e) => setForm((p) => ({ ...p, deployed: e.target.value }))} />
          <input style={{ ...inp, flex: 1 }} placeholder="Ownership %" value={form.ownership} onChange={(e) => setForm((p) => ({ ...p, ownership: e.target.value }))} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} placeholder="Investment date" value={form.invested} onChange={(e) => setForm((p) => ({ ...p, invested: e.target.value }))} />
          <select style={{ ...inp, flex: 1 }} value={form.board} onChange={(e) => setForm((p) => ({ ...p, board: e.target.value }))}>
            <option value="Yes">Board Seat</option>
            <option value="Observer">Observer</option>
            <option value="No">No Seat</option>
          </select>
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>SharePoint Folder</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inp, flex: 1 }} placeholder="Folder name (e.g. Dealhub)" value={form.sp_folder} onChange={(e) => setForm((p) => ({ ...p, sp_folder: e.target.value }))} />
            <input style={{ ...inp, width: 80 }} placeholder="Group" value={form.sp_group} onChange={(e) => setForm((p) => ({ ...p, sp_group: e.target.value }))} />
          </div>
        </div>
        <Btn primary onClick={addCo} disabled={!form.name.trim()} style={{ width: "100%" }}>Add Company</Btn>
      </Modal>
    </div>
  );
}
