import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import HsssBuilderApp from './App';

const REGIONS = ["Gold Coast","Brisbane","Ipswich","Toowoomba","Sunshine Coast"];

const AuthWrapper = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [builderProfile, setBuilderProfile] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  // Auth form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [signUpComplete, setSignUpComplete] = useState(false);

  // Builder profile fields
  const [companyName, setCompanyName] = useState('');
  const [abn, setAbn] = useState('');
  const [contactName, setContactName] = useState('');
  const [mobile, setMobile] = useState('');
  const [serviceType, setServiceType] = useState('Supply & Install');
  const [region, setRegion] = useState(REGIONS[0]);
  const [streetAddress, setStreetAddress] = useState('');
  const [suburb, setSuburb] = useState('');
  const [state, setState2] = useState('QLD');
  const [postcode, setPostcode] = useState('');

  const brandColors = {
    navy: '#003A70',
    cyan: '#00AEEF',
    white: '#FFFFFF',
    navyDeep: '#001B3D',
    midGrey: '#5A7D9E',
  };

  // ===== AUTH STATE MANAGEMENT =====
  useEffect(() => {
    checkAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const u = session?.user || null;
        setUser(u);
        setLoading(false);
        if (u) checkBuilderProfile(u);
      }
    );
    return () => { authListener?.subscription?.unsubscribe(); };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const u = session?.user || null;
      setUser(u);
      if (u) await checkBuilderProfile(u);
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkBuilderProfile = async (u) => {
    try {
      setProfileLoading(true);
      const { data, error: fetchError } = await supabase
        .from('builders')
        .select('*')
        .eq('user_id', u.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Profile fetch error:', fetchError);
      }

      if (data && data.company_name) {
        setBuilderProfile(data);
        setNeedsProfile(false);
        // Check for pending signup data in localStorage and clear it
        localStorage.removeItem('hsss_pending_profile');
      } else {
        // Check if there's pending profile data from signup
        const pending = localStorage.getItem('hsss_pending_profile');
        if (pending) {
          try {
            const profileData = JSON.parse(pending);
            const saved = await saveBuilderProfile(u, profileData, data?.id || null);
            if (saved) {
              setBuilderProfile(saved);
              setNeedsProfile(false);
              localStorage.removeItem('hsss_pending_profile');
              return;
            }
          } catch (e) {
            console.error('Error restoring pending profile:', e);
          }
        }
        setBuilderProfile(data || null);
        setNeedsProfile(true);
      }
    } catch (err) {
      console.error('Profile check error:', err);
      setNeedsProfile(true);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveBuilderProfile = async (u, profileData, existingId = null) => {
    const dataToSave = {
      user_id: u.id,
      company_name: profileData.company_name || null,
      abn: profileData.abn || null,
      contact_name: profileData.contact_name || null,
      contact_email: profileData.contact_email || u.email || null,
      contact_phone: profileData.contact_phone || null,
      mobile: profileData.mobile || null,
      service_type: profileData.service_type || 'Supply & Install',
      region: profileData.region || null,
      street_address: profileData.street_address || null,
      suburb: profileData.suburb || null,
      state: profileData.state || 'QLD',
      postcode: profileData.postcode || null,
      default_markup: profileData.default_markup ?? 0,
      notes: profileData.notes || null,
      updated_at: new Date().toISOString(),
    };

    try {
      let result;
      if (existingId) {
        const { data, error } = await supabase
          .from('builders').update(dataToSave).eq('id', existingId).select().single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('builders').insert([dataToSave]).select().single();
        if (error) throw error;
        result = data;
      }
      return result;
    } catch (err) {
      console.error('Error saving profile:', err);
      return null;
    }
  };

  // ===== AUTH HANDLERS =====
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
      });
      if (signInError) {
        setError(signInError.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    // Build profile data object
    const profileData = {
      company_name: companyName,
      abn: abn || null,
      contact_name: contactName,
      contact_email: email.trim(),
      mobile: mobile,
      contact_phone: mobile,
      service_type: serviceType,
      region: serviceType === 'Supply & Install' ? region : null,
      street_address: streetAddress,
      suburb: suburb,
      state: state,
      postcode: postcode,
      default_markup: 0,
    };

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(), password,
      });

      if (signUpError) {
        setError(signUpError.message || 'Sign up failed. Please try again.');
        setAuthLoading(false);
        return;
      }

      // Try to save profile immediately (works if auto-confirm is on)
      if (signUpData?.user) {
        const saved = await saveBuilderProfile(signUpData.user, profileData);
        if (!saved) {
          // If save failed (e.g. email not confirmed yet), store in localStorage
          localStorage.setItem('hsss_pending_profile', JSON.stringify(profileData));
        }
      } else {
        // No user returned, store for later
        localStorage.setItem('hsss_pending_profile', JSON.stringify(profileData));
      }

      setSignUpComplete(true);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileCompletion = async (e) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    const profileData = {
      company_name: companyName,
      abn: abn || null,
      contact_name: contactName,
      contact_email: user.email,
      mobile: mobile,
      contact_phone: mobile,
      service_type: serviceType,
      region: serviceType === 'Supply & Install' ? region : null,
      street_address: streetAddress,
      suburb: suburb,
      state: state,
      postcode: postcode,
      default_markup: 0,
    };

    try {
      const saved = await saveBuilderProfile(user, profileData, builderProfile?.id || null);
      if (saved) {
        setBuilderProfile(saved);
        setNeedsProfile(false);
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setAuthLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) { setError(resetError.message || 'Password reset request failed.'); return; }
      setResetSent(true);
      setTimeout(() => { setResetSent(false); setShowForgotPassword(false); }, 3000);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setBuilderProfile(null);
      setNeedsProfile(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const resetSignUpForm = () => {
    setIsSignUp(false); setSignUpStep(1); setSignUpComplete(false);
    setEmail(''); setPassword(''); setConfirmPassword('');
    setCompanyName(''); setAbn(''); setContactName(''); setMobile('');
    setServiceType('Supply & Install'); setRegion(REGIONS[0]);
    setStreetAddress(''); setSuburb(''); setState2('QLD'); setPostcode('');
    setError('');
  };

  // ===== SHARED STYLES =====
  const inputStyle = {
    width: '100%', padding: '10px 12px', fontSize: '14px',
    border: '1px solid #e0e0e0', borderRadius: '6px',
    boxSizing: 'border-box', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', marginBottom: '6px', fontSize: '13px',
    fontWeight: '500', color: brandColors.navy,
  };

  const fieldWrap = { marginBottom: '14px' };

  const btnPrimary = {
    width: '100%', padding: '12px', backgroundColor: brandColors.cyan,
    color: brandColors.navy, border: 'none', borderRadius: '6px',
    fontSize: '15px', fontWeight: '700', cursor: authLoading ? 'not-allowed' : 'pointer',
    opacity: authLoading ? 0.7 : 1, transition: 'opacity 0.2s',
  };

  const btnOutline = {
    width: '100%', padding: '10px', backgroundColor: 'transparent',
    color: brandColors.navy, border: '1.5px solid #ddd', borderRadius: '6px',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
  };

  const stepDot = (num, active, done) => ({
    width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '13px', fontWeight: '700', transition: 'all 0.3s',
    backgroundColor: done ? brandColors.cyan : active ? brandColors.navy : '#e8e8e8',
    color: done || active ? brandColors.white : '#999',
    border: active ? `2px solid ${brandColors.cyan}` : '2px solid transparent',
  });

  const stepLine = (done) => ({
    flex: 1, height: 2, backgroundColor: done ? brandColors.cyan : '#e0e0e0',
    margin: '0 6px', transition: 'all 0.3s',
  });

  // ===== STEP INDICATORS =====
  const StepIndicator = ({ current, total = 3 }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
      {Array.from({ length: total }, (_, i) => i + 1).map((num) => (
        <React.Fragment key={num}>
          <div style={stepDot(num, num === current, num < current)}>
            {num < current ? '✓' : num}
          </div>
          {num < total && <div style={stepLine(num < current)} />}
        </React.Fragment>
      ))}
    </div>
  );

  // ===== SERVICE TYPE TOGGLE =====
  const ServiceTypeToggle = () => (
    <div style={fieldWrap}>
      <label style={labelStyle}>Service Type *</label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {['Supply & Install', 'Supply Only'].map(t => (
          <button key={t} type="button" onClick={() => setServiceType(t)}
            style={{
              flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: serviceType === t ? brandColors.cyan : '#f5f5f5',
              color: serviceType === t ? brandColors.navy : '#666',
              border: serviceType === t ? `2px solid ${brandColors.navy}` : '1.5px solid #ddd',
            }}>{t}</button>
        ))}
      </div>
    </div>
  );

  // ===== REGION PICKER =====
  const RegionPicker = () => (
    <div style={fieldWrap}>
      <label style={labelStyle}>Install Region *</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {REGIONS.map(r => (
          <button key={r} type="button" onClick={() => setRegion(r)}
            style={{
              padding: '9px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: region === r ? brandColors.cyan : '#f5f5f5',
              color: region === r ? brandColors.navy : '#666',
              border: region === r ? `2px solid ${brandColors.navy}` : '1.5px solid #ddd',
            }}>{r}</button>
        ))}
      </div>
    </div>
  );

  // ===== VALIDATION =====
  const step1Valid = email && password && confirmPassword && password === confirmPassword && password.length >= 6;
  const step2Valid = companyName && contactName && mobile;
  const step3Valid = streetAddress && suburb && state && postcode;

  const validateStep1 = () => {
    if (!email) { setError('Email is required.'); return false; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return false; }
    setError(''); return true;
  };

  const validateStep2 = () => {
    if (!companyName) { setError('Company name is required.'); return false; }
    if (!contactName) { setError('Contact name is required.'); return false; }
    if (!mobile) { setError('Mobile number is required.'); return false; }
    setError(''); return true;
  };

  // ===== LOADING SCREEN =====
  if (loading || profileLoading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        backgroundColor: brandColors.navyDeep, fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: brandColors.cyan, marginBottom: '16px' }}>HSSS</div>
          <div style={{ color: brandColors.white, fontSize: '14px', opacity: 0.7 }}>Loading...</div>
        </div>
      </div>
    );
  }

  // ===== PROFILE COMPLETION (existing user, no profile) =====
  if (user && needsProfile) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
        backgroundColor: brandColors.navyDeep, padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: '100%', maxWidth: '440px', backgroundColor: brandColors.white,
          borderRadius: '12px', padding: '32px 28px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: brandColors.navy, marginBottom: '4px' }}>HSSS</div>
            <div style={{ fontSize: '14px', color: brandColors.cyan, fontWeight: '600' }}>Complete Your Profile</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>We need a few details before you can start ordering.</div>
          </div>

          <StepIndicator current={signUpStep} />

          {error && (
            <div style={{
              padding: '10px 12px', marginBottom: '14px', backgroundColor: '#fee',
              border: '1px solid #fcc', borderRadius: '6px', fontSize: '12px', color: '#c33',
            }}>{error}</div>
          )}

          <form onSubmit={signUpStep === 2 ? handleProfileCompletion : (e) => { e.preventDefault(); if (validateStep2()) setSignUpStep(2); }}>
            {signUpStep === 1 && <>
              <div style={fieldWrap}>
                <label style={labelStyle}>Company Name *</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Smith Bathrooms" required style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>ABN <span style={{ color: '#999', fontWeight: '400' }}>(optional)</span></label>
                <input type="text" value={abn} onChange={e => setAbn(e.target.value)} placeholder="e.g. 12 345 678 901" style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Your Name *</label>
                <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Your full name" required style={inputStyle} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Mobile *</label>
                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="0400 000 000" required style={inputStyle} />
              </div>
              <button type="submit" disabled={!step2Valid} style={{ ...btnPrimary, opacity: step2Valid ? 1 : 0.4 }}>Next →</button>
            </>}

            {signUpStep === 2 && <>
              <ServiceTypeToggle />
              {serviceType === 'Supply & Install' && <RegionPicker />}
              <div style={fieldWrap}>
                <label style={labelStyle}>Business Address *</label>
                <input type="text" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="123 Builder St" required style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Suburb *</label>
                  <input type="text" value={suburb} onChange={e => setSuburb(e.target.value)} placeholder="Suburb" required style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>State *</label>
                    <input type="text" value={state} onChange={e => setState2(e.target.value)} placeholder="QLD" required style={inputStyle} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Postcode *</label>
                    <input type="text" value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="4000" required style={inputStyle} />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={authLoading || !step3Valid} style={{ ...btnPrimary, opacity: (authLoading || !step3Valid) ? 0.4 : 1, marginBottom: '8px' }}>
                {authLoading ? 'Saving...' : 'Save & Continue'}
              </button>
              <button type="button" onClick={() => setSignUpStep(1)} style={btnOutline}>← Back</button>
            </>}
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e8e8e8' }}>
            <button type="button" onClick={handleSignOut}
              style={{ backgroundColor: 'transparent', color: '#999', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== SIGN UP COMPLETE =====
  if (signUpComplete) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
        backgroundColor: brandColors.navyDeep, padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: '100%', maxWidth: '400px', backgroundColor: brandColors.white,
          borderRadius: '12px', padding: '40px 32px', textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: brandColors.navy, marginBottom: '8px' }}>Check Your Email</div>
          <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '24px' }}>
            We've sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account, then come back here to log in.
          </div>
          <button onClick={resetSignUpForm} style={btnPrimary}>Back to Login</button>
        </div>
      </div>
    );
  }

  // ===== LOGIN / SIGNUP FORM =====
  if (!user) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
        backgroundColor: brandColors.navyDeep, padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: '100%', maxWidth: isSignUp ? '440px' : '400px',
          backgroundColor: brandColors.white, borderRadius: '12px',
          padding: isSignUp ? '32px 28px' : '40px 32px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          transition: 'max-width 0.3s',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: isSignUp ? '16px' : '32px' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: brandColors.navy, marginBottom: '4px' }}>HSSS</div>
            <div style={{ fontSize: '14px', color: brandColors.cyan, fontWeight: '600' }}>
              {isSignUp ? 'Builder Registration' : 'Builder Portal'}
            </div>
          </div>

          {/* Forgot Password */}
          {showForgotPassword ? (
            <form onSubmit={handlePasswordReset}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={inputStyle} />
              </div>
              {error && (
                <div style={{ padding: '10px 12px', marginBottom: '14px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '6px', fontSize: '12px', color: '#c33' }}>{error}</div>
              )}
              {resetSent && (
                <div style={{ padding: '10px 12px', marginBottom: '14px', backgroundColor: '#efe', border: '1px solid #cfc', borderRadius: '6px', fontSize: '12px', color: '#393' }}>Reset link sent! Check your email.</div>
              )}
              <button type="submit" disabled={authLoading} style={{ ...btnPrimary, marginBottom: '10px' }}>
                {authLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => { setShowForgotPassword(false); setError(''); setResetSent(false); }} style={btnOutline}>Back</button>
            </form>

          /* Sign Up Flow */
          ) : isSignUp ? (
            <>
              <StepIndicator current={signUpStep} />

              {error && (
                <div style={{ padding: '10px 12px', marginBottom: '14px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '6px', fontSize: '12px', color: '#c33' }}>{error}</div>
              )}

              {/* Step 1: Account */}
              {signUpStep === 1 && (
                <form onSubmit={e => { e.preventDefault(); if (validateStep1()) setSignUpStep(2); }}>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Email Address *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={inputStyle} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Password *</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" required style={inputStyle} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Confirm Password *</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required style={inputStyle} />
                  </div>
                  <button type="submit" style={{ ...btnPrimary, marginBottom: '10px' }}>Next →</button>
                  <button type="button" onClick={resetSignUpForm} style={btnOutline}>← Back to Login</button>
                </form>
              )}

              {/* Step 2: Company & Contact */}
              {signUpStep === 2 && (
                <form onSubmit={e => { e.preventDefault(); if (validateStep2()) setSignUpStep(3); }}>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Company Name *</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Smith Bathrooms" required style={inputStyle} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>ABN <span style={{ color: '#999', fontWeight: '400' }}>(optional)</span></label>
                    <input type="text" value={abn} onChange={e => setAbn(e.target.value)} placeholder="e.g. 12 345 678 901" style={inputStyle} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Your Name *</label>
                    <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Your full name" required style={inputStyle} />
                  </div>
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Mobile *</label>
                    <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="0400 000 000" required style={inputStyle} />
                  </div>
                  <button type="submit" disabled={!step2Valid} style={{ ...btnPrimary, marginBottom: '10px', opacity: step2Valid ? 1 : 0.4 }}>Next →</button>
                  <button type="button" onClick={() => { setSignUpStep(1); setError(''); }} style={btnOutline}>← Back</button>
                </form>
              )}

              {/* Step 3: Service & Address */}
              {signUpStep === 3 && (
                <form onSubmit={handleSignUp}>
                  <ServiceTypeToggle />
                  {serviceType === 'Supply & Install' && <RegionPicker />}
                  <div style={fieldWrap}>
                    <label style={labelStyle}>Business Address *</label>
                    <input type="text" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="123 Builder St" required style={inputStyle} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                    <div style={fieldWrap}>
                      <label style={labelStyle}>Suburb *</label>
                      <input type="text" value={suburb} onChange={e => setSuburb(e.target.value)} placeholder="Suburb" required style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div style={fieldWrap}>
                        <label style={labelStyle}>State *</label>
                        <input type="text" value={state} onChange={e => setState2(e.target.value)} placeholder="QLD" required style={inputStyle} />
                      </div>
                      <div style={fieldWrap}>
                        <label style={labelStyle}>Post *</label>
                        <input type="text" value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="4000" required style={inputStyle} />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={authLoading || !step3Valid}
                    style={{ ...btnPrimary, marginBottom: '10px', opacity: (authLoading || !step3Valid) ? 0.4 : 1 }}>
                    {authLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <button type="button" onClick={() => { setSignUpStep(2); setError(''); }} style={btnOutline}>← Back</button>
                </form>
              )}
            </>

          /* Login Form */
          ) : (
            <>
              <form onSubmit={handleLogin}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={inputStyle} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" required style={inputStyle} />
                </div>
                {error && (
                  <div style={{ padding: '10px 12px', marginBottom: '14px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '6px', fontSize: '12px', color: '#c33' }}>{error}</div>
                )}
                <button type="submit" disabled={authLoading} style={{ ...btnPrimary, marginBottom: '12px' }}>
                  {authLoading ? 'Logging In...' : 'Log In'}
                </button>
              </form>
              <button type="button" onClick={() => { setShowForgotPassword(true); setError(''); }}
                style={{ width: '100%', padding: '8px', marginBottom: '20px', backgroundColor: 'transparent', color: brandColors.cyan, border: 'none', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Forgot Password?
              </button>
              <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid #e0e0e0' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Don't have an account?</p>
                <button type="button" onClick={() => { setIsSignUp(true); setError(''); setEmail(''); setPassword(''); setConfirmPassword(''); }}
                  style={{ backgroundColor: 'transparent', color: brandColors.cyan, border: 'none', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== MAIN APP =====
  return <HsssBuilderApp user={user} signOut={handleSignOut} builderProfile={builderProfile} />;
};

export default AuthWrapper;
