import { create } from "zustand";
import { PlanTaskResponse } from "../services/geminiService";

interface AgentState {
  tasks: Record<string, PlanTaskResponse>;
  setTask: (task: PlanTaskResponse) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  tasks: {},
  setTask: (task) =>
    set((state) => ({
      tasks: { ...state.tasks, [task.task_id]: task },
    })),
}));
