import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';
import './Profile.css';

/* ── Helpers ── */
const formatDate = (d) => {
  if (!d) return 'Unknown';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const safeArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (name) => {
  const colors = [
    ['#1a3a5c', '#a6c8ff'],
    ['#1a3a2a', '#00e29e'],
    ['#3a1a3a', '#d4a6ff'],
    ['#3a2a1a', '#ffcc80'],
    ['#1a2a3a', '#80d4ff'],
  ];
  const idx = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[idx];
};

/* ── Skeleton ── */
const ProfileSkeleton = () => (
  <div className="profile-skeleton">
    <div className="profile-left-skeleton">
      <div className="skeleton-circle" />
      <div className="skeleton-line w-3/4" style={{ width: '75%' }} />
      <div className="skeleton-line" style={{ width: '50%' }} />
      <div className="skeleton-line" style={{ width: '65%' }} />
      <div className="skeleton-card" />
      <div className="skeleton-card" />
      <div className="skeleton-card" />
    </div>
    <div className="profile-right-skeleton">
      <div className="skeleton-tabs skeleton-block" />
      <div className="skeleton-block tall" />
    </div>
  </div>
);

/* ── Toggle Switch ── */
const Toggle = ({ checked, onChange, id }) => (
  <div className="toggle-wrap">
    <label className="toggle-switch" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
    <span className="toggle-label">{checked ? 'Yes' : 'No'}</span>
  </div>
);

/* ═══════════════════════════════════════════
   TAB: OVERVIEW
═══════════════════════════════════════════ */
const TabOverview = ({ candidate }) => {
  const skills = safeArray(candidate?.skills);
  const languages = safeArray(candidate?.languages);
  const certs = safeArray(candidate?.certifications);

  return (
    <div className="tab-content-panel glass-card">
      <div className="update-cv-banner">
        <div className="update-cv-banner-text">
          <strong>Want to update your Profile Info or Skills?</strong>
          <br />
          These details are extracted from your CV by our AI. Upload a new CV to update them.
        </div>
        <Link to="/upload" className="update-cv-btn">Update CV</Link>
      </div>

      {/* About */}
      <div>
        <div className="section-label">About</div>
        <p className="about-text">
          {candidate?.professional_summary || 'No summary extracted from your CV yet.'}
        </p>
      </div>

      {/* Skills */}
      <div>
        <div className="section-label">Skills</div>
        {skills.length > 0 ? (
          <div className="pills-row">
            {skills.map((s, i) => <span key={i} className="skill-pill">{s}</span>)}
          </div>
        ) : (
          <p className="muted-placeholder">Skills will appear here after your CV is parsed.</p>
        )}
      </div>

      {/* Languages & Certifications */}
      <div className="two-col-grid">
        <div>
          <div className="section-label">
            <span className="material-symbols-outlined">translate</span>Languages
          </div>
          {languages.length > 0 ? languages.map((l, i) => (
            <div key={i} className="list-item-row">
              <span className="material-symbols-outlined">translate</span>
              {typeof l === 'string' ? l : l.name || JSON.stringify(l)}
            </div>
          )) : <p className="muted-placeholder">None listed</p>}
        </div>
        <div>
          <div className="section-label">
            <span className="material-symbols-outlined">verified</span>Certifications
          </div>
          {certs.length > 0 ? certs.map((c, i) => (
            <div key={i} className="list-item-row">
              <span className="material-symbols-outlined">verified</span>
              {typeof c === 'string' ? c : c.name || c.title || JSON.stringify(c)}
            </div>
          )) : <p className="muted-placeholder">None listed</p>}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   TAB: EXPERIENCE
═══════════════════════════════════════════ */
const TabExperience = ({ candidate, navigate }) => {
  const education = safeArray(candidate?.education);
  const experience = safeArray(candidate?.experience);

  if (education.length === 0 && experience.length === 0) {
    return (
      <div className="tab-content-panel glass-card">
        <div className="empty-state">
          <span className="material-symbols-outlined">upload_file</span>
          <p>Upload your CV to extract your experience automatically.</p>
          <Link to="/upload" className="empty-state-btn">Go to Upload</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content-panel glass-card">
      <div className="update-cv-banner">
        <div className="update-cv-banner-text">
          <strong>Want to update your Experience or Education?</strong>
          <br />
          These details are extracted directly from your CV. Upload a new CV to refresh them.
        </div>
        <Link to="/upload" className="update-cv-btn">Update CV</Link>
      </div>

      {education.length > 0 && (
        <div>
          <div className="section-label">
            <span className="material-symbols-outlined">school</span>Education
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {education.map((ed, i) => (
              <div key={i} className="timeline-item glass-card timeline-with-icon">
                <div className="timeline-icon-circle">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="timeline-header">
                    <div className="timeline-title-block">
                      <p className="timeline-title">{ed.school || ed.institution || 'Unknown School'}</p>
                      <p className="timeline-sub">{ed.degree || ed.field || ''}</p>
                      {ed.location && <p className="timeline-location">{ed.location}</p>}
                    </div>
                    {ed.date && <span className="timeline-date">{ed.date}</span>}
                  </div>
                  {safeArray(ed.details).length > 0 && (
                    <ul className="timeline-details">
                      {safeArray(ed.details).map((d, j) => <li key={j}>{d}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {experience.length > 0 && (
        <div>
          <div className="section-label">
            <span className="material-symbols-outlined">work</span>Work Experience
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {experience.map((ex, i) => (
              <div key={i} className="timeline-item glass-card">
                <div className="timeline-header">
                  <div className="timeline-title-block">
                    <p className="timeline-title">{ex.title || ex.role || 'Unknown Role'}</p>
                    <p className="timeline-sub">
                      {ex.company || ''}
                      {ex.company && ex.location ? ' • ' : ''}
                      {ex.location || ''}
                    </p>
                  </div>
                  {ex.date && <span className="timeline-date">{ex.date}</span>}
                </div>
                {safeArray(ex.details).length > 0 && (
                  <ul className="timeline-details">
                    {safeArray(ex.details).map((d, j) => <li key={j}>{d}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   TAB: PREFERENCES
═══════════════════════════════════════════ */
const TabPreferences = ({ profile, desiredLocations, desiredIndustries, preferredFunctions }) => {
  const score = profile?.min_match_score || 85;
  return (
    <div className="tab-content-panel glass-card">
      {/* Job Search Preferences */}
      <div>
        <div className="section-label">Job Search Preferences</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Remote */}
          <div className="pref-row glass-card">
            <div className="pref-row-icon">
              <span className="material-symbols-outlined">home_work</span>
            </div>
            <div className="pref-row-body">
              <div className="pref-row-label">Open to Remote</div>
              <div className={`pref-row-value ${profile?.open_to_remote ? 'green' : 'muted'}`}>
                {profile?.open_to_remote ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          {/* Match score */}
          <div className="pref-row glass-card">
            <div className="pref-row-icon">
              <span className="material-symbols-outlined">center_focus_strong</span>
            </div>
            <div className="pref-row-body">
              <div className="pref-row-label">Minimum Match Score</div>
              <div className="pref-row-value blue">{score}%</div>
              <div className="match-bar-track">
                <div className="match-bar-fill" style={{ width: `${score}%` }} />
              </div>
            </div>
          </div>
          {/* Smart alerts */}
          <div className="pref-row glass-card">
            <div className="pref-row-icon">
              <span className="material-symbols-outlined">notifications_active</span>
            </div>
            <div className="pref-row-body">
              <div className="pref-row-label">Smart Job Alerts</div>
              <div className={`pref-row-value ${profile?.smart_alerts ? 'green' : 'muted'}`}>
                {profile?.smart_alerts ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Locations */}
      <div>
        <div className="section-label">
          <span className="material-symbols-outlined">map</span>Target Locations
        </div>
        {desiredLocations.length > 0 ? (
          <div className="pills-row">
            {desiredLocations.map((loc, i) => (
              <span key={i} className="green-pill">
                <span className="material-symbols-outlined">location_on</span>
                {[loc.city, loc.country].filter(Boolean).join(', ')}
              </span>
            ))}
          </div>
        ) : <p className="muted-placeholder">No target locations set.</p>}
      </div>

      {/* Target Industries */}
      <div>
        <div className="section-label">
          <span className="material-symbols-outlined">category</span>Target Industries
        </div>
        {desiredIndustries.length > 0 ? (
          <div className="pills-row">
            {desiredIndustries.map((ind, i) => <span key={i} className="green-pill">{ind}</span>)}
          </div>
        ) : <p className="muted-placeholder">No target industries set.</p>}
      </div>

      {/* Preferred Functions */}
      <div>
        <div className="section-label">
          <span className="material-symbols-outlined">work</span>Preferred Roles
        </div>
        {preferredFunctions.length > 0 ? (
          <div className="pills-row">
            {preferredFunctions.map((fn, i) => <span key={i} className="purple-pill">{fn}</span>)}
          </div>
        ) : <p className="muted-placeholder">No preferred roles set.</p>}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   TAB: SETTINGS
═══════════════════════════════════════════ */
const TabSettings = ({ editForm, setEditForm, isEditing, setIsEditing, isSaving, saveError, saveSuccess, handleSave, profile, candidate, signOut, navigate }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleCancel = () => {
    setEditForm({
      full_name: profile?.full_name || candidate?.full_name || '',
      location: candidate?.location || '',
      open_to_remote: profile?.open_to_remote || false,
      min_match_score: profile?.min_match_score || 85,
      smart_alerts: profile?.smart_alerts ?? true,
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match or are empty.");
      return;
    }
    setIsChangingPassword(true);
    setPasswordError(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setIsChangingPassword(false);
  };

  return (
    <div className="tab-content-panel glass-card">
      <div>
        <div className="section-label">Profile Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Display Name */}
          <div className="settings-field">
            <label className="settings-field-label" htmlFor="settings-name">DISPLAY NAME</label>
            {isEditing ? (
              <input
                id="settings-name"
                className="profile-input"
                type="text"
                value={editForm.full_name}
                onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.92rem', color: '#d3e5f1' }}>{editForm.full_name || '—'}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(166,200,255,0.5)', display: 'flex', alignItems: 'center', padding: 0 }}
                  title="Edit"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="settings-field">
            <label className="settings-field-label" htmlFor="settings-location">LOCATION</label>
            {isEditing ? (
              <input
                id="settings-location"
                className="profile-input"
                type="text"
                value={editForm.location}
                onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.92rem', color: '#d3e5f1' }}>{editForm.location || '—'}</span>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(166,200,255,0.5)', display: 'flex', alignItems: 'center', padding: 0 }}
                  title="Edit"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                </button>
              </div>
            )}
          </div>

          {/* Remote toggle */}
          <div className="settings-field">
            <div className="settings-field-label">REMOTE WORK</div>
            <Toggle
              id="settings-remote"
              checked={editForm.open_to_remote}
              onChange={val => { setIsEditing(true); setEditForm(p => ({ ...p, open_to_remote: val })); }}
            />
          </div>

          {/* Match score slider */}
          <div className="settings-field">
            <div className="settings-field-label">
              MINIMUM MATCH SCORE
              <span>{editForm.min_match_score}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              className="score-slider"
              value={editForm.min_match_score}
              onChange={e => { setIsEditing(true); setEditForm(p => ({ ...p, min_match_score: Number(e.target.value) })); }}
            />
          </div>

          {/* Smart alerts toggle */}
          <div className="settings-field">
            <div className="settings-field-label">SMART ALERTS</div>
            <Toggle
              id="settings-alerts"
              checked={editForm.smart_alerts}
              onChange={val => { setIsEditing(true); setEditForm(p => ({ ...p, smart_alerts: val })); }}
            />
          </div>

          {saveSuccess && (
            <div className="save-success-toast">
              <span className="material-symbols-outlined">check_circle</span>
              Saved successfully
            </div>
          )}
          {saveError && <div className="save-error-banner"><span className="material-symbols-outlined">error_outline</span>{saveError}</div>}

          <div className="settings-action-row">
            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
              {isSaving
                ? <><span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '16px' }}>sync</span>Saving…</>
                : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span>Save Changes</>
              }
            </button>
            {isEditing && (
              <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
            )}
          </div>

          {/* Password Section */}
          <div className="password-section">
            <div className="section-label">SECURITY</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="settings-field">
                <label className="settings-field-label">NEW PASSWORD</label>
                <input
                  type="password"
                  className="profile-input"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
              </div>
              <div className="settings-field">
                <label className="settings-field-label">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  className="profile-input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              
              {passwordSuccess && (
                <div className="save-success-toast">
                  <span className="material-symbols-outlined">check_circle</span>
                  Password updated successfully
                </div>
              )}
              {passwordError && <div className="save-error-banner"><span className="material-symbols-outlined">error_outline</span>{passwordError}</div>}

              <button 
                className="profile-edit-btn" 
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !newPassword}
                style={{ marginTop: '0.5rem' }}
              >
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="danger-zone-card">
        <div className="danger-zone-title">Danger Zone</div>
        <button
          className="btn-signout"
          onClick={async () => { await signOut(); navigate('/auth'); }}
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const Profile = () => {
  const { session, signOut } = useAuth();
  const user = session?.user;
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [desiredLocations, setDesiredLocations] = useState([]);
  const [desiredIndustries, setDesiredIndustries] = useState([]);
  const [preferredFunctions, setPreferredFunctions] = useState([]);
  const [appCount, setAppCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (event) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      setIsUploadingAvatar(true);
      setSaveError(null);

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      let updateError = null;
      if (profile?.id) {
        const { error } = await supabase
          .from('user_profile')
          .update({ avatar_url: publicUrl })
          .eq('id', profile.id);
        updateError = error;
      } else {
        const { error, data } = await supabase
          .from('user_profile')
          .insert({ user_id: user.id, avatar_url: publicUrl })
          .select().single();
        updateError = error;
        if (data) setProfile(data);
      }

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError('An error occurred during upload. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const [editForm, setEditForm] = useState({
    full_name: '',
    location: '',
    open_to_remote: false,
    min_match_score: 85,
    smart_alerts: true,
  });

  useEffect(() => {
    if (!user?.id) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: profileData, error: profileErr } = await supabase
          .from('user_profile').select('*').eq('user_id', user.id).maybeSingle();
        if (!profileErr && profileData) setProfile(profileData);

        const { data: candidateData, error: candidateErr } = await supabase
          .from('candidates').select('*').eq('user_id', user.id).maybeSingle();
        if (!candidateErr && candidateData) setCandidate(candidateData);

        const { data: locData } = await supabase
          .from('user_desired_location')
          .select('location:location_id(city, region, country)')
          .eq('user_profile_id', profileData?.id);
        setDesiredLocations(locData?.map(d => d.location) || []);

        const { data: indData } = await supabase
          .from('user_desired_industry')
          .select('industry:industry_id(name)')
          .eq('user_profile_id', profileData?.id);
        setDesiredIndustries(indData?.map(d => d.industry?.name).filter(Boolean) || []);

        const { data: funcData } = await supabase
          .from('user_preferred_function')
          .select('job_function:function_id(name)')
          .eq('user_profile_id', profileData?.id);
        setPreferredFunctions(funcData?.map(d => d.job_function?.name).filter(Boolean) || []);

        const { count } = await supabase
          .from('applications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setAppCount(count || 0);

        setEditForm({
          full_name: profileData?.full_name || candidateData?.full_name || '',
          location: candidateData?.location || '',
          open_to_remote: profileData?.open_to_remote || false,
          min_match_score: profileData?.min_match_score || 85,
          smart_alerts: profileData?.smart_alerts ?? true,
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.id]);

  const handleSave = useCallback(async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setSaveError(null);
    
    let pError = null;
    let cError = null;

    // Update user_profile
    if (profile?.id) {
      const { error } = await supabase
        .from('user_profile')
        .update({
          full_name: editForm.full_name,
          open_to_remote: editForm.open_to_remote,
          min_match_score: editForm.min_match_score,
          smart_alerts: editForm.smart_alerts,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);
      pError = error;
    } else {
      const { error, data } = await supabase
        .from('user_profile')
        .insert({
          user_id: user.id,
          full_name: editForm.full_name,
          open_to_remote: editForm.open_to_remote,
          min_match_score: editForm.min_match_score,
          smart_alerts: editForm.smart_alerts,
        })
        .select().single();
      pError = error;
      if (data) setProfile(data);
    }

    // Update candidates
    if (candidate?.id) {
      const { error } = await supabase
        .from('candidates')
        .update({
          full_name: editForm.full_name,
          location: editForm.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidate.id);
      cError = error;
    }

    if (pError || cError) {
      setSaveError('An error occurred while saving. Please try again.');
      console.error('Save error:', pError || cError);
    } else {
      setProfile(prev => ({ ...prev, full_name: editForm.full_name, open_to_remote: editForm.open_to_remote, min_match_score: editForm.min_match_score, smart_alerts: editForm.smart_alerts }));
      setCandidate(prev => ({ ...prev, full_name: editForm.full_name, location: editForm.location }));
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setIsSaving(false);
  }, [profile?.id, candidate?.id, user?.id, editForm]);

  if (loading) return <ProfileSkeleton />;

  const displayName = profile?.full_name || candidate?.full_name || user?.email?.split('@')[0] || 'User';
  const [avatarBg, avatarFg] = getAvatarColor(displayName);
  const cvUploaded = !!candidate?.cv_storage_path;

  const TABS = [
    { key: 'overview', icon: 'person', label: 'Overview' },
    { key: 'experience', icon: 'work_history', label: 'Experience' },
    { key: 'preferences', icon: 'tune', label: 'Preferences' },
    { key: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <div className="profile-page-wrapper">
      <Sidebar />
      <main className="profile-main">
        {/* ── LEFT COLUMN ── */}
        <div className="profile-left">
          {/* Success / error toast */}
          {saveSuccess && (
            <div className="save-success-toast">
              <span className="material-symbols-outlined">check_circle</span>
              Saved successfully
            </div>
          )}
          {saveError && !activeTab === 'settings' && (
            <div className="save-error-banner">
              <span className="material-symbols-outlined">error_outline</span>
              {saveError}
            </div>
          )}

          {/* Identity card */}
          <div className="identity-card glass-card">
            <div 
              className="profile-avatar" 
              style={profile?.avatar_url ? { backgroundImage: `url(${profile.avatar_url})` } : { background: avatarBg, color: avatarFg }}
            >
              {!profile?.avatar_url && getInitials(displayName)}
              
              <label className="avatar-upload-label" htmlFor="avatar-upload">
                <span className="material-symbols-outlined">photo_camera</span>
              </label>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                className="avatar-upload-input"
                onChange={handleAvatarUpload}
                disabled={isUploadingAvatar}
              />
              {isUploadingAvatar && (
                <div className="avatar-uploading-overlay">
                  <span className="material-symbols-outlined">sync</span>
                </div>
              )}
            </div>

            <h2 className="identity-name">{displayName}</h2>

            <div className="identity-badges">
              {candidate?.seniority_level && (
                <span className="seniority-pill">{candidate.seniority_level}</span>
              )}
              {candidate?.years_experience && (
                <span className="years-pill">{candidate.years_experience} YRS EXP</span>
              )}
            </div>

            <div className="identity-meta">
              {candidate?.location && (
                <div className="identity-meta-row">
                  <span className="material-symbols-outlined">location_on</span>
                  {candidate.location}
                </div>
              )}
              {user?.email && (
                <div className="identity-meta-row">
                  <span className="material-symbols-outlined">alternate_email</span>
                  {user.email}
                </div>
              )}
              {profile?.created_at && (
                <div className="identity-meta-row tiny">
                  <span className="material-symbols-outlined">calendar_today</span>
                  Member since {formatDate(profile.created_at)}
                </div>
              )}
            </div>
          </div>

          {/* Mini stats */}
          <div className="mini-stats">
            {/* Applications */}
            <div className="mini-stat-card glass-card">
              <div className="mini-stat-icon mini-stat-icon--blue">
                <span className="material-symbols-outlined">send</span>
              </div>
              <div className="mini-stat-content">
                <div className="mini-stat-value">{appCount}</div>
                <div className="mini-stat-label">Applications Sent</div>
              </div>
            </div>

            {/* CV Status */}
            <div className="mini-stat-card glass-card">
              <div className={`mini-stat-icon ${cvUploaded ? 'mini-stat-icon--green' : 'mini-stat-icon--red'}`}>
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="mini-stat-content">
                <div className={`mini-stat-value ${cvUploaded ? 'green' : 'red'}`}>
                  {cvUploaded ? 'Uploaded' : 'Missing'}
                </div>
                <div className="mini-stat-label">CV Status</div>
                {!cvUploaded && (
                  <Link to="/upload" className="mini-stat-link">
                    → Upload
                  </Link>
                )}
              </div>
            </div>

            {/* Match Threshold */}
            <div className="mini-stat-card glass-card">
              <div className="mini-stat-icon mini-stat-icon--blue">
                <span className="material-symbols-outlined">center_focus_strong</span>
              </div>
              <div className="mini-stat-content">
                <div className="mini-stat-value blue">{profile?.min_match_score || 85}%</div>
                <div className="mini-stat-label">Min Match Score</div>
              </div>
            </div>
          </div>

          {/* Edit / Save button (left column) */}
          {activeTab !== 'settings' && (
            isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="edit-action-row">
                  <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                    {isSaving
                      ? <><span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '16px' }}>sync</span>Saving…</>
                      : 'Save'
                    }
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        full_name: profile?.full_name || '',
                        open_to_remote: profile?.open_to_remote || false,
                        min_match_score: profile?.min_match_score || 85,
                        smart_alerts: profile?.smart_alerts ?? true,
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {saveError && (
                  <div className="save-error-banner">
                    <span className="material-symbols-outlined">error_outline</span>
                    {saveError}
                  </div>
                )}
              </div>
            ) : (
              <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                <span className="material-symbols-outlined">edit</span>
                Edit Preferences
              </button>
            )
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="profile-right">
          {/* Tab bar */}
          <div className="profile-tab-bar">
            {TABS.map(t => (
              <button
                key={t.key}
                id={`tab-${t.key}`}
                className={`profile-tab-btn ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                <span className="material-symbols-outlined">{t.icon}</span>
                <span className="tab-label">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'overview' && <TabOverview candidate={candidate} />}
          {activeTab === 'experience' && <TabExperience candidate={candidate} navigate={navigate} />}
          {activeTab === 'preferences' && (
            <TabPreferences
              profile={profile}
              desiredLocations={desiredLocations}
              desiredIndustries={desiredIndustries}
              preferredFunctions={preferredFunctions}
            />
          )}
          {activeTab === 'settings' && (
            <TabSettings
              editForm={editForm}
              setEditForm={setEditForm}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              isSaving={isSaving}
              saveError={saveError}
              saveSuccess={saveSuccess}
              handleSave={handleSave}
              profile={profile}
              candidate={candidate}
              signOut={signOut}
              navigate={navigate}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
