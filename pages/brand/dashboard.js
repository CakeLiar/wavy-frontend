import React, { useEffect, useState } from 'react';
import { API_BASE } from '../../apiBase';
import { useRouter } from 'next/router';
import Campaigns from '../../components/Campaigns';
import CampaignModal from '../../components/CampaignModal';
import { getTokenFromUrl, getStoredToken, saveToken, authHeaders, logout } from '../../utils/auth';

export default function BrandDashboard() {
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [automaticSoftMatching, setAutomaticSoftMatching] = useState(true);
  const [newSoftSpeech, setNewSoftSpeech] = useState('complex');
  const [newSoftEmotion, setNewSoftEmotion] = useState('consistent');
  const [newSoftTone, setNewSoftTone] = useState('credible');

  useEffect(() => {
    // Print query parameters to the console
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());
    console.log('Brand Dashboard query parameters:', params);

    // Centralized token retrieval: try URL first, then sessionStorage
    let token = getTokenFromUrl();
    if (!token) {
      token = getStoredToken();
    } else {
      saveToken(token);
    }
    setAccessToken(token);

    if (token) {
      // Fetch campaigns
      fetch(`${API_BASE}/api/v1/campaigns`, {
        method: 'GET',
        headers: authHeaders(token),
        credentials: 'include',
      })
        .then(res => {
          if (res.status === 401) {
            router.push('/login');
            return;
          }
          return res.json();
        })
        .then(data => {
          if (data && Array.isArray(data.campaigns)) {
            setCampaigns(data.campaigns);
          } else if (data && data.campaigns) {
            setCampaigns([data.campaigns]);
          } else {
            setCampaigns([]);
          }
          setCampaignsLoading(false);
        })
        .catch(err => {
          setCampaignsError('Failed to fetch campaigns');
          setCampaignsLoading(false);
        });
    } else {
      setCampaignsLoading(false);
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout(accessToken);
    } finally {
      router.push('/login');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: newCampaignName, description: newCampaignDescription };
    if (!automaticSoftMatching) {
      // convert to numeric flags expected by backend: complex -> 1, simple -> 0; consistent -> 1, variant -> 0
      payload.speech_complexity = newSoftSpeech === 'complex' ? 1 : 0;
      payload.emotional_pattern = newSoftEmotion === 'consistent' ? 1 : 0;
    }

    try {
      const headers = {
        ...authHeaders(accessToken),
        'Content-Type': 'application/json',
        'automatic-softmatching': automaticSoftMatching ? 'true' : 'false',
      };
      const res = await fetch(`${API_BASE}/api/v1/campaigns`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // refresh campaigns list
        try {
          const cRes = await fetch(`${API_BASE}/api/v1/campaigns`, {
            method: 'GET',
            headers: authHeaders(accessToken),
            credentials: 'include',
          });
          if (cRes.ok) {
            const data = await cRes.json();
            if (data && Array.isArray(data.campaigns)) {
              setCampaigns(data.campaigns);
            } else if (data && data.campaigns) {
              setCampaigns([data.campaigns]);
            }
          }
        } catch (err) {
          // ignore refresh error
        }

        setShowCreateModal(false);
        setNewCampaignName('');
        setNewCampaignDescription('');
        setAutomaticSoftMatching(true);
        setNewSoftSpeech('complex');
        setNewSoftEmotion('consistent');
        setNewSoftTone('credible');
      } else {
        const text = await res.text().catch(() => '');
        alert('Create campaign failed: ' + res.status + ' ' + text);
      }
    } catch (e) {
      console.error('Create campaign error', e);
      alert('Create campaign error');
    }
  };

  return (
    <div className="page">
      <div className="header-row">
        <h1 className="title">Brand Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.6em', alignItems: 'center' }}>
          <button className="minimal-btn" onClick={() => setShowCreateModal(true)}>
            Create Campaign
          </button>
          <button className="minimal-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="view-subtitle-row">
        <div className="view-subtitle">My campaigns</div>
      </div>

      <Campaigns
        campaigns={campaigns}
        loading={campaignsLoading}
        error={campaignsError}
        expandedCampaign={expandedCampaign}
        setExpandedCampaign={setExpandedCampaign}
      />

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Campaign</h3>
            </div>
            <form className="modal-body" onSubmit={handleCreateSubmit}>
              <label>
                Name
                <input className="input" value={newCampaignName} onChange={(e) => setNewCampaignName(e.target.value)} required />
              </label>
              <label>
                Description
                <textarea className="input" rows={4} value={newCampaignDescription} onChange={(e) => setNewCampaignDescription(e.target.value)} />
              </label>
              <label className="row-inline">
                <input type="checkbox" checked={automaticSoftMatching} onChange={(e) => setAutomaticSoftMatching(e.target.checked)} />
                <span className="muted">Automatic Soft-matching</span>
              </label>
              {!automaticSoftMatching && (
                <fieldset className="soft-specs">
                  <legend className="soft-specs-legend">Soft specifications</legend>
                  <div className="soft-specs-list">
                    <div className="row-field">
                      <div className="row-label">Speech complexity</div>
                      <select className="input select-inline" value={newSoftSpeech} onChange={(e) => setNewSoftSpeech(e.target.value)}>
                        <option value="complex">Complex speech</option>
                        <option value="simple">Simple speech</option>
                      </select>
                    </div>
                    <div className="row-field">
                      <div className="row-label">Emotional pattern</div>
                      <select className="input select-inline" value={newSoftEmotion} onChange={(e) => setNewSoftEmotion(e.target.value)}>
                        <option value="consistent">Emotional consistency</option>
                        <option value="variant">Emotionally variant</option>
                      </select>
                    </div>
                    <div className="row-field">
                      <div className="row-label">Tone</div>
                      <select className="input select-inline" value={newSoftTone} onChange={(e) => setNewSoftTone(e.target.value)}>
                        <option value="credible">Credible tone</option>
                        <option value="non-credible">Non-credible tone</option>
                      </select>
                    </div>
                  </div>
                </fieldset>
              )}
              <div className="modal-actions">
                <button type="button" className="minimal-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="minimal-btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {expandedCampaign && (
        <CampaignModal campaign={expandedCampaign} onClose={() => setExpandedCampaign(null)} />
      )}
    </div>
  );
}
