import React, { useEffect } from "react";
import { subscribeAgentEvents } from "../services/geminiService";
import { useAgentStore } from "../stores/agentStore";

export const AgentsDashboard: React.FC = () => {
  const { tasks, setTask } = useAgentStore();

  useEffect(() => {
    const unsub = subscribeAgentEvents((evt) => {
      if (typeof evt !== "object" || !evt.payload?.task_id) return;
      setTask(evt.payload);
    });
    return () => unsub();
  }, [setTask]);

  const taskList = Object.values(tasks);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Agents Dashboard</h2>
      {taskList.length === 0 && <p className="text-sm text-neutral-500">No tasks yet.</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {taskList.map((task) => (
          <div key={task.task_id} className="border rounded-lg p-4 shadow-sm bg-white/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500">Task</p>
                <p className="font-semibold">{task.task_id}</p>
              </div>
              <span className="px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700">
                {task.status}
              </span>
            </div>
            <div className="mt-2 text-sm">
              <p><strong>Correlation:</strong> {task.correlation_id || "-"}</p>
              <p><strong>Plan:</strong> {task.plan ? "Ready" : "Pending"}</p>
              <p><strong>Report:</strong> {task.clinical_report ? "Ready" : "Pending"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
