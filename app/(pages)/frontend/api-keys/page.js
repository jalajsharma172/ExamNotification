"use client";
import { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.keys.map(k => ({ ...k, status: 'untested' })));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testKey = async (keyName, keyValue) => {
    setKeys(prev => prev.map(k => k.name === keyName ? { ...k, status: 'testing' } : k));
    try {
      const res = await fetch("/api/gemini-keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: keyValue })
      });
      const data = await res.json();
      
      if (data.success) {
        setKeys(prev => prev.map(k => k.name === keyName ? { ...k, status: 'working', message: 'Working (200 OK)' } : k));
      } else {
        setKeys(prev => prev.map(k => k.name === keyName ? { ...k, status: 'bad', message: `Bad (${data.status}): ${data.error}` } : k));
      }
    } catch (err) {
      setKeys(prev => prev.map(k => k.name === keyName ? { ...k, status: 'bad', message: `Error: ${err.message}` } : k));
    }
  };

  const testAllKeys = async () => {
    for (const k of keys) {
      if (k.status === 'untested' || k.status === 'bad') {
        await testKey(k.name, k.key);
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <header className="header">
          <div>
            <h1>API Keys Status</h1>
            <p className="subtitle">Check which Gemini API keys are working or exhausted.</p>
          </div>
          <div className="header-actions">
            <button onClick={testAllKeys} className="btn primary-btn">
              Test All Keys
            </button>
            <button onClick={fetchKeys} className="btn">
              Refresh
            </button>
          </div>
        </header>

        <main>
          {error && <div className="error">{error}</div>}
          
          {loading ? (
            <div className="grid">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card skeleton"></div>
              ))}
            </div>
          ) : (
            <div className="table-container">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Key Name</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.name}>
                      <td className="exam-cell">{k.name}</td>
                      <td className="time-cell">
                        {k.key.length > 12 ? `${k.key.substring(0, 8)}...${k.key.substring(k.key.length - 4)}` : k.key}
                      </td>
                      <td>
                        {k.status === 'untested' && <span style={{ color: 'var(--status-unknown)' }}>Untested</span>}
                        {k.status === 'testing' && <span style={{ color: 'var(--status-ongoing)' }}>Testing...</span>}
                        {k.status === 'working' && <span style={{ color: 'var(--status-announced)', fontWeight: 'bold' }}>🟢 Working</span>}
                        {k.status === 'bad' && (
                          <div>
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🔴 Bad</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '300px' }}>
                              {k.message}
                            </div>
                          </div>
                        )}
                      </td>
                      <td>
                        <button 
                          onClick={() => testKey(k.name, k.key)} 
                          className="btn" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          disabled={k.status === 'testing'}
                        >
                          {k.status === 'testing' ? 'Testing...' : 'Test Key'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {keys.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No Gemini API keys found in .env file.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
