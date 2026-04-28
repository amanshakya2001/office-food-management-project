import { useState } from "react";

const theme = {
  bg: "#0F0E0C",
  surface: "#1A1915",
  card: "#222118",
  border: "#2E2C25",
  borderLight: "#3A3830",
  accent: "#E8A020",
  accentMuted: "#2A2210",
  accentText: "#F5C55A",
  green: "#4CAF7D",
  greenMuted: "#0F2018",
  greenText: "#6FCF97",
  red: "#E05252",
  redMuted: "#2A1010",
  redText: "#F47F7F",
  blue: "#5B9BD5",
  blueMuted: "#101825",
  blueText: "#7BB8F0",
  textPrimary: "#F0EDE6",
  textSecondary: "#9C9885",
  textTertiary: "#5C5A50",
  font: "'DM Sans', sans-serif",
  fontMono: "'DM Mono', monospace",
};

const screens = [
  "Home",
  "New Entry",
  "Day Detail",
  "Cost & Paid By",
  "People",
  "Settings",
  "CSV Export",
];

// ── Shared primitives ──────────────────────────────────────────────

function StatusBadge({ synced }: { synced: boolean }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, letterSpacing: "0.04em",
      padding: "3px 8px", borderRadius: 20,
      background: synced ? theme.greenMuted : theme.accentMuted,
      color: synced ? theme.greenText : theme.accentText,
      border: `1px solid ${synced ? "#1F4A2F" : "#3A2C08"}`,
    }}>
      {synced ? "✓ Synced" : "⏳ Pending"}
    </span>
  );
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#C17D2A", "#2A7D5C", "#2A5C7D", "#7D2A5C", "#5C7D2A"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg + "33", border: `1.5px solid ${bg}66`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 600, color: bg, flexShrink: 0,
      fontFamily: theme.font,
    }}>
      {initials}
    </div>
  );
}

function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{
      padding: "20px 20px 12px",
      borderBottom: `1px solid ${theme.border}`,
    }}>
      <div style={{ fontSize: 11, color: theme.textTertiary, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>
        Office Food Manager
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: theme.textPrimary, letterSpacing: "-0.02em" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase", color: theme.textTertiary,
      padding: "16px 20px 8px",
    }}>
      {text}
    </div>
  );
}

function PrimaryButton({ label, fullWidth = false }: { label: string; fullWidth?: boolean }) {
  return (
    <button style={{
      background: theme.accent, color: "#0F0E0C",
      border: "none", borderRadius: 12, padding: "13px 20px",
      fontSize: 15, fontWeight: 700, cursor: "pointer",
      width: fullWidth ? "100%" : "auto",
      fontFamily: theme.font, letterSpacing: "-0.01em",
    }}>
      {label}
    </button>
  );
}

function SecondaryButton({ label, fullWidth = false }: { label: string; fullWidth?: boolean }) {
  return (
    <button style={{
      background: "transparent", color: theme.textPrimary,
      border: `1px solid ${theme.borderLight}`, borderRadius: 12,
      padding: "13px 20px", fontSize: 15, fontWeight: 500,
      cursor: "pointer", width: fullWidth ? "100%" : "auto",
      fontFamily: theme.font,
    }}>
      {label}
    </button>
  );
}

function InputField({ label, placeholder, value = "" }: { label: string; placeholder?: string; value?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: theme.textSecondary, display: "block", marginBottom: 6, fontWeight: 500 }}>
        {label}
      </label>
      <div style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: 10, padding: "12px 14px",
        fontSize: 15, color: value ? theme.textPrimary : theme.textTertiary,
        fontFamily: theme.font,
      }}>
        {value || placeholder}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: theme.border, margin: "4px 0" }} />;
}

// ── Screen 1: Home ─────────────────────────────────────────────────

