import { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronRight, ChevronLeft, Plus, X, Trash2, Download, CalendarPlus,
  Users, Clock, LogOut, UserCog, Eye, ArrowRight, Copy, Check, Shield,
} from "lucide-react";
import {
  subscribeAuth, signInWithGoogle, signOutUser, isSystemAdmin,
  listFamilies, getFamily, createFamilyIfMissing, deleteFamily, getUserFamilies,
  getOrCreateMember, subscribeMembers, updateMemberRole, updateMemberColor, removeMember,
  subscribeTasks, saveTask, deleteTask, excludeTaskDate,
} from "./firebase";

/* ---------------------------------- logo ---------------------------------- */
const LOGO_URI = "data:image/jpeg;base64,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";

/* ---------------------------------- tokens ---------------------------------- */
const T = {
  bg: "#FFFFFF",
  bgSoft: "#F4FCFD",
  surface: "#FFFFFF",
  surfaceAlt: "#EAF8FA",
  border: "#DCF0F3",
  borderStrong: "#BEE6EB",
  accent: "#2FB6CC",
  accentDark: "#1C8B9C",
  text: "#1E3438",
  textMuted: "#72949A",
  todayBg: "#D7F2F6",
  danger: "#E2685F",
  radius: "16px",
  shadow: "0 2px 10px rgba(46,140,157,0.08)",
};

const TASK_COLORS = [
  "#2FB6CC", "#5AC08B", "#F0A44E", "#EE7CA0",
  "#8D82D6", "#F08A63", "#5C9EE8", "#F0CB4E",
];
const UNASSIGNED_COLOR = "#9AA9AC";
const FAMILY_ID = "family";
const FAMILY_COLOR = "#33475B";

const WD_SHORT = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const WD_FULL = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const WD_CODE = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 23;
const HOUR_H = 52;

const ROLE_LABEL = { parent: "הורה", child: "ילד/ה" };

/* ---------------------------------- date helpers ---------------------------------- */
const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromISO = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const daysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const startOfWeek = (d) => { const r = new Date(d); r.setDate(r.getDate() - r.getDay()); r.setHours(0, 0, 0, 0); return r; };
const sameDay = (a, b) => toISO(a) === toISO(b);
const todayDate = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };

function getMonthGrid(anchor) {
  const first = startOfMonth(anchor);
  const gridStart = startOfWeek(first);
  const cells = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i));
  return cells;
}

function occursOnDate(task, dateObj) {
  const iso = toISO(dateObj);
  if ((task.excludedDates || []).includes(iso)) return false;
  if (iso < task.startDate) return false;
  if (task.recurrence === "none") return iso === task.startDate;
  if (iso > task.endDate) return false;
  const start = fromISO(task.startDate);
  const diffDays = Math.round((dateObj - start) / 86400000);
  if (diffDays < 0) return false;
  switch (task.recurrence) {
    case "daily": return true;
    case "weekly": return diffDays % 7 === 0;
    case "monthly": {
      const targetDay = Math.min(start.getDate(), daysInMonth(dateObj));
      return dateObj.getDate() === targetDay;
    }
    case "custom": return (task.customDays || []).includes(dateObj.getDay());
    default: return false;
  }
}

function tasksForDate(tasks, dateObj) {
  return tasks.filter((t) => occursOnDate(t, dateObj)).sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
}

function colorForAssignee(assigneeId, memberColorMap) {
  if (assigneeId === FAMILY_ID) return FAMILY_COLOR;
  return (assigneeId && memberColorMap[assigneeId]) || UNASSIGNED_COLOR;
}

function timeToMin(t) { if (!t) return null; const [h, m] = t.split(":").map(Number); return h * 60 + m; }

function layoutTimedTasks(dayTasks) {
  const withRange = dayTasks
    .filter((t) => t.startTime)
    .map((t) => ({ task: t, start: timeToMin(t.startTime), end: Math.max(timeToMin(t.endTime || t.startTime), timeToMin(t.startTime) + 30) }))
    .sort((a, b) => a.start - b.start);
  const columns = [];
  withRange.forEach((item) => {
    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      if (columns[c] <= item.start) { item.col = c; columns[c] = item.end; placed = true; break; }
    }
    if (!placed) { item.col = columns.length; columns.push(item.end); }
  });
  const maxCols = Math.max(columns.length, 1);
  return { items: withRange, maxCols };
}

/* ---------------------------------- ics / google calendar ---------------------------------- */
function buildRRule(task) {
  const until = task.endDate.replace(/-/g, "") + "T235959Z";
  if (task.recurrence === "daily") return `FREQ=DAILY;UNTIL=${until}`;
  if (task.recurrence === "weekly") return `FREQ=WEEKLY;UNTIL=${until}`;
  if (task.recurrence === "monthly") return `FREQ=MONTHLY;UNTIL=${until}`;
  if (task.recurrence === "custom") {
    const byday = (task.customDays || []).map((d) => WD_CODE[d]).join(",") || WD_CODE[fromISO(task.startDate).getDay()];
    return `FREQ=WEEKLY;BYDAY=${byday};UNTIL=${until}`;
  }
  return "";
}

function escapeICS(s = "") { return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }

