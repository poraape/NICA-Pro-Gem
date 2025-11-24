import React, { useEffect, useState } from "react";
import { ClinicalReport, WeeklyPlan } from "../types";
import { fetchPlans, fetchReports } from "../services/geminiService";

type Props = {
  profileId: string;
};

export const PlanHistory: React.FC<Props> = ({ profileId }) => {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [p, r] = await Promise.all([fetchPlans(profileId), fetchReports(profileId)]);
        setPlans(p);
        setReports(r);
      } catch (e) {
        setError("Failed to load history");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profileId]);

  return (
    <div className="bg-white/70 border border-neutral-200 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-neutral-800">History</h3>
        {loading && <span className="text-xs text-neutral-500">Loading...</span>}
      </div>
      {error && <p className="text-sm text-error-600">{error}</p>}
      {!loading && !error && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Plans</p>
            {plans.length === 0 && <p className="text-sm text-neutral-400">No plans saved.</p>}
            <ul className="space-y-1">
              {plans.map((p) => (
                <li key={p.id} className="text-sm text-neutral-700">
                  {p.generatedAt || "N/A"} - {p.days?.length || 0} days
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Reports</p>
            {reports.length === 0 && <p className="text-sm text-neutral-400">No reports saved.</p>}
            <ul className="space-y-1">
              {reports.map((r) => (
                <li key={r.id} className="text-sm text-neutral-700">
                  {r.generatedAt || "N/A"} - Score: {r.overallScore ?? "N/A"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
