import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdvisorProfile, updateAdvisorProfile, clearMessages } from '../../redux/slices/advisorSlice';
import Header from '../global/Header';
import Sidebar from '../global/Sidebar';
import '../../styles/gupta/AdvisorProfile.css';

const AdvisorProfile = () => {
    const dispatch = useDispatch();
    const { profile, profileLoading, error, successMessage } = useSelector(s => s.advisor);
    const [collapsed, setCollapsed] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        name: '', phone: '', bio: '', specialization: '',
        price: '', experience: '', certificate: '',
        contactEmail: '', contactPhone: '', isAcceptingClients: true
    });

    useEffect(() => {
        dispatch(fetchAdvisorProfile());
    }, [dispatch]);

    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name || '',
                phone: profile.phone || '',
                bio: profile.advisorProfile?.bio || '',
                specialization: profile.advisorProfile?.specialization || '',
                price: profile.advisorProfile?.price || '',
                experience: profile.advisorProfile?.experience || '',
                certificate: profile.advisorProfile?.certificate || '',
                contactEmail: profile.advisorProfile?.contactEmail || '',
                contactPhone: profile.advisorProfile?.contactPhone || '',
                isAcceptingClients: profile.advisorProfile?.isAcceptingClients ?? true,
            });
        }
    }, [profile]);

    useEffect(() => {
        if (successMessage || error) {
            const t = setTimeout(() => dispatch(clearMessages()), 3500);
            return () => clearTimeout(t);
        }
    }, [successMessage, error, dispatch]);

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = () => {
        dispatch(updateAdvisorProfile({
            ...form,
            price: Number(form.price),
            experience: Number(form.experience),
        }));
        setEditing(false);
    };

    const formatCurrency = val =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="advisor-profile-page">
            <Header />
            <div className="app advisor-app">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
                <div className={collapsed ? 'main-content-collapsed' : 'main-content'}>
                    <div className="advisor-profile-content">

                        {/* Toast Notifications */}
                        {successMessage && <div className="profile-toast success"><i className="fa-solid fa-circle-check"></i> {successMessage}</div>}
                        {error && <div className="profile-toast error"><i className="fa-solid fa-triangle-exclamation"></i> {error}</div>}

                        {/* Page Header */}
                        <div className="profile-page-header">
                            <div className="profile-page-title">
                                <h1><i className="fa-solid fa-id-card"></i> My Profile</h1>
                                <p>Manage your advisor profile and public information</p>
                            </div>
                            <div className="profile-header-actions">
                                {editing ? (
                                    <>
                                        <button className="btn-cancel" onClick={() => setEditing(false)}>
                                            <i className="fa-solid fa-xmark"></i> Cancel
                                        </button>
                                        <button className="btn-save" onClick={handleSave} disabled={profileLoading}>
                                            <i className="fa-solid fa-floppy-disk"></i> {profileLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn-edit" onClick={() => setEditing(true)}>
                                        <i className="fa-solid fa-pen-to-square"></i> Edit Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {profileLoading && !profile ? (
                            <div className="profile-loading">
                                <div className="spinner-large"></div>
                                <p>Loading profile...</p>
                            </div>
                        ) : (
                            <div className="profile-grid">

                                {/* Left: Avatar + Status */}
                                <div className="profile-sidebar-card">
                                    <div className="advisor-avatar-xl">
                                        {profile?.name?.[0]?.toUpperCase() || 'A'}
                                    </div>
                                    <h2>{profile?.name}</h2>
                                    <p className="profile-email">{profile?.email}</p>

                                    {/* Accepting Clients Toggle */}
                                    <div className="accepting-toggle-card">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Accepting Clients</span>
                                            <span className={`toggle-status ${form.isAcceptingClients ? 'open' : 'closed'}`}>
                                                {form.isAcceptingClients ? 'Open' : 'Closed'}
                                            </span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                name="isAcceptingClients"
                                                checked={form.isAcceptingClients}
                                                onChange={handleChange}
                                                disabled={!editing}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="profile-quick-stats">
                                        <div className="quick-stat">
                                            <i className="fa-solid fa-clock-rotate-left"></i>
                                            <span>{form.experience || 0}+ yrs</span>
                                        </div>
                                        <div className="quick-stat">
                                            <i className="fa-solid fa-indian-rupee-sign"></i>
                                            <span>{formatCurrency(form.price)}/session</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Form Sections */}
                                <div className="profile-form-area">

                                    {/* Basic Information */}
                                    <div className="profile-section-card">
                                        <h3><i className="fa-solid fa-user"></i> Basic Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Full Name</label>
                                                <input name="name" value={form.name} onChange={handleChange} disabled={!editing} placeholder="Your full name" />
                                            </div>
                                            <div className="form-group">
                                                <label>Phone Number</label>
                                                <input name="phone" value={form.phone} onChange={handleChange} disabled={!editing} placeholder="+91 XXXXX XXXXX" />
                                            </div>
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Bio</label>
                                            <textarea name="bio" value={form.bio} onChange={handleChange} disabled={!editing} placeholder="Describe your advisory approach, background, and what clients can expect..." rows={4} />
                                        </div>
                                    </div>

                                    {/* Professional Details */}
                                    <div className="profile-section-card">
                                        <h3><i className="fa-solid fa-briefcase"></i> Professional Details</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Specialization</label>
                                                <input name="specialization" value={form.specialization} onChange={handleChange} disabled={!editing} placeholder="e.g. Retirement Planning" />
                                            </div>
                                            <div className="form-group">
                                                <label>Certificate / Qualification</label>
                                                <input name="certificate" value={form.certificate} onChange={handleChange} disabled={!editing} placeholder="e.g. CFP, CFA, SEBI RIA" />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Years of Experience</label>
                                                <input type="number" name="experience" value={form.experience} onChange={handleChange} disabled={!editing} placeholder="e.g. 5" min="0" />
                                            </div>
                                            <div className="form-group">
                                                <label>Consultation Fee (₹ per session)</label>
                                                <input type="number" name="price" value={form.price} onChange={handleChange} disabled={!editing} placeholder="e.g. 2000" min="0" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="profile-section-card">
                                        <h3><i className="fa-solid fa-address-book"></i> Contact Information</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Contact Email (shown to clients)</label>
                                                <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} disabled={!editing} placeholder="advisor@example.com" />
                                            </div>
                                            <div className="form-group">
                                                <label>Contact Phone (shown to clients)</label>
                                                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} disabled={!editing} placeholder="+91 XXXXX XXXXX" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvisorProfile;