function generateICS(tasks) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Family Calendar HE//", "CALSCALE:GREGORIAN"];
  tasks.forEach((t) => {
    lines.push("BEGIN:VEVENT");
    lines.push("UID:" + t.id + "@family-calendar");
    lines.push("SUMMARY:" + escapeICS(t.title + (t.assigneeName ? ` (${t.assigneeName})` : "")));
    if (t.notes) lines.push("DESCRIPTION:" + escapeICS(t.notes));
    if (t.startTime) {
      lines.push("DTSTART:" + t.startDate.replace(/-/g, "") + "T" + t.startTime.replace(":", "") + "00");
      lines.push("DTEND:" + t.startDate.replace(/-/g, "") + "T" + (t.endTime || t.startTime).replace(":", "") + "00");
    } else {
      lines.push("DTSTART;VALUE=DATE:" + t.startDate.replace(/-/g, ""));
      lines.push("DTEND;VALUE=DATE:" + toISO(addDays(fromISO(t.startDate), 1)).replace(/-/g, ""));
    }
    if (t.recurrence !== "none") lines.push("RRULE:" + buildRRule(t));
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(tasks, familyName) {
  const blob = new Blob([generateICS(tasks)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `יומן-${familyName || "משפחתי"}.ics`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(task) {
  let dates;
  if (task.startTime) {
    const s = task.startDate.replace(/-/g, "") + "T" + task.startTime.replace(":", "") + "00";
    const e = task.startDate.replace(/-/g, "") + "T" + (task.endTime || task.startTime).replace(":", "") + "00";
    dates = `${s}/${e}`;
  } else {
    dates = `${task.startDate.replace(/-/g, "")}/${toISO(addDays(fromISO(task.startDate), 1)).replace(/-/g, "")}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title + (task.assigneeName ? ` (${task.assigneeName})` : ""),
    dates,
    details: task.notes || "",
    ctz: "Asia/Jerusalem",
  });
  let url = `https://calendar.google.com/calendar/render?${params.toString()}`;
  if (task.recurrence !== "none") url += `&recur=${encodeURIComponent("RRULE:" + buildRRule(task))}`;
  return url;
}

/* ---------------------------------- small UI pieces ---------------------------------- */
function IconBtn({ onClick, children, title, style }) {
  return (
    <button title={title} onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`,
      background: T.surface, color: T.accentDark, cursor: "pointer", ...style,
    }}>{children}</button>
  );
}

function RoleBadge({ role }) {
  const isParent = role === "parent";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700,
      padding: "3px 8px", borderRadius: 999, background: isParent ? "#E4F6EA" : "#EFEBFB",
      color: isParent ? "#3B9A5C" : "#6E5DB8",
    }}>{isParent ? <UserCog size={12} /> : <Eye size={12} />} {ROLE_LABEL[role]}</span>
  );
}

function TaskChip({ task, occursTime, onClick, compact }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, width: "100%",
      background: task.color + "1A", border: `1px solid ${task.color}55`,
      borderRight: `4px solid ${task.color}`, borderRadius: 8,
      padding: compact ? "2px 6px" : "4px 8px", cursor: "pointer", textAlign: "right",
      fontSize: compact ? 11 : 12.5, color: T.text, overflow: "hidden",
    }}>
      {occursTime && !compact && <span style={{ color: T.textMuted, fontSize: 11, whiteSpace: "nowrap" }}>{occursTime}</span>}
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{task.title}</span>
    </button>
  );
}

/* ---------------------------------- Month View ---------------------------------- */
function groupTasksByColor(dayTasks) {
  const order = [];
  const map = {};
  dayTasks.forEach((t) => {
    if (!map[t.color]) { map[t.color] = []; order.push(t.color); }
    map[t.color].push(t);
  });
  return order.map((color) => ({ color, tasks: map[color] }));
}

function MonthView({ anchor, tasks, onDayClick, onTaskClick, onAddDay, canEdit }) {
  const cells = useMemo(() => getMonthGrid(anchor), [anchor]);
  const today = todayDate();
  return (
    <div style={{ display: "flex", flexDirection: "column", background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: "hidden", boxShadow: T.shadow }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: T.surfaceAlt }}>
        {WD_FULL.map((w, i) => (
          <div key={i} style={{ padding: "10px 4px", textAlign: "center", fontSize: 12.5, fontWeight: 700, color: T.accentDark }}>{w}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridAutoRows: "minmax(96px,1fr)" }}>
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === anchor.getMonth();
          const isToday = sameDay(d, today);
          const dayTasks = tasksForDate(tasks, d);
          return (
            <div key={i} onClick={() => onDayClick(d)} style={{
              borderTop: `1px solid ${T.border}`, borderRight: (i % 7 !== 6) ? `1px solid ${T.border}` : "none",
              padding: 6, cursor: "pointer", background: isToday ? T.todayBg : (inMonth ? T.surface : T.bgSoft),
              opacity: inMonth ? 1 : 0.5, display: "flex", flexDirection: "column", gap: 4, position: "relative",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontSize: 13, fontWeight: isToday ? 800 : 600,
                  width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%", background: isToday ? T.accent : "transparent", color: isToday ? "#fff" : T.text,
                }}>{d.getDate()}</span>
                {canEdit && (
                  <button onClick={(e) => { e.stopPropagation(); onAddDay(d); }} style={{
                    width: 18, height: 18, borderRadius: 6, border: "none", background: "transparent",
                    color: T.textMuted, cursor: "pointer", fontSize: 14, lineHeight: 1,
                  }}>+</button>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                {groupTasksByColor(dayTasks).slice(0, 6).map((g) => (
                  g.tasks.length === 1 ? (
                    <button key={g.color} onClick={(e) => { e.stopPropagation(); onTaskClick(g.tasks[0], d); }} title={g.tasks[0].title} style={{
                      width: 10, height: 10, borderRadius: "50%", background: g.color, border: "none", cursor: "pointer", padding: 0, flexShrink: 0,
                    }} />
                  ) : (
                    <button key={g.color} onClick={(e) => { e.stopPropagation(); onDayClick(d); }} title={`${g.tasks.length} משימות`} style={{
                      minWidth: 15, height: 15, borderRadius: 999, background: g.color, border: "none", cursor: "pointer",
                      padding: "0 4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 800, color: "#fff", lineHeight: 1,
                    }}>{g.tasks.length}</button>
                  )
                ))}
                {groupTasksByColor(dayTasks).length > 6 && <span style={{ fontSize: 10, color: T.textMuted }}>+{groupTasksByColor(dayTasks).length - 6}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- Week / Day shared grid ---------------------------------- */
function TimeGrid({ days, tasks, onTaskClick }) {
  const hours = [];
  for (let h = DAY_START_HOUR; h <= DAY_END_HOUR; h++) hours.push(h);
  const today = todayDate();

  const allDayTasks = days.map((d) => tasksForDate(tasks, d).filter((t) => !t.startTime));
  const hasAllDay = allDayTasks.some((arr) => arr.length > 0);

  return (
    <div style={{ background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}`, overflow: "hidden", boxShadow: T.shadow }}>
      <div style={{ display: "grid", gridTemplateColumns: `56px repeat(${days.length},1fr)`, background: T.surfaceAlt }}>
        <div />
        {days.map((d, i) => {
          const isToday = sameDay(d, today);
          return (
            <div key={i} style={{ padding: "10px 4px", textAlign: "center", borderRight: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: T.accentDark }}>{WD_SHORT[d.getDay()]}</div>
              <div style={{
                fontSize: 14, fontWeight: 800, marginTop: 2, display: "inline-flex", width: 24, height: 24,
                alignItems: "center", justifyContent: "center", borderRadius: "50%",
                background: isToday ? T.accent : "transparent", color: isToday ? "#fff" : T.text,
              }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>

      {hasAllDay && (
        <div style={{ display: "grid", gridTemplateColumns: `56px repeat(${days.length},1fr)`, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.textMuted, padding: 4, textAlign: "center" }}>יום שלם</div>
          {days.map((d, i) => (
            <div key={i} style={{ borderRight: `1px solid ${T.border}`, padding: 3, display: "flex", flexDirection: "column", gap: 3, minHeight: 30 }}>
              {allDayTasks[i].map((t) => <TaskChip key={t.id} task={t} compact onClick={() => onTaskClick(t, d)} />)}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: `56px repeat(${days.length},1fr)`, position: "relative", borderTop: `1px solid ${T.border}` }}>
        <div>
          {hours.map((h) => (
            <div key={h} style={{ height: HOUR_H, fontSize: 10.5, color: T.textMuted, textAlign: "center", borderTop: `1px solid ${T.border}`, paddingTop: 2 }}>
              {pad(h)}:00
            </div>
          ))}
        </div>
        {days.map((d, i) => {
          const dayTasks = tasksForDate(tasks, d);
          const { items, maxCols } = layoutTimedTasks(dayTasks);
          return (
            <div key={i} style={{ position: "relative", borderRight: `1px solid ${T.border}` }}>
              {hours.map((h) => <div key={h} style={{ height: HOUR_H, borderTop: `1px solid ${T.border}` }} />)}
              {items.map(({ task, start, end, col }) => {
                const top = (start - DAY_START_HOUR * 60) / 60 * HOUR_H;
                const height = Math.max((end - start) / 60 * HOUR_H, 22);
                const width = 100 / maxCols;
                return (
                  <button key={task.id} onClick={() => onTaskClick(task, d)} style={{
                    position: "absolute", top, left: `${col * width}%`, width: `${width}%`,
                    height, background: task.color + "26", border: `1px solid ${task.color}88`,
                    borderRight: `3px solid ${task.color}`, borderRadius: 6, padding: "2px 5px",
                    fontSize: 10.5, textAlign: "right", overflow: "hidden", cursor: "pointer", color: T.text,
                  }}>
                    <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                    <div style={{ color: T.textMuted, fontSize: 9.5 }}>{task.startTime}{task.endTime ? "–" + task.endTime : ""}</div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------- Week agenda (day below day) ---------------------------------- */
function WeekAgendaView({ anchor, tasks, onTaskClick }) {
  const start = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const today = todayDate();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {days.map((d, i) => {
        const isToday = sameDay(d, today);
        const dayTasks = tasksForDate(tasks, d);
        return (
          <div key={i} style={{
            background: T.surface, borderRadius: 14, overflow: "hidden",
            border: `1px solid ${isToday ? T.accent : T.border}`, boxShadow: T.shadow,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
              background: isToday ? T.todayBg : T.surfaceAlt,
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: isToday ? T.accentDark : T.text }}>{WD_FULL[d.getDay()]}</span>
              <span style={{ fontSize: 12, color: T.textMuted }}>{d.getDate()} ב{MONTHS_HE[d.getMonth()]}</span>
              {isToday && <span style={{ marginInlineStart: "auto", fontSize: 10.5, fontWeight: 700, color: "#fff", background: T.accent, borderRadius: 999, padding: "2px 8px" }}>היום</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {dayTasks.length === 0 ? (
                <div style={{ padding: "10px 14px", fontSize: 12, color: T.textMuted }}>אין משימות ביום זה</div>
              ) : dayTasks.map((t) => (
                <button key={t.id} onClick={() => onTaskClick(t, d)} style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "right",
                  padding: "9px 14px", border: "none", borderTop: `1px solid ${T.border}`, background: "transparent", cursor: "pointer",
                }}>
                  <span style={{ width: 11, height: 11, borderRadius: "50%", background: t.color, flexShrink: 0 }} />
                  {t.startTime && <span style={{ fontSize: 11.5, color: T.textMuted, minWidth: 38, flexShrink: 0 }}>{t.startTime}</span>}
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: T.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</span>
                  {t.assigneeName && <span style={{ fontSize: 11, color: T.textMuted, flexShrink: 0 }}>{t.assigneeName}</span>}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ anchor, tasks, onTaskClick }) {
  return <TimeGrid days={[anchor]} tasks={tasks} onTaskClick={onTaskClick} />;
}

/* ---------------------------------- Field / input ---------------------------------- */
function Field({ label, children, style }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12.5, color: T.textMuted, fontWeight: 600, ...style }}>
      {label}
      {children}
    </label>
  );
}
const inputStyle = {
  padding: "9px 10px", borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 14,
  color: T.text, background: T.bgSoft, outline: "none", fontFamily: "Inter, sans-serif", width: "100%", boxSizing: "border-box",
};

/* ---------------------------------- Task edit modal (parent/admin) ---------------------------------- */
const emptyTask = (dateISO) => ({
  id: null, title: "", assigneeId: "", notes: "",
  startDate: dateISO, endDate: dateISO, startTime: "", endTime: "",
  recurrence: "none", customDays: [],
});

function TaskModal({ initial, members, occurrenceDate, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(initial);
  const [deleteChoice, setDeleteChoice] = useState(false);
  const isEdit = !!initial.id;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleCustomDay = (d) => {
    set("customDays", form.customDays.includes(d) ? form.customDays.filter((x) => x !== d) : [...form.customDays, d].sort());
  };

  const canSave = form.title.trim().length > 0 &&
    form.startDate && (form.recurrence === "none" || form.endDate) &&
    (form.recurrence === "none" || form.endDate >= form.startDate) &&
    (form.recurrence !== "custom" || form.customDays.length > 0) &&
    (!form.startTime || !form.endTime || form.endTime > form.startTime);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,50,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.surface, borderRadius: 20, width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 12px 40px rgba(20,60,65,0.25)", border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, background: T.surface, borderRadius: "20px 20px 0 0" }}>
          <h3 style={{ margin: 0, fontFamily: "Quicksand, sans-serif", fontSize: 18, color: T.text }}>{isEdit ? "עריכת משימה" : "משימה חדשה"}</h3>
          <IconBtn onClick={onClose} title="סגור"><X size={18} /></IconBtn>
        </div>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="שם המשימה">
            <input autoFocus value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="לדוגמה: חוג כדורסל" style={inputStyle} />
          </Field>

          <Field label="אחראי/ת (קובע/ת את הצבע ביומן)">
            <select value={form.assigneeId} onChange={(e) => set("assigneeId", e.target.value)} style={inputStyle}>
              <option value="">ללא שיוך (צבע ניטרלי)</option>
              <option value={FAMILY_ID}>כל המשפחה</option>
              {(members || []).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6, marginTop: 8, alignItems: "center" }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: colorForAssignee(form.assigneeId, Object.fromEntries((members || []).map((m) => [m.id, m.color]))) }} />
              <span style={{ fontSize: 11.5, color: T.textMuted }}>הצבע נקבע לפי בן/בת המשפחה — ניתן לשנות ב"בני משפחה".</span>
            </div>
          </Field>

          <Field label="חזרתיות">
            <select value={form.recurrence} onChange={(e) => set("recurrence", e.target.value)} style={inputStyle}>
              <option value="none">חד פעמי</option>
              <option value="daily">יומי</option>
              <option value="weekly">שבועי</option>
              <option value="monthly">חודשי</option>
              <option value="custom">מותאם אישית (ימים נבחרים)</option>
            </select>
          </Field>

          {form.recurrence === "custom" && (
            <Field label="ימים בשבוע">
              <div style={{ display: "flex", gap: 6 }}>
                {WD_SHORT.map((w, i) => (
                  <button key={i} onClick={() => toggleCustomDay(i)} style={{
                    width: 34, height: 34, borderRadius: 10, cursor: "pointer",
                    border: `1px solid ${form.customDays.includes(i) ? T.accent : T.border}`,
                    background: form.customDays.includes(i) ? T.accent : T.surface,
                    color: form.customDays.includes(i) ? "#fff" : T.text, fontWeight: 700, fontSize: 12.5,
                  }}>{w}</button>
                ))}
              </div>
            </Field>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <Field label={form.recurrence === "none" ? "תאריך" : "מתאריך"} style={{ flex: 1 }}>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} style={inputStyle} />
            </Field>
            {form.recurrence !== "none" && (
              <Field label="עד תאריך" style={{ flex: 1 }}>
                <input type="date" value={form.endDate} min={form.startDate} onChange={(e) => set("endDate", e.target.value)} style={inputStyle} />
              </Field>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Field label="משעה (אופציונלי)" style={{ flex: 1 }}>
              <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="עד שעה" style={{ flex: 1 }}>
              <input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <Field label="הערות (אופציונלי)">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          {form.title && form.startDate && (
            <a href={googleCalendarUrl({ ...form, id: form.id || "tmp", assigneeName: form.assigneeId === FAMILY_ID ? "כל המשפחה" : (members || []).find((m) => m.id === form.assigneeId)?.name })} target="_blank" rel="noreferrer" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 12px",
              borderRadius: 10, border: `1px solid ${T.border}`, color: T.accentDark, textDecoration: "none", fontSize: 13, fontWeight: 600,
            }}>
              <CalendarPlus size={16} /> הוספה ליומן Google
            </a>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, padding: 18, borderTop: `1px solid ${T.border}` }}>
          {isEdit && (
            <button onClick={() => (form.recurrence === "none" ? onDelete(form.id, "all") : setDeleteChoice(true))} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 10,
              border: `1px solid ${T.danger}55`, background: "#FCEEED", color: T.danger, cursor: "pointer", fontWeight: 600, fontSize: 13.5,
            }}><Trash2 size={15} /> מחיקה</button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: 13.5, color: T.text }}>ביטול</button>
          <button disabled={!canSave} onClick={() => onSave(form)} style={{
            padding: "10px 18px", borderRadius: 10, border: "none", cursor: canSave ? "pointer" : "not-allowed",
            background: canSave ? T.accent : "#B9DEE4", color: "#fff", fontWeight: 700, fontSize: 13.5,
          }}>שמירה</button>
        </div>
      </div>

      {deleteChoice && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,50,55,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }} onClick={(e) => e.stopPropagation()}>
          <div style={{ background: T.surface, borderRadius: 18, padding: 22, maxWidth: 340, width: "100%", boxShadow: "0 12px 40px rgba(20,60,65,0.3)" }}>
            <h4 style={{ margin: "0 0 6px", fontFamily: "Quicksand, sans-serif", fontSize: 16.5, color: T.text }}>מחיקת משימה חוזרת</h4>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
              "{form.title}" חוזרת על עצמה. את מה תרצו למחוק?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => onDelete(form.id, "occurrence", occurrenceDate)} style={{
                padding: "11px 12px", borderRadius: 10, border: `1px solid ${T.danger}55`,
                background: "#FCEEED", color: T.danger, cursor: "pointer", fontWeight: 700, fontSize: 13.5, textAlign: "center",
              }}>רק את המופע הזה ({occurrenceDate})</button>
              <button onClick={() => onDelete(form.id, "all")} style={{
                padding: "11px 12px", borderRadius: 10, border: "none",
                background: T.danger, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13.5, textAlign: "center",
              }}>את כל הסדרה החוזרת</button>
              <button onClick={() => setDeleteChoice(false)} style={{
                padding: "10px 12px", borderRadius: 10, border: `1px solid ${T.border}`,
                background: T.surface, color: T.text, cursor: "pointer", fontWeight: 600, fontSize: 13, textAlign: "center", marginTop: 4,
              }}>ביטול</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- Task read-only view (child role) ---------------------------------- */
function TaskViewModal({ task, onClose }) {
  const recurrenceLabel = {
    none: "חד פעמי", daily: "יומי", weekly: "שבועי", monthly: "חודשי", custom: "מותאם אישית",
  }[task.recurrence];
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,50,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.surface, borderRadius: 20, width: "100%", maxWidth: 400,
        boxShadow: "0 12px 40px rgba(20,60,65,0.25)", border: `1px solid ${T.border}`, overflow: "hidden",
      }}>
        <div style={{ height: 8, background: task.color }} />
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <h3 style={{ margin: 0, fontFamily: "Quicksand, sans-serif", fontSize: 19, color: T.text }}>{task.title}</h3>
            <IconBtn onClick={onClose} title="סגור"><X size={18} /></IconBtn>
          </div>
          {task.assigneeName && <div style={{ fontSize: 13, color: T.textMuted }}>אחראי/ת: <b style={{ color: T.text }}>{task.assigneeName}</b></div>}
          <div style={{ fontSize: 13, color: T.textMuted }}>
            {task.recurrence === "none" ? task.startDate : `${task.startDate} עד ${task.endDate} · ${recurrenceLabel}`}
          </div>
          {task.startTime && <div style={{ fontSize: 13, color: T.textMuted }}>שעה: {task.startTime}{task.endTime ? "–" + task.endTime : ""}</div>}
          {task.notes && <div style={{ fontSize: 13, color: T.text, background: T.bgSoft, borderRadius: 10, padding: 10 }}>{task.notes}</div>}
          <a href={googleCalendarUrl(task)} target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 12px", marginTop: 4,
            borderRadius: 10, border: `1px solid ${T.border}`, color: T.accentDark, textDecoration: "none", fontSize: 13, fontWeight: 600,
          }}><CalendarPlus size={16} /> הוספה ליומן Google שלי</a>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Members management (parent) ---------------------------------- */
function MembersModal({ family, members, currentMember, onClose }) {
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [colorPickerFor, setColorPickerFor] = useState(null);

  const handleSetRole = async (id, role) => {
    const parentsLeft = members.filter((m) => m.role === "parent" && m.id !== id).length;
    if (role === "child" && parentsLeft === 0) {
      alert("לא ניתן — חייב להישאר לפחות הורה אחד ביומן המשפחתי.");
      return;
    }
    setBusyId(id);
    await updateMemberRole(family.id, id, role);
    setBusyId(null);
  };

  const handleSetColor = async (id, color) => {
    setBusyId(id);
    await updateMemberColor(family.id, id, color);
    setBusyId(null);
    setColorPickerFor(null);
  };

  const handleRemove = async (id) => {
    const target = members.find((m) => m.id === id);
    const parentsLeft = members.filter((m) => m.role === "parent" && m.id !== id).length;
    if (target?.role === "parent" && parentsLeft === 0) {
      alert("לא ניתן להסיר — חייב להישאר לפחות הורה אחד ביומן המשפחתי.");
      return;
    }
    setBusyId(id);
    await removeMember(family.id, id);
    setBusyId(null);
  };

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(family.id); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch (e) { /* ignore */ }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,50,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: T.surface, borderRadius: 20, width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 12px 40px rgba(20,60,65,0.25)", border: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: `1px solid ${T.border}` }}>
          <h3 style={{ margin: 0, fontFamily: "Quicksand, sans-serif", fontSize: 18 }}>בני משפחה וצבעים</h3>
          <IconBtn onClick={onClose} title="סגור"><X size={18} /></IconBtn>
        </div>

        <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 6 }}>קוד המשפחה לשיתוף — מי שנכנס עם Google ומזין את הקוד הזה, מצטרף אוטומטית ליומן:</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <code style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 13.5, fontWeight: 700, flex: 1 }}>{family.id}</code>
              <IconBtn onClick={copyCode} title="העתקה">{copied ? <Check size={16} /> : <Copy size={16} />}</IconBtn>
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>לכל בן משפחה יש צבע קבוע שמופיע אוטומטית בכל המשימות שלו/שלה ביומן — אפשר לשנות אותו כאן בכל עת.</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {members.map((m) => (
              <div key={m.id} style={{ background: T.bgSoft, borderRadius: 10, opacity: busyId === m.id ? 0.6 : 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}>
                  <button
                    onClick={() => setColorPickerFor(colorPickerFor === m.id ? null : m.id)}
                    title="שינוי צבע"
                    style={{ width: 22, height: 22, borderRadius: "50%", background: m.color || UNASSIGNED_COLOR, border: `2px solid ${T.surface}`, outline: `1px solid ${T.border}`, cursor: "pointer", flexShrink: 0 }}
                  />
                  <span style={{ flex: 1 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600 }}>{m.name}{m.id === currentMember?.id ? " (את/ה)" : ""}</span>
                    {m.email && <span style={{ display: "block", fontSize: 10.5, color: T.textMuted }}>{m.email}</span>}
                  </span>
                  <select disabled={busyId === m.id} value={m.role} onChange={(e) => handleSetRole(m.id, e.target.value)} style={{ ...inputStyle, width: "auto", padding: "5px 8px", fontSize: 12.5 }}>
                    <option value="parent">הורה</option>
                    <option value="child">ילד/ה</option>
                  </select>
                  <button disabled={busyId === m.id} onClick={() => handleRemove(m.id)} title="הסרה" style={{ border: "none", background: "transparent", color: T.danger, cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                {colorPickerFor === m.id && (
                  <div style={{ display: "flex", gap: 7, flexWrap: "wrap", padding: "0 10px 10px" }}>
                    {TASK_COLORS.map((c) => (
                      <button key={c} onClick={() => handleSetColor(m.id, c)} style={{
                        width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer",
                        border: (m.color || UNASSIGNED_COLOR) === c ? `2px solid ${T.text}` : "2px solid transparent", outline: `1px solid ${T.border}`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {members.length === 0 && <div style={{ fontSize: 12.5, color: T.textMuted, textAlign: "center", padding: 10 }}>עדיין אין בני משפחה רשומים.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Login screen ---------------------------------- */
function LoginScreen({ authUser, isAdmin, onSignIn, onJoinFamily, onGoAdmin, onSignOut }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSignIn = async () => {
    setErr(""); setBusy(true);
    try { await onSignIn(); } catch (e) { console.error("Sign-in error:", e); setErr("ההתחברות נכשלה — נסו שוב. (" + (e?.code || e?.message || "") + ")"); }
    setBusy(false);
  };

  const handleJoin = async () => {
    setErr("");
    if (!code.trim()) { setErr("יש להזין קוד משפחה"); return; }
    setBusy(true);
    try { await onJoinFamily(code.trim()); } catch (e) { console.error("Join family error:", e); setErr("קרתה תקלה — נסו שוב. (" + (e?.code || e?.message || "") + ")"); }
    setBusy(false);
  };

  return (
    <div dir="rtl" style={{ minHeight: 560, background: T.bgSoft, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: T.surface, borderRadius: 22, boxShadow: T.shadow, border: `1px solid ${T.border}`, padding: 26, textAlign: "center" }}>
        <img src={LOGO_URI} alt="לוגו" style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 12px", display: "block", boxShadow: "0 4px 14px rgba(46,140,157,0.25)" }} />
        <h1 style={{ fontFamily: "Quicksand, sans-serif", fontSize: 21, margin: "0 0 4px", color: T.text }}>היומן המשפחתי</h1>
        <p style={{ fontSize: 12.5, color: T.textMuted, margin: "0 0 20px" }}>ניהול משימות ולוחות זמנים לכל המשפחה</p>

        {!authUser ? (
          <>
            <button disabled={busy} onClick={handleSignIn} style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: "12px", borderRadius: 12, border: `1px solid ${T.border}`, background: "#fff",
              cursor: "pointer", fontSize: 14.5, fontWeight: 700, color: T.text,
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" /></svg>
              המשך עם Google
            </button>
            {err && <div style={{ color: T.danger, fontSize: 12.5, marginTop: 10 }}>{err}</div>}
            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 14 }}>ההתחברות מאובטחת ע"י Google — לא נדרשת סיסמה נפרדת לאפליקציה.</p>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.surfaceAlt, borderRadius: 10, padding: "8px 10px" }}>
              {authUser.photoURL && <img src={authUser.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: "50%" }} />}
              <span style={{ fontSize: 12.5, flex: 1 }}>מחוברים כ-<b>{authUser.displayName || authUser.email}</b></span>
              <button onClick={onSignOut} style={{ border: "none", background: "transparent", color: T.textMuted, cursor: "pointer", fontSize: 11 }}>התנתקות</button>
            </div>

            <Field label="קוד משפחה (קיים או חדש)">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="לדוגמה: כהן2026" style={inputStyle} />
            </Field>
            {err && <div style={{ color: T.danger, fontSize: 12.5 }}>{err}</div>}
            <button disabled={busy} onClick={handleJoin} style={{ padding: "11px", borderRadius: 10, border: "none", background: T.accent, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>כניסה / הצטרפות</button>
            <p style={{ fontSize: 11, color: T.textMuted }}>אם זה קוד משפחה חדש — ייווצר יומן חדש ואתם תהיו ההורה הראשון. הצטרפות לקוד קיים מוסיפה אתכם כברירת מחדל כ"ילד/ה", עד ששדרוג יתבצע ע"י הורה.</p>

            {isAdmin && (
              <button onClick={onGoAdmin} style={{
                marginTop: 6, padding: "10px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface,
                color: T.text, fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}><Shield size={15} /> כניסה כמנהל מערכת</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Admin dashboard ---------------------------------- */
function AdminDashboard({ onOpenFamily, onLogout }) {
  const [families, setFamilies] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => { (async () => setFamilies((await listFamilies()) || []))(); }, []);

  const handleDeleteFamily = async (fam) => {
    if (!confirm(`למחוק לצמיתות את משפחת "${fam.name}" וכל המשימות שלה?`)) return;
    setBusyId(fam.id);
    await deleteFamily(fam.id);
    setFamilies((prev) => prev.filter((f) => f.id !== fam.id));
    setBusyId(null);
  };

  return (
    <div dir="rtl" style={{ fontFamily: "Inter, sans-serif", background: T.bgSoft, minHeight: 560, padding: 16, boxSizing: "border-box", color: T.text }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <img src={LOGO_URI} alt="לוגו" style={{ width: 40, height: 40, borderRadius: "50%" }} />
          <h1 style={{ fontFamily: "Quicksand, sans-serif", fontSize: 20, fontWeight: 800, margin: 0, flex: 1 }}>לוח בקרה — מנהל מערכת</h1>
          <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: 12.5, color: T.text }}><LogOut size={14} /> יציאה</button>
        </div>

        {families === null ? (
          <div style={{ textAlign: "center", padding: 40, color: T.textMuted }}>טוען משפחות…</div>
        ) : families.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: T.textMuted, background: T.surface, borderRadius: T.radius, border: `1px solid ${T.border}` }}>עדיין לא נוצרו משפחות במערכת.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {families.map((fam) => (
              <div key={fam.id} style={{ display: "flex", alignItems: "center", gap: 10, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: 14, boxShadow: T.shadow }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: T.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={18} color={T.accentDark} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{fam.name}</div>
                  <div style={{ fontSize: 11.5, color: T.textMuted }}>קוד: {fam.id} · נוצרה {fam.createdAt ? new Date(fam.createdAt).toLocaleDateString("he-IL") : "—"}</div>
                </div>
                <button onClick={() => onOpenFamily(fam)} style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: T.accent, color: "#fff", cursor: "pointer", fontSize: 12.5, fontWeight: 700 }}>פתיחה</button>
                <button disabled={busyId === fam.id} onClick={() => handleDeleteFamily(fam)} style={{ padding: "8px 10px", borderRadius: 10, border: `1px solid ${T.danger}55`, background: "#FCEEED", color: T.danger, cursor: "pointer" }}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- Family app (calendar) ---------------------------------- */
function FamilyApp({ family, member, isAdminView, onLogout, onBackToAdmin }) {
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("week");
  const [anchor, setAnchor] = useState(todayDate());
  const [editTask, setEditTask] = useState(null);
  const [editTaskDate, setEditTaskDate] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [viewStack, setViewStack] = useState([]); // for back-button: where to return to

  const changeView = (v) => {
    setViewStack((s) => [...s, view]);
    setView(v);
  };

  const goHome = () => {
    setEditTask(null); setEditTaskDate(null); setViewTask(null); setShowMembers(false);
    setViewStack([]); setView("week"); setAnchor(todayDate());
  };

  const canEdit = member.role === "parent";

  // Small hidden diagnostic log for the back-button behavior — tap the 🐛
  // button (bottom-left corner) to reveal it. Useful across different
  // phones/browsers since there's no easy devtools access on mobile.
  const [debugLog, setDebugLog] = useState([]);
  const [showDebug, setShowDebug] = useState(false);
  const log = (msg) => setDebugLog((l) => [...l.slice(-9), `${new Date().toLocaleTimeString("he-IL")} — ${msg} (hist.len=${window.history.length})`]);

  // Keep a ref of the latest state, updated every render (not via useEffect,
  // so there's zero lag) — the popstate listener below is attached ONCE and
  // reads from this ref, instead of being torn down/recreated on every state
  // change. Recreating the listener via a dependency array was causing a
  // race: a fast, repeated back-press could fire before React finished
  // re-attaching the listener with fresh closures, using stale state.
  const latest = useRef({});
  latest.current = { editTask, viewTask, showMembers, view, viewStack };

  useEffect(() => {
    const armGuard = (why) => { window.history.pushState({ appNav: true }, ""); log(`arm: ${why}`); };
    log(`mount, initial hist.len=${window.history.length}`);
    armGuard("initial"); // establish the first guard entry

    const handlePopState = () => {
      const s = latest.current;
      log(`POPSTATE fired! view=${s.view} stack=${s.viewStack.length} edit=${!!s.editTask} viewT=${!!s.viewTask} mem=${!!s.showMembers}`);
      if (s.editTask) { setEditTask(null); setEditTaskDate(null); armGuard("closed editTask"); return; }
      if (s.viewTask) { setViewTask(null); armGuard("closed viewTask"); return; }
      if (s.showMembers) { setShowMembers(false); armGuard("closed members"); return; }
      if (s.viewStack.length > 0) {
        const target = s.viewStack[s.viewStack.length - 1];
        setView(target);
        if (target === "week") setAnchor(todayDate()); // returning to the calendar -> jump to today
        setViewStack((prev) => prev.slice(0, -1));
        armGuard(`popped viewStack -> ${target}`);
        return;
      }
      if (s.view !== "week") { setView("week"); setAnchor(todayDate()); armGuard("forced week"); return; }
      // At home with nothing open: show the confirmation, but deliberately
      // do NOT re-arm — the very next real back press has nothing left of
      // ours to intercept, so the browser/OS handles it as a normal exit
      // (the standard "press back again to exit" pattern).
      log("*** SHOWING EXIT DIALOG (no re-arm) ***");
      setShowExitConfirm(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Re-center on today whenever the app is reopened / comes back from the
  // background — but only if the person is just sitting on the home screen
  // (don't yank them off whatever they're actively doing).
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;
      const s = latest.current;
      if (s.view === "week" && s.viewStack.length === 0 && !s.editTask && !s.viewTask && !s.showMembers) {
        setAnchor(todayDate());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Choosing to stay re-arms the guard so future back presses are caught again.
  const stayInApp = () => {
    setShowExitConfirm(false);
    window.history.pushState({ appNav: true }, "");
  };

  // Real-time: any change any family member makes (on any device) appears
  // here automatically, no manual refresh needed.
  useEffect(() => {
    const unsubTasks = subscribeTasks(family.id, (list) => { setTasks(list); setLoaded(true); });
    const unsubMembers = subscribeMembers(family.id, setMembers);
    return () => { unsubTasks(); unsubMembers(); };
  }, [family.id]);

  // Colors live on the family member, not the task, so if someone changes
  // their color every task they're tied to updates automatically.
  const memberColorMap = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m.color || UNASSIGNED_COLOR])), [members]);
  const coloredTasks = useMemo(
    () => tasks.map((t) => ({ ...t, color: colorForAssignee(t.assigneeId, memberColorMap) })),
    [tasks, memberColorMap]
  );

  const handleSave = async (form) => {
    const assigneeName = form.assigneeId === FAMILY_ID ? "כל המשפחה" : form.assigneeId ? members.find((m) => m.id === form.assigneeId)?.name || "" : "";
    try { await saveTask(family.id, { ...form, assigneeName }); }
    catch (e) { setSaveErr("שמירה נכשלה — נסו שוב"); setTimeout(() => setSaveErr(""), 3000); }
    setEditTask(null);
  };
  const handleDelete = async (id, mode, dateISO) => {
    try {
      if (mode === "occurrence" && dateISO) await excludeTaskDate(family.id, id, dateISO);
      else await deleteTask(family.id, id);
    }
    catch (e) { setSaveErr("מחיקה נכשלה — נסו שוב"); setTimeout(() => setSaveErr(""), 3000); }
    setEditTask(null);
  };

  const openNew = (date) => canEdit && setEditTask(emptyTask(toISO(date || anchor)));
  const openTask = (task, date) => {
    if (canEdit) { setEditTask({ ...task }); setEditTaskDate(toISO(date || fromISO(task.startDate))); }
    else setViewTask(task);
  };

  const goToday = () => setAnchor(todayDate());
  const goPrev = () => {
    if (view === "month") setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1));
    else if (view === "week") setAnchor(addDays(anchor, -7));
    else setAnchor(addDays(anchor, -1));
  };
  const goNext = () => {
    if (view === "month") setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1));
    else if (view === "week") setAnchor(addDays(anchor, 7));
    else setAnchor(addDays(anchor, 1));
  };

  // Swipe left/right on the calendar to move between periods (RTL: swiping
  // left moves forward in time, matching the prev/next chevron directions
  // used in the header controls).
  const touchStartRef = useRef(null);
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) goNext(); else goPrev();
    }
  };

  const title = useMemo(() => {
    if (view === "month") return `${MONTHS_HE[anchor.getMonth()]} ${anchor.getFullYear()}`;
    if (view === "week") {
      const s = startOfWeek(anchor), e = addDays(s, 6);
      return `${s.getDate()} ${MONTHS_HE[s.getMonth()]} – ${e.getDate()} ${MONTHS_HE[e.getMonth()]} ${e.getFullYear()}`;
    }
    return `יום ${WD_FULL[anchor.getDay()]}, ${anchor.getDate()} ${MONTHS_HE[anchor.getMonth()]} ${anchor.getFullYear()}`;
  }, [view, anchor]);

  return (
    <div dir="rtl" style={{ fontFamily: "Inter, sans-serif", background: T.bgSoft, minHeight: 560, padding: 16, boxSizing: "border-box", color: T.text }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200 }}>
            <img src={LOGO_URI} alt="לוגו" onClick={goHome} title="למסך הבית" style={{ width: 38, height: 38, borderRadius: 12, cursor: "pointer" }} />
            <div>
              <h1 style={{ fontFamily: "Quicksand, sans-serif", fontSize: 19, fontWeight: 800, margin: 0, color: T.text }}>{family.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11.5, color: T.textMuted }}>{member.name}</span>
                <RoleBadge role={member.role} />
                {isAdminView && <span style={{ fontSize: 10.5, color: T.accentDark, fontWeight: 700 }}>(צפייה כמנהל מערכת)</span>}
              </div>
            </div>
          </div>

          {canEdit && (
            <button onClick={() => setShowMembers(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.accentDark, cursor: "pointer", fontSize: 13, fontWeight: 600 }}><Users size={15} /> בני משפחה</button>
          )}
          <button onClick={() => downloadICS(tasks, family.name)} title="ייצוא כל היומן לקובץ ICS לייבוא ל-Google Calendar" style={{
            display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.surface, color: T.accentDark, cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}><Download size={15} /> ייצוא ל-Google (ICS)</button>
          {canEdit && (
            <button onClick={() => openNew(anchor)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 10, border: "none",
              background: T.accent, color: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 700,
            }}><Plus size={16} /> משימה חדשה</button>
          )}
          {isAdminView ? (
            <IconBtn onClick={onBackToAdmin} title="חזרה לרשימת המשפחות"><ArrowRight size={17} /></IconBtn>
          ) : (
            <IconBtn onClick={onLogout} title="התנתקות"><LogOut size={17} /></IconBtn>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <IconBtn onClick={goPrev} title="הקודם"><ChevronRight size={18} /></IconBtn>
            <button onClick={goToday} style={{ padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer", fontSize: 12.5, color: T.text }}>היום</button>
            <IconBtn onClick={goNext} title="הבא"><ChevronLeft size={18} /></IconBtn>
            <span style={{ fontFamily: "Quicksand, sans-serif", fontWeight: 700, fontSize: 16.5, marginRight: 6 }}>{title}</span>
          </div>
          <div style={{ display: "flex", background: T.surfaceAlt, borderRadius: 10, padding: 3, gap: 2 }}>
            {[["month", "חודשי"], ["week", "שבועי"], ["day", "יומי"]].map(([v, label]) => (
              <button key={v} onClick={() => changeView(v)} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700,
                background: view === v ? T.accent : "transparent", color: view === v ? "#fff" : T.textMuted,
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {!loaded ? (
            <div style={{ textAlign: "center", padding: 60, color: T.textMuted }}>טוען יומן…</div>
          ) : view === "month" ? (
            <MonthView anchor={anchor} tasks={coloredTasks} canEdit={canEdit}
              onDayClick={(d) => { setAnchor(d); changeView("day"); }}
              onTaskClick={openTask} onAddDay={openNew} />
          ) : view === "week" ? (
            <WeekAgendaView anchor={anchor} tasks={coloredTasks} onTaskClick={openTask} />
          ) : (
            <DayView anchor={anchor} tasks={coloredTasks} onTaskClick={openTask} />
          )}
        </div>

        <p style={{ fontSize: 11.5, color: T.textMuted, marginTop: 14, lineHeight: 1.7 }}>
          <Clock size={12} style={{ verticalAlign: "-1px" }} /> הנתונים מסונכרנים בזמן אמת (Firestore) לכל בני המשפחה.
          לשיתוף מלא עם Google Calendar — לחצו על "ייצוא ל-Google (ICS)" וייבאו את הקובץ ביומן Google (הגדרות ← ייבוא וייצוא),
          או הוסיפו משימה בודדת ישירות דרך "הוספה ליומן Google" בתוך כל משימה.
        </p>
      </div>

      {saveErr && (
        <div style={{ position: "fixed", bottom: 16, insetInlineStart: "50%", transform: "translateX(-50%)", background: T.danger, color: "#fff", padding: "8px 16px", borderRadius: 10, fontSize: 13 }}>{saveErr}</div>
      )}

      {editTask && canEdit && (
        <TaskModal initial={editTask} members={members} occurrenceDate={editTaskDate} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditTask(null)} />
      )}
      {viewTask && !canEdit && <TaskViewModal task={viewTask} onClose={() => setViewTask(null)} />}
      {showMembers && canEdit && (
        <MembersModal family={family} members={members} currentMember={member} onClose={() => setShowMembers(false)} />
      )}
      {showExitConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(20,50,55,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 16 }}>
          <div style={{ background: T.surface, borderRadius: 18, padding: 22, maxWidth: 320, width: "100%", textAlign: "center", boxShadow: "0 12px 40px rgba(20,60,65,0.25)" }}>
            <p style={{ fontSize: 14.5, color: T.text, margin: "0 0 8px", fontWeight: 600 }}>לצאת מהאפליקציה?</p>
            <p style={{ fontSize: 11.5, color: T.textMuted, margin: "0 0 18px" }}>לחיצה נוספת על כפתור/מחוות "אחורה" תסגור את האפליקציה.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={stayInApp} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.text, cursor: "pointer", fontSize: 13.5, fontWeight: 600 }}>להישאר</button>
              <button onClick={() => window.close()} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: T.danger, color: "#fff", cursor: "pointer", fontSize: 13.5, fontWeight: 700 }}>כן, לצאת</button>
            </div>
          </div>
        </div>
      )}

      {/* Tiny hidden diagnostic toggle for the back-button behavior. */}
      <button onClick={() => setShowDebug((v) => !v)} style={{
        position: "fixed", bottom: 8, insetInlineStart: 8, zIndex: 95, width: 30, height: 30, borderRadius: "50%",
        border: "none", background: "rgba(20,30,35,0.5)", color: "#fff", fontSize: 14, cursor: "pointer", opacity: 0.5,
      }}>🐛</button>
      {showDebug && (
        <div style={{
          position: "fixed", bottom: 44, insetInlineStart: 8, insetInlineEnd: 8, zIndex: 95,
          background: "rgba(20,30,35,0.94)", color: "#7CF0C2", fontFamily: "monospace",
          fontSize: 10, padding: "8px 10px", maxHeight: 220, overflowY: "auto", direction: "ltr", textAlign: "left", borderRadius: 10,
        }}>
          {debugLog.length === 0 ? <div>(no events yet — press back)</div> : debugLog.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- Root App: session / routing ---------------------------------- */
export default function App() {
  const [ready, setReady] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mode, setMode] = useState("login"); // 'login' | 'family' | 'admin' | 'admin-family'
  const [family, setFamily] = useState(null);
  const [member, setMember] = useState(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Quicksand:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  // Firebase Auth keeps you signed in across visits automatically; this just
  // reacts to whatever the current auth state is.
  useEffect(() => {
    const unsub = subscribeAuth(async (u) => {
      setAuthUser(u || null);
      if (u) {
        const admin = await isSystemAdmin(u.uid).catch(() => false);
        setIsAdmin(admin);
        const fams = await getUserFamilies(u.uid).catch(() => []);
        if (fams.length === 1) {
          await joinFamily(fams[0], u);
        } else {
          setMode("login");
        }
      } else {
        setFamily(null); setMember(null); setIsAdmin(false); setMode("login");
      }
      setReady(true);
    });
    return unsub;
  }, []);

  const joinFamily = async (code, userOverride) => {
    const user = userOverride || authUser;
    const { family: fam, isNew } = await createFamilyIfMissing(code);
    const mem = await getOrCreateMember(code, user, isNew);
    setFamily(fam); setMember(mem); setMode("family");
  };

  const handleSignIn = () => signInWithGoogle();
  const handleSignOut = async () => { await signOutUser(); };

  const openFamilyAsAdmin = (fam) => {
    setFamily(fam);
    setMember({ id: "admin-view", name: "מנהל מערכת", role: "parent" });
    setMode("admin-family");
  };

  if (!ready) return <div dir="rtl" style={{ minHeight: 560, display: "flex", alignItems: "center", justifyContent: "center", color: T.textMuted, fontFamily: "Inter, sans-serif" }}>טוען…</div>;

  if (mode === "login" || !authUser) {
    return (
      <LoginScreen authUser={authUser} isAdmin={isAdmin}
        onSignIn={handleSignIn} onJoinFamily={joinFamily}
        onGoAdmin={() => setMode("admin")} onSignOut={handleSignOut} />
    );
  }

  if (mode === "admin") return <AdminDashboard onOpenFamily={openFamilyAsAdmin} onLogout={() => setMode("login")} />;

  if (mode === "admin-family") {
    return (
      <FamilyApp family={family} member={member} isAdminView
        onBackToAdmin={() => setMode("admin")} onLogout={handleSignOut} />
    );
  }

  return (
    <FamilyApp family={family} member={member} onLogout={handleSignOut} />
  );
}
