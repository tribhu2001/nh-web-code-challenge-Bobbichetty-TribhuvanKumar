import { useState } from 'react';
import { findOptimalClinician } from './data';

function App() {
  const [address, setAddress] = useState('');
  const [includeLabDropoff, setIncludeLabDropoff] = useState(false);
  const [result, setResult] = useState<{ clinicianName: string; totalDistance: number } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!address.trim()) {
      setError('Please enter a patient address.');
      return;
    }
    setError('');
    const best = findOptimalClinician(address.trim(), includeLabDropoff);
    setResult(best);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Clinician Dispatch Dashboard</h1>
        <p>Find the optimal clinician based on estimated round-trip distance.</p>
      </header>

      <div className='display-grid'>
        <section className="card form-card">
          <h2>Patient Address</h2>
          <form onSubmit={handleSubmit}>
            <label>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Enter patient address"
                aria-label="Patient Address"
                className='address-input'
              />
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeLabDropoff}
                onChange={(event) => setIncludeLabDropoff(event.target.checked)}
              />
              Lab Drop-off Required
            </label>

            <button type="submit">Find Optimal Clinician</button>
            {error && <p className="error-text">{error}</p>}
          </form>
        </section>

        <section className="card result-card">
          <h2>Best Match</h2>
          {result ? (
            <div className="result-detail">
              <p>
                <strong>Clinician:</strong> {result.clinicianName}
              </p>
              <p>
                <strong>Estimated Round-Trip Distance:</strong> {result.totalDistance} miles
              </p>
            </div>
          ) : (
            <p>Submit the form to evaluate the optimal clinician.</p>
          )}
        </section>
      </div>
      
    </div>
  );
}

export default App;
