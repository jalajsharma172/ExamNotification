"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Navbar from "@/app/components/Navbar";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('check_history')
        .select(`
          id, status, expected_date, details, checked_at, is_correct,
          exams ( name )
        `)
        .order('checked_at', { ascending: false })
        .limit(200);

      if (!error) setHistory(data || []);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>History Logs</h1>
          <p className="subtitle">Chronological log of every AI check performed. Showing the latest 200 entries.</p>
        </div>

        {loading ? (
          <div className="table-container">
            <div className="card skeleton" style={{ minHeight: '400px' }}></div>
          </div>
        ) : (
          <div className="table-container">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Exam Name</th>
                  <th>Status</th>
                  <th>Expected Date</th>
                  <th>AI Response</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="time-cell">{new Date(h.checked_at).toLocaleString()}</td>
                    <td className="exam-cell">{h.exams?.name}</td>
                    <td><span className={`status badge-${h.status?.toLowerCase() || 'unknown'}`}>{h.status}</span></td>
                    <td>{h.expected_date}</td>
                    <td className="details-cell">{h.details}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No history recorded yet. The automated checker will populate this over time.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
