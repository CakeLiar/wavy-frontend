import React, { useMemo, useState } from 'react';

function sampleCreators() {
  return [
    { id: 'c1', name: 'Ava Stone', age: 24, behavioral: 0.82, emotional: 0.75, semantic: 0.68, expected_views: 12500 },
    { id: 'c2', name: 'Liam Reed', age: 31, behavioral: 0.62, emotional: 0.55, semantic: 0.72, expected_views: 8900 },
    { id: 'c3', name: 'Noah Kim', age: 28, behavioral: 0.45, emotional: 0.60, semantic: 0.40, expected_views: 4300 },
    { id: 'c4', name: 'Emma Lopez', age: 22, behavioral: 0.92, emotional: 0.88, semantic: 0.81, expected_views: 20400 },
    { id: 'c5', name: 'Olivia Park', age: 27, behavioral: 0.71, emotional: 0.69, semantic: 0.73, expected_views: 9600 },
  ];
}

function pct(v) { return Math.round((v || 0) * 100); }

export default function CampaignModal({ campaign, onClose }) {
  if (!campaign) return null;

  const [tab, setTab] = useState('creators');

  // creators can come from campaign.creators or sample data
  const creators = useMemo(() => campaign.creators && Array.isArray(campaign.creators) && campaign.creators.length > 0 ? campaign.creators : sampleCreators(), [campaign]);

  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filtered = useMemo(() => {
    return creators.filter(c => {
      const behavioralLabel = (c.behavioral >= 0.75 ? 'high' : c.behavioral >= 0.5 ? 'medium' : 'low');
      const emotionalLabel = (c.emotional >= 0.75 ? 'high' : c.emotional >= 0.5 ? 'medium' : 'low');
      const semanticLabel = (c.semantic >= 0.75 ? 'high' : c.semantic >= 0.5 ? 'medium' : 'low');
      const overallScore = ((c.behavioral || 0) + (c.emotional || 0) + (c.semantic || 0)) / 3;
      const overallLabel = (overallScore >= 0.75 ? 'high' : overallScore >= 0.5 ? 'medium' : 'low');

      if (selectedLevel === 'all') return true;

      let valueLabel = 'low';
      if (selectedMetric === 'behavioral') valueLabel = behavioralLabel;
      else if (selectedMetric === 'emotional') valueLabel = emotionalLabel;
      else if (selectedMetric === 'semantic') valueLabel = semanticLabel;
      else valueLabel = overallLabel;

      return valueLabel === selectedLevel;
    });
  }, [creators, selectedMetric, selectedLevel]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Applicants</h3>
          <div style={{ display: 'flex', gap: '0.6em' }}>
            <button className="minimal-btn" onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="modal-body">
          {tab === 'creators' && (
            <div>
              <div className="table-filter-bar">
                <label style={{ color: '#ddd', marginRight: '0.6em', fontWeight: 700 }}>Filter by</label>
                <select className="col-filter" value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} style={{ width: '160px', marginRight: '0.6em' }}>
                  <option value="overall">Overall fit</option>
                  <option value="semantic">Semantic fit</option>
                  <option value="emotional">Emotional fit</option>
                  <option value="behavioral">Behavioral fit</option>
                </select>
                <select className="col-filter" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} style={{ width: '140px' }}>
                  <option value="all">All levels</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="creators-table-wrap">
                <table className="creators-table">
                  <thead>
                    <tr>
                      <th><div className="col-header">Name</div></th>
                      <th><div className="col-header">Age</div></th>
                      
                      <th><div className="col-header">Behavioral fit</div></th>
                      <th><div className="col-header">Emotional fit</div></th>
                      <th><div className="col-header">Semantic fit</div></th>
                      <th><div className="col-header">Overall fit</div></th>
                      <th><div className="col-header">Expected views</div></th>
                      <th style={{ width: '100px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => {
                      const behavioralLabel = (c.behavioral >= 0.75 ? 'High' : c.behavioral >= 0.5 ? 'Medium' : 'Low');
                      const emotionalLabel = (c.emotional >= 0.75 ? 'High' : c.emotional >= 0.5 ? 'Medium' : 'Low');
                      const semanticLabel = (c.semantic >= 0.75 ? 'High' : c.semantic >= 0.5 ? 'Medium' : 'Low');
                      const overallScore = ((c.behavioral || 0) + (c.emotional || 0) + (c.semantic || 0)) / 3;
                      const overallLabel = (overallScore >= 0.75 ? 'High' : overallScore >= 0.5 ? 'Medium' : 'Low');
                      return (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{c.age}</td>
                          <td>{behavioralLabel} ({pct(c.behavioral)}%)</td>
                          <td>{emotionalLabel} ({pct(c.emotional)}%)</td>
                          <td>{semanticLabel} ({pct(c.semantic)}%)</td>
                          <td>{overallLabel} ({pct(overallScore)}%)</td>
                          <td>{c.expected_views?.toLocaleString?.() ?? c.expected_views ?? '-'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="invite-btn" disabled>Invite</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

