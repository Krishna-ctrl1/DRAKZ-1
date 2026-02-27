import React, { useEffect, useState } from 'react';
import '../../styles/global/LoginTransition.css';

/**
 * Full-screen branded loading animation shown after login,
 * before the user is redirected to their dashboard.
 *
 * Props:
 *   role: 'user' | 'advisor' | 'admin'
 *   userName: string
 *   onComplete: () => void  — called when animation finishes
 */
const LoginTransition = ({ role = 'user', userName = '', onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('enter'); // 'enter' | 'fill' | 'exit'
    const [tipIndex, setTipIndex] = useState(0);

    const roleConfig = {
        user: {
            color: '#6366f1',
            glow: 'rgba(99,102,241,0.35)',
            gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            label: 'User Dashboard',
            icon: 'fa-gauge-high',
            tips: [
                'Loading your financial summary…',
                'Preparing your spending insights…',
                'Fetching your credit score…',
            ],
        },
        advisor: {
            color: '#10b981',
            glow: 'rgba(16,185,129,0.35)',
            gradient: 'linear-gradient(135deg, #059669, #10b981)',
            label: 'Advisor Dashboard',
            icon: 'fa-briefcase',
            tips: [
                'Loading your client portfolio…',
                'Preparing analytics data…',
                'Fetching pending requests…',
            ],
        },
        admin: {
            color: '#f59e0b',
            glow: 'rgba(245,158,11,0.35)',
            gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
            label: 'Admin Panel',
            icon: 'fa-shield-halved',
            tips: [
                'Loading system overview…',
                'Preparing user management…',
                'Fetching platform metrics…',
            ],
        },
    };

    const cfg = roleConfig[role] || roleConfig.user;

    // Cycle tips every 500ms
    useEffect(() => {
        const t = setInterval(() => {
            setTipIndex(i => (i + 1) % cfg.tips.length);
        }, 600);
        return () => clearInterval(t);
    }, [cfg.tips.length]);

    // Progress bar grows 0→100 over ~1.8 seconds, then triggers exit
    useEffect(() => {
        const total = 1800; // ms
        const steps = 60;
        const interval = total / steps;
        let current = 0;

        const t = setInterval(() => {
            current += 1;
            setProgress(Math.min(Math.round((current / steps) * 100), 100));
            if (current >= steps) {
                clearInterval(t);
                setPhase('exit');
                setTimeout(() => onComplete?.(), 420);
            }
        }, interval);

        return () => clearInterval(t);
    }, [onComplete]);

    return (
        <div className={`lt-overlay lt-${phase}`}>
            {/* Animated background particles */}
            <div className="lt-particles">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="lt-particle"
                        style={{
                            '--delay': `${(i * 0.18).toFixed(2)}s`,
                            '--x': `${Math.floor(Math.random() * 100)}%`,
                            '--size': `${4 + (i % 5) * 3}px`,
                            '--color': cfg.color,
                        }}
                    />
                ))}
            </div>

            {/* Glow blob */}
            <div className="lt-glow-blob" style={{ background: cfg.glow }} />

            {/* Center card */}
            <div className="lt-card">
                {/* Logo */}
                <div className="lt-logo" style={{ background: cfg.gradient }}>
                    DRAKZ
                </div>

                {/* Welcome text */}
                <div className="lt-welcome">
                    <span className="lt-hi">Welcome back{userName ? `, ${userName.split(' ')[0]}` : ''}!</span>
                    <span className="lt-role" style={{ color: cfg.color }}>
                        <i className={`fa-solid ${cfg.icon}`}></i>
                        &nbsp;{cfg.label}
                    </span>
                </div>

                {/* Spinning ring + percent */}
                <div className="lt-ring-wrapper">
                    <svg className="lt-ring" viewBox="0 0 80 80">
                        {/* Track */}
                        <circle
                            cx="40" cy="40" r="34"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="5"
                        />
                        {/* Progress arc */}
                        <circle
                            cx="40" cy="40" r="34"
                            fill="none"
                            stroke={cfg.color}
                            strokeWidth="5"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                            transform="rotate(-90 40 40)"
                            style={{ filter: `drop-shadow(0 0 6px ${cfg.color})`, transition: 'stroke-dashoffset 0.03s linear' }}
                        />
                    </svg>
                    <span className="lt-pct" style={{ color: cfg.color }}>{progress}%</span>
                </div>

                {/* Tip text */}
                <p className="lt-tip" key={tipIndex}>
                    {cfg.tips[tipIndex]}
                </p>

                {/* Progress bar */}
                <div className="lt-bar-track">
                    <div
                        className="lt-bar-fill"
                        style={{
                            width: `${progress}%`,
                            background: cfg.gradient,
                            boxShadow: `0 0 12px ${cfg.glow}`,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginTransition;
