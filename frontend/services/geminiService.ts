import { UserProfile, WeeklyPlan, ClinicalReport, MealItem, Language } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const WS_BASE = import.meta.env.VITE_WS_BASE || "ws://localhost:8000";

export interface PlanTaskResponse {
  task_id: string;
  status: string;
  correlation_id?: string;
  plan?: WeeklyPlan;
  clinical_report?: ClinicalReport;
}

export const fetchLatestPlan = async (profileId: string): Promise<WeeklyPlan | null> => {
  const res = await fetch(`${API_BASE}/api/profiles/${profileId}/plans/latest`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch latest plan");
  const data = await res.json();
  return data.plan;
};

export const fetchLatestReport = async (profileId: string): Promise<ClinicalReport | null> => {
  const res = await fetch(`${API_BASE}/api/profiles/${profileId}/reports/latest`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch latest report");
  const data = await res.json();
  return data.report;
};

export const fetchPlans = async (profileId: string): Promise<WeeklyPlan[]> => {
  const res = await fetch(`${API_BASE}/api/profiles/${profileId}/plans`);
  if (!res.ok) throw new Error("Failed to fetch plans");
  const data = await res.json();
  return data.map((p: any) => p.plan);
};

export const fetchReports = async (profileId: string): Promise<ClinicalReport[]> => {
  const res = await fetch(`${API_BASE}/api/profiles/${profileId}/reports`);
  if (!res.ok) throw new Error("Failed to fetch reports");
  const data = await res.json();
  return data.map((r: any) => r.report);
};

export const enqueuePlan = async (profile: UserProfile): Promise<PlanTaskResponse> => {
  const res = await fetch(`${API_BASE}/api/agents/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) throw new Error("Failed to enqueue plan generation");
  return res.json();
};

export const getPlanStatus = async (taskId: string): Promise<PlanTaskResponse> => {
  const res = await fetch(`${API_BASE}/api/agents/plan/${taskId}`);
  if (!res.ok) throw new Error("Failed to fetch task status");
  return res.json();
};

export const subscribeAgentEvents = (onEvent: (msg: any) => void) => {
  const ws = new WebSocket(`${WS_BASE}/ws/agents`);
  ws.onmessage = (evt) => {
    try {
      onEvent(JSON.parse(evt.data));
    } catch {
      onEvent(evt.data);
    }
  };
  return () => ws.close();
};

/**
 * Lightweight meal text analyzer used by SmartMealInput.
 * Tries backend endpoint when available and falls back to a local heuristic so the UI keeps working.
 */
export const analyzeMealText = async (text: string, language: Language): Promise<MealItem | null> => {
  const payload = { text, language };
  try {
    const res = await fetch(`${API_BASE}/api/analysis/meal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      return {
        id: data.id || (crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`),
        name: data.name || text || "Meal",
        description: data.description || text,
        calories: data.calories ?? 0,
        macros: data.macros || { protein: 0, carbs: 0, fats: 0 },
        timestamp: data.timestamp || new Date().toISOString(),
        isEdited: true,
      };
    }
  } catch (err) {
    console.warn("analyzeMealText falling back to client heuristic:", err);
  }

  // Fallback: naive estimate based on text length
  const baseCals = Math.min(900, Math.max(250, text.length * 8));
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}`,
    name: text.trim() || "Meal",
    description: text,
    calories: Math.round(baseCals),
    macros: {
      protein: Math.round(baseCals * 0.3 / 4),
      carbs: Math.round(baseCals * 0.45 / 4),
      fats: Math.round(baseCals * 0.25 / 9),
    },
    timestamp: new Date().toISOString(),
    isEdited: true,
  };
};
