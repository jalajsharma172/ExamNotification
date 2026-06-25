import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [exams, setExams] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);

  const fetchData = async () => {
    try {
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .order('last_checked_at', { ascending: false });
      if (examsError) throw examsError;
      setExams(examsData || []);

      const { data: summariesData, error: summariesError } = await supabase
        .from('exam_summaries')
        .select('*');

      if (summariesError) throw summariesError;

      const summaryMap = {};
      if (summariesData) {
        summariesData.forEach(s => {
          try {
            summaryMap[s.exam_id] = JSON.parse(s.concise_text);
          } catch {
            summaryMap[s.exam_id] = { summary: s.concise_text };
          }
        });
      }
      setSummaries(summaryMap);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedSummary = selectedExam ? summaries[selectedExam.id] : null;

  const summaryFields = [
    { label: "Conducting Body", key: "conductingBody" },
    { label: "Post / Role", key: "postName" },
    { label: "Eligibility", key: "eligibility" },
    { label: "Notification Status", key: "notificationStatus" },
    { label: "Expected Notification", key: "expectedNotificationDate" },
    { label: "Expected Exam Date", key: "expectedExamDate" },
    { label: "Application Deadline", key: "applicationDeadline" },
    { label: "Official Website", key: "officialWebsite" },
    { label: "Salary", key: "Salary" },
  ];

  if (!import.meta.env.VITE_SUPABASE_URL) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444' }}>Supabase Not Configured</h1>
          <p>Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <main>
          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="grid">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className={`card ${exam.is_retrying ? 'card-retry' : ''} clickable-card`}
                  onClick={() => setSelectedExam(exam)}
                >
                  <h2>{exam.name}</h2>
                  <div className="date">📅 {exam.expected_date || 'Awaiting check...'}</div>
                  <div className="last-checked">{exam.last_checked_at ? new Date(exam.last_checked_at).toLocaleString() : 'Never'}</div>
                </div>
              ))}
            </div>
          )}
        </main>

        {selectedExam && (
          <div className="modal-overlay" onClick={() => setSelectedExam(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedExam(null)}>✕</button>
              <div className={`status badge-${selectedExam.status?.toLowerCase() || 'unknown'}`} style={{ display: 'inline-block', marginBottom: '1rem' }}>
                {selectedExam.status}
              </div>
              <h2>{selectedExam.name}</h2>

              {selectedSummary ? (
                <>
                  <table className="info-table">
                    <tbody>
                      {summaryFields.map(field => {
                        const value = selectedSummary[field.key];
                        if (!value || value === 'N/A') return null;
                        return (
                          <tr key={field.key}>
                            <td className="info-label">{field.label}</td>
                            <td className="info-value">
                              {field.key === 'officialWebsite' && value.startsWith('http') ? (
                                <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
                              ) : value}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {selectedSummary.summary && (
                    <div className="summary-section">
                      <h3>AI Summary</h3>
                      <p>{selectedSummary.summary}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="summary-section">
                  <p className="no-summary">Nothing</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
