import { UserProfile, WeeklyPlan, ClinicalReport } from "../types";

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
