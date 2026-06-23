"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Navbar from "@/app/components/Navbar";

export default function Home() {
  const [exams, setExams] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  const fetchData = async () => {
    try {
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .order('name', { ascending: true });
        
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
    let tick = 0;
    const interval = setInterval(async () => {
        try {
          // Alternate: even tick = check exam, odd tick = summarize
          if (tick % 2 === 0) {
            await fetch("/api/cron");
          } else {
            await fetch("/api/cron-summary");
          }
          tick++;
          fetchData();
        } catch {
          // Silently ignore fetch failures (network/extension errors)
        }
    }, 180000); // 3 minutes
    
    return () => clearInterval(interval);
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    await fetch("/api/seed");
    await fetchData();
    setIsSeeding(false);
  };
  
  const toggleRetry = async (e, id, currentVal) => {
     e.stopPropagation();
     await supabase.from('exams').update({ is_retrying: !currentVal }).eq('id', id);
     fetchData();
  };

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
  ];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return (
          <>
          <Navbar />
          <div className="container" style={{padding: '5rem', textAlign: 'center'}}>
              <h1 style={{color: '#ef4444'}}>Supabase Not Configured</h1>
              <p>Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.</p>
          </div>
          </>
      );
  }

  return (
    <>
    <Navbar />
    <div className="container">
      <header className="header">
        <div>
            <h1>Exam Intelligence</h1>
            <p className="subtitle">Click on any exam card to view detailed information.</p>
        </div>
        <div className="header-actions">
            {exams.length === 0 && (
                <button onClick={handleSeed} disabled={isSeeding} className="btn primary-btn">
                    {isSeeding ? "Initializing..." : "Seed Database from JSON"}
                </button>
            )}
        </div>
      </header>
      
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
                <div className="card-header">
                    <div className={`status badge-${exam.status?.toLowerCase() || 'unknown'}`}>
                    {exam.status}
                    </div>
                    <button 
                        onClick={(e) => toggleRetry(e, exam.id, exam.is_retrying)}
                        className={`retry-btn ${exam.is_retrying ? 'active' : ''}`}
                        title="Flag as incorrect to force re-check"
                    >
                        {exam.is_retrying ? '⚠️ Locked' : 'Flag Incorrect'}
                    </button>
                </div>
                <h2>{exam.name}</h2>
                <div className="date">📅 {exam.expected_date || 'Awaiting check...'}</div>
                <div className="last-checked">Last checked: {exam.last_checked_at ? new Date(exam.last_checked_at).toLocaleString() : 'Never'}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedExam && (
          <div className="modal-overlay" onClick={() => setSelectedExam(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close-btn" onClick={() => setSelectedExam(null)}>✕</button>
                  <div className={`status badge-${selectedExam.status?.toLowerCase() || 'unknown'}`} style={{display: 'inline-block', marginBottom: '1rem'}}>
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
                          <p className="no-summary">Summary is being generated. The background job will process this exam shortly.</p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
    </>
  );
}