function HomeScreen() {
  const days = [
    { date: "Thu 24 Apr 2025", count: 7, cost: 560, synced: true },
    { date: "Wed 23 Apr 2025", count: 6, cost: 480, synced: true },
    { date: "Tue 22 Apr 2025", count: 8, cost: 0, synced: false },
    { date: "Mon 21 Apr 2025", count: 5, cost: 400, synced: false },
  ];
  return (
    <div>
      <TopBar title="Daily Entries" subtitle="Apr 2025" />

      <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "This Month", value: "₹6,840" },
          { label: "Per Person Avg", value: "₹96" },
        ].map(s => (
          <div key={s.label} style={{
            background: theme.surface, borderRadius: 12,
            border: `1px solid ${theme.border}`, padding: "14px 16px",
          }}>
            <div style={{ fontSize: 12, color: theme.textTertiary, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: theme.accentText, letterSpacing: "-0.02em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <SectionLabel text="Recent Days" />

      {days.map((d, i) => (
        <div key={i}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", cursor: "pointer",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary, marginBottom: 3 }}>{d.date}</div>
              <div style={{ fontSize: 13, color: theme.textSecondary }}>{d.count} people</div>
            </div>
            <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              {d.cost > 0
                ? <div style={{ fontSize: 16, fontWeight: 700, color: theme.textPrimary }}>₹{d.cost}</div>
                : <div style={{ fontSize: 13, color: theme.accentText, fontStyle: "italic" }}>Awaiting cost</div>
              }
              <StatusBadge synced={d.synced} />
            </div>
          </div>
          {i < days.length - 1 && <Divider />}
        </div>
      ))}

      <div style={{ padding: "20px 20px 8px" }}>
        <PrimaryButton label="+ New Day Entry" fullWidth />
      </div>
    </div>
  );
}

// ── Screen 2: New Entry ────────────────────────────────────────────

function NewEntryScreen() {
  const people = [
    { name: "Amit Sharma", meal: "4 roti + rice + egg curry" },
    { name: "Priya Singh", meal: "Puri + sabzi" },
    { name: "Rahul Verma", meal: "" },
    { name: "Neha Gupta", meal: "Rice + rajma + paneer" },
    { name: "Vikram Joshi", meal: "Aloo pyaz paratha" },
  ];
  return (
    <div>
      <TopBar title="New Day Entry" subtitle="Thu 24 Apr 2025" />

      <div style={{ padding: "16px 20px 0" }}>
        <InputField label="Date" value="Thu 24 Apr 2025" />
      </div>

      <SectionLabel text="Meal Entries" />

      {people.map((p, i) => (
        <div key={i}>
          <div style={{ padding: "12px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <Avatar name={p.name} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary, marginBottom: 6 }}>{p.name}</div>
                <div style={{
                  background: theme.surface, border: `1px solid ${p.meal ? theme.borderLight : theme.border}`,
                  borderRadius: 8, padding: "9px 12px",
                  fontSize: 13, color: p.meal ? theme.textPrimary : theme.textTertiary,
                  fontFamily: p.meal ? theme.fontMono : theme.font,
                  lineHeight: 1.5,
                }}>
                  {p.meal || "Tap to add meal…"}
                </div>
              </div>
            </div>
          </div>
          {i < people.length - 1 && <Divider />}
        </div>
      ))}

      <div style={{
        margin: "8px 20px", padding: "12px 16px",
        border: `1px dashed ${theme.borderLight}`, borderRadius: 10,
        display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
      }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: theme.accentMuted, border: `1px dashed ${theme.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: theme.accent }}>+</div>
        <span style={{ fontSize: 14, color: theme.textSecondary }}>Add another person</span>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><SecondaryButton label="Share WhatsApp" fullWidth /></div>
        <div style={{ flex: 1 }}><PrimaryButton label="Save Entry" fullWidth /></div>
      </div>
    </div>
  );
}

// ── Screen 3: Day Detail ───────────────────────────────────────────

function DayDetailScreen() {
  const entries = [
    { name: "Amit Sharma", meal: "4 roti + rice + egg curry", share: 80 },
    { name: "Priya Singh", meal: "Puri + sabzi", share: 80 },
    { name: "Neha Gupta", meal: "Rice + rajma + paneer", share: 80 },
    { name: "Vikram Joshi", meal: "Aloo pyaz paratha", share: 80 },
    { name: "Suresh Kumar", meal: "4 roti + rajma + aloo", share: 80 },
    { name: "Deepa Nair", meal: "4 roti, 1 Egg, Aloo ki sabzi, Chawal", share: 80 },
    { name: "Ravi Mishra", meal: "7 raita", share: 80 },
  ];
  return (
    <div>
      <TopBar title="Thu 24 Apr 2025" subtitle="7 people · ₹560 total" />

      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: theme.textTertiary, marginBottom: 3 }}>Per Person Share</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: theme.accentText, letterSpacing: "-0.02em" }}>₹80</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: theme.textTertiary, marginBottom: 3 }}>Paid By</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <Avatar name="Amit Sharma" size={24} />
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>Amit Sharma</span>
          </div>
        </div>
      </div>

      <div style={{ margin: "0 20px", height: 1, background: theme.border }} />

      <SectionLabel text="Meal Entries" />

      {entries.map((e, i) => (
        <div key={i}>
          <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={e.name} size={32} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>{e.name}</div>
              <div style={{ fontSize: 12, color: theme.textSecondary, fontFamily: theme.fontMono, marginTop: 2 }}>{e.meal}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: theme.textPrimary }}>₹{e.share}</div>
          </div>
          {i < entries.length - 1 && <Divider />}
        </div>
      ))}

      <div style={{ padding: "16px 20px", display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><SecondaryButton label="Share WhatsApp" fullWidth /></div>
        <div style={{ flex: 1 }}><PrimaryButton label="Sync Splitwise" fullWidth /></div>
      </div>
    </div>
  );
}

// ── Screen 4: Cost & Paid By ───────────────────────────────────────

function CostScreen() {
  const people = ["Amit Sharma", "Priya Singh", "Neha Gupta", "Vikram Joshi", "Suresh Kumar"];
  const [selected, setSelected] = useState("Amit Sharma");
  return (
    <div>
      <TopBar title="Enter Cost" subtitle="Thu 24 Apr 2025" />

      <div style={{ padding: "20px 20px 0" }}>
        <InputField label="Total Cost (₹)" value="560" />

        <div style={{
          background: theme.accentMuted, border: `1px solid ${theme.accent}33`,
          borderRadius: 10, padding: "12px 16px", marginBottom: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, color: theme.textSecondary }}>Per person share (7 people)</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: theme.accentText }}>₹80.00</span>
        </div>
      </div>

      <SectionLabel text="Who Paid the Bill?" />

      <div style={{ padding: "0 20px" }}>
        {people.map((name, i) => {
          const active = selected === name;
          return (
            <div
              key={i}
              onClick={() => setSelected(name)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
                background: active ? theme.accentMuted : theme.surface,
                border: `1px solid ${active ? theme.accent + "55" : theme.border}`,
              }}
            >
              <Avatar name={name} size={36} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: active ? 600 : 400, color: active ? theme.accentText : theme.textPrimary }}>
                {name}
              </span>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                border: `2px solid ${active ? theme.accent : theme.borderLight}`,
                background: active ? theme.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0F0E0C" }} />}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "16px 20px" }}>
        <PrimaryButton label="Save & Continue" fullWidth />
      </div>
    </div>
  );
}

// ── Screen 5: People ──────────────────────────────────────────────

function PeopleScreen() {
  const people = [
    { name: "Amit Sharma", phone: "9876543210", mapped: true },
    { name: "Priya Singh", phone: "9123456789", mapped: true },
    { name: "Neha Gupta", phone: "9988776655", mapped: false },
    { name: "Vikram Joshi", phone: "9871234567", mapped: true },
    { name: "Suresh Kumar", phone: "9001122334", mapped: false },
    { name: "Deepa Nair", phone: "9876001122", mapped: true },
  ];
  return (
    <div>
      <TopBar title="People" subtitle={`${people.length} tracked`} />

      <SectionLabel text="All People" />

      {people.map((p, i) => (
        <div key={i}>
          <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={p.name} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>{p.name}</div>
              <div style={{ fontSize: 13, color: theme.textSecondary, fontFamily: theme.fontMono, marginTop: 2 }}>{p.phone}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 500,
                background: p.mapped ? theme.greenMuted : theme.redMuted,
                color: p.mapped ? theme.greenText : theme.redText,
                border: `1px solid ${p.mapped ? "#1F4A2F" : "#4A1F1F"}`,
              }}>
                {p.mapped ? "SW Linked" : "Not Linked"}
              </span>
            </div>
          </div>
          {i < people.length - 1 && <Divider />}
        </div>
      ))}

      <div style={{ padding: "16px 20px" }}>
        <PrimaryButton label="+ Add Person" fullWidth />
      </div>
    </div>
  );
}

// ── Screen 6: Settings ────────────────────────────────────────────

function SettingsScreen() {
  return (
    <div>
      <TopBar title="Settings" />

      <SectionLabel text="Splitwise Account" />
      <div style={{ margin: "0 20px 4px", padding: "14px 16px", background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: theme.greenMuted, border: `1.5px solid ${theme.green}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✓</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.textPrimary }}>Connected</div>
            <div style={{ fontSize: 13, color: theme.textSecondary }}>amit.sharma@gmail.com</div>
          </div>
          <span style={{ fontSize: 13, color: theme.redText, cursor: "pointer" }}>Disconnect</span>
        </div>
      </div>

      <SectionLabel text="Splitwise Group" />
      <div style={{ margin: "0 20px 4px", background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, color: theme.textSecondary, marginBottom: 2 }}>Active Group</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.accentText }}>Office Lunch Group</div>
          </div>
          <span style={{ fontSize: 13, color: theme.blue, cursor: "pointer" }}>Change</span>
        </div>
      </div>

      <SectionLabel text="Person → Splitwise Mapping" />
      <div style={{ margin: "0 20px 4px", background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}`, overflow: "hidden" }}>
        {[
          { local: "Amit Sharma", sw: "Amit S.", mapped: true },
          { local: "Priya Singh", sw: "Priya S.", mapped: true },
          { local: "Neha Gupta", sw: "—", mapped: false },
          { local: "Vikram Joshi", sw: "Vikram J.", mapped: true },
        ].map((m, i, arr) => (
          <div key={i}>
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={m.local} size={30} />
              <span style={{ flex: 1, fontSize: 14, color: theme.textPrimary }}>{m.local}</span>
              <span style={{ fontSize: 12, color: theme.textTertiary, marginRight: 6 }}>→</span>
              <span style={{ fontSize: 13, color: m.mapped ? theme.greenText : theme.accentText, fontWeight: 500 }}>
                {m.sw}
              </span>
            </div>
            {i < arr.length - 1 && <Divider />}
          </div>
        ))}
      </div>

      <div style={{ padding: "16px 20px" }}>
        <SecondaryButton label="Edit Mappings" fullWidth />
      </div>
    </div>
  );
}

// ── Screen 7: CSV Export ──────────────────────────────────────────

function ExportScreen() {
  return (
    <div>
      <TopBar title="Export CSV" subtitle="Download your data" />

      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <InputField label="From Date" value="01 Apr 2025" />
          <InputField label="To Date" value="30 Apr 2025" />
        </div>

        <div style={{
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: 12, padding: "16px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, color: theme.textSecondary, fontWeight: 500, marginBottom: 12 }}>CSV will include</div>
          {[
            "Date (DD MMM YYYY)",
            "Person Name & Phone",
            "Meal Description",
            "Total Cost (₹)",
            "Per-Person Share (₹)",
            "Paid By",
            "Splitwise Synced (Yes/No)",
          ].map((col, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: i < 6 ? `1px solid ${theme.border}` : "none" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: theme.textPrimary, fontFamily: theme.fontMono }}>{col}</span>
            </div>
          ))}
        </div>

        <div style={{ background: theme.accentMuted, border: `1px solid ${theme.accent}33`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: theme.accentText }}>
            <span style={{ fontWeight: 600 }}>Preview: </span>71 rows across 30 days
          </div>
        </div>

        <PrimaryButton label="Export & Save to Downloads" fullWidth />
        <div style={{ height: 12 }} />
        <SecondaryButton label="Share via WhatsApp / Drive" fullWidth />
      </div>
    </div>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────

function BottomNav({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const tabs = [
    { id: "Home", icon: "⊞", label: "Home" },
    { id: "People", icon: "◎", label: "People" },
    { id: "CSV Export", icon: "↓", label: "Export" },
    { id: "Settings", icon: "⊙", label: "Settings" },
  ];
  return (
    <div style={{
      display: "flex", borderTop: `1px solid ${theme.border}`,
      background: theme.bg, padding: "8px 0 4px",
    }}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <div key={t.id} onClick={() => setActive(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
            gap: 3, cursor: "pointer", padding: "4px 0",
          }}>
            <span style={{ fontSize: 18, color: isActive ? theme.accent : theme.textTertiary }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? theme.accentText : theme.textTertiary, letterSpacing: "0.04em" }}>{t.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Screen Picker Tabs ────────────────────────────────────────────

function ScreenTabs({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
      {screens.map(s => (
        <button key={s} onClick={() => setActive(s)} style={{
          padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
          cursor: "pointer", border: "none", fontFamily: theme.font,
          background: active === s ? theme.accent : theme.surface,
          color: active === s ? "#0F0E0C" : theme.textSecondary,
        }}>
          {s}
        </button>
      ))}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────

export default function App() {
  const [activeScreen, setActiveScreen] = useState("Home");

  const renderScreen = () => {
    switch (activeScreen) {
      case "Home": return <HomeScreen />;
      case "New Entry": return <NewEntryScreen />;
      case "Day Detail": return <DayDetailScreen />;
      case "Cost & Paid By": return <CostScreen />;
      case "People": return <PeopleScreen />;
      case "Settings": return <SettingsScreen />;
      case "CSV Export": return <ExportScreen />;
      default: return <HomeScreen />;
    }
  };

  const showBottomNav = ["Home", "People", "CSV Export", "Settings"].includes(activeScreen);

  return (
    <div style={{ fontFamily: theme.font, background: "var(--color-background-tertiary)", minHeight: "100vh", padding: "24px 16px" }}>
      <h2 className="sr-only">Office Food Manager — App Screen Designs</h2>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10, fontWeight: 500 }}>Preview screen:</div>
        <ScreenTabs active={activeScreen} setActive={setActiveScreen} />
      </div>

      {/* Phone frame */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 375, background: theme.bg,
          borderRadius: 44, overflow: "hidden",
          border: `2px solid ${theme.borderLight}`,
          boxShadow: `0 0 0 6px ${theme.surface}, 0 32px 64px rgba(0,0,0,0.6)`,
          fontFamily: theme.font,
        }}>
          {/* Status bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 24px 6px", background: theme.bg,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>9:41</span>
            <div style={{ width: 120, height: 30, background: theme.bg, borderRadius: 20, border: `1px solid ${theme.border}` }} />
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: theme.textSecondary }}>●●●</span>
            </div>
          </div>

          {/* Screen content */}
          <div style={{ minHeight: 560, overflow: "hidden" }}>
            {renderScreen()}
          </div>

          {/* Bottom nav */}
          {showBottomNav && <BottomNav active={activeScreen} setActive={setActiveScreen} />}

          {/* Home indicator */}
          <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 14px" }}>
            <div style={{ width: 120, height: 4, background: theme.borderLight, borderRadius: 4 }} />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "var(--color-text-tertiary)" }}>
        Office Food Manager · Android · React Native
      </div>
    </div>
  );
}