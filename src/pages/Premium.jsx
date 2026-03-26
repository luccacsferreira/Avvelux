import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Crown, Zap, X, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

const PROMO_DAYS = 7;
const PROMO_DISCOUNT = 0.30;
const YEARLY_DISCOUNT = 0.27;

function getTheme() {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('avvelux-theme') : null;
  return saved === 'light' ? 'light' : 'dark';
}

function getPromoDeadline(user) {
  if (!user?.created_date) return null;
  return new Date(new Date(user.created_date).getTime() + PROMO_DAYS * 24 * 60 * 60 * 1000);
}

function useCountdown(deadline) {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = deadline - new Date();
      if (diff <= 0) { setTimeLeft({ expired: true }); return; }
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return timeLeft;
}

const PLANS = {
  Basic: {
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    description: 'Perfect for learners who want more',
    monthlyPrice: 15.77,
    features: [
      '30 AI Video Summary credits/month',
      'No ads',
      'Unlimited chats with AI',
      '30% off on courses',
      '15% off on account/content promotion',
    ],
    notIncluded: [
      '75 AI Summary credits',
      'Unlimited chats with GPT-5.2',
      'Free Courses',
      '30% off on channel/content promotions',
    ],
  },
  'Avvelux+': {
    icon: Crown,
    color: 'from-purple-500 to-cyan-500',
    description: 'The full Avvelux experience, unleashed',
    monthlyPrice: 23.57,
    features: [
      'Everything from Basic Plan',
      '75 monthly AI Summary credits',
      'Unlimited chats with GPT-5.2',
      'Free Courses',
      '30% off on channel/content promotions',
    ],
    notIncluded: [],
  },
};

export default function Premium() {
  const [theme] = useState(getTheme);
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [billing, setBilling] = useState('monthly');

  const isLight = theme === 'light';

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const deadline = getPromoDeadline(user);
  const countdown = useCountdown(deadline);
  const promoActive = countdown && !countdown.expired;

  const getFinalPrice = (monthlyPrice, bil) => {
    const base = bil === 'yearly' ? monthlyPrice * 12 * (1 - YEARLY_DISCOUNT) : monthlyPrice;
    return promoActive ? base * (1 - PROMO_DISCOUNT) : base;
  };

  const bg = isLight ? 'bg-white' : 'bg-[#111]';
  const cardBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#1c1c1c] border-gray-800';
  const text = isLight ? 'text-gray-900' : 'text-white';
  const muted = isLight ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`min-h-screen ${bg} ${text} flex flex-col`} style={{ position: 'fixed', inset: 0, zIndex: 9999, overflowY: 'auto' }}>
      {/* Close button only — no logo, no bar */}
      <div className="absolute top-4 right-4">
        <Link to={createPageUrl('Home')} className={`flex items-center gap-1.5 text-sm ${muted} hover:text-purple-400 transition-colors`}>
          <X className="w-4 h-4" /> Close
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center py-14 px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full px-4 py-1.5 text-sm text-white font-medium mb-4">
            <Crown className="w-4 h-4" /> Go Premium
          </div>
          <h1 className="text-4xl font-bold mb-2">Choose your plan</h1>
          <p className={`text-lg ${muted}`}>Unlock the full Avvelux experience</p>
        </div>

        {/* Promo Banner */}
        {promoActive && (
          <div className="mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl px-6 py-4 text-white text-center max-w-xl w-full">
            <p className="font-bold text-lg">🎉 Welcome Offer — 30% OFF</p>
            <p className="text-sm opacity-90 mb-2">This offer expires in:</p>
            <div className="flex gap-3 justify-center text-xl font-mono font-bold">
              {countdown.d > 0 && <span>{countdown.d}d</span>}
              <span>{String(countdown.h).padStart(2,'0')}h</span>
              <span>{String(countdown.m).padStart(2,'0')}m</span>
              <span>{String(countdown.s).padStart(2,'0')}s</span>
            </div>
          </div>
        )}

        {/* Plan selector */}
        {!selected && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full">
            {Object.entries(PLANS).map(([name, plan]) => {
              const Icon = plan.icon;
              const displayPrice = promoActive
                ? (plan.monthlyPrice * (1 - PROMO_DISCOUNT)).toFixed(2)
                : plan.monthlyPrice.toFixed(2);
              return (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className={`text-left border-2 rounded-2xl p-6 transition-all hover:scale-[1.02] hover:border-purple-500 ${cardBg}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold mb-1">{name}</h2>
                  <p className={`text-sm ${muted} mb-4`}>{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    {promoActive && <span className={`text-sm line-through ${muted}`}>${plan.monthlyPrice.toFixed(2)}</span>}
                    <span className="text-3xl font-bold">${displayPrice}</span>
                    <span className={`text-sm ${muted}`}>/mo</span>
                  </div>
                  {promoActive && (
                    <span className="inline-block mt-1 text-xs bg-green-500/20 text-green-400 rounded-full px-2 py-0.5">30% off</span>
                  )}
                  <div className={`mt-4 pt-4 border-t ${isLight ? 'border-gray-200' : 'border-gray-700'} text-sm ${muted} space-y-1`}>
                    {plan.features.slice(0, 3).map(f => (
                      <div key={f} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0 mt-0.5" /> {f}
                      </div>
                    ))}
                    <div className="text-xs text-purple-400 mt-1">+ {plan.features.length - 3} more →</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Detail view */}
        {selected && (
          <div className="max-w-lg w-full">
            <button onClick={() => setSelected(null)} className={`text-sm ${muted} mb-6 hover:underline flex items-center gap-1`}>
              <ArrowLeft className="w-4 h-4" /> Back to plans
            </button>

            <div className={`border rounded-2xl p-6 ${cardBg}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${PLANS[selected].color} flex items-center justify-center`}>
                  {React.createElement(PLANS[selected].icon, { className: 'w-5 h-5 text-white' })}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{selected}</h2>
                  <p className={`text-sm ${muted}`}>{PLANS[selected].description}</p>
                </div>
              </div>

              {/* Billing toggle */}
              <div className={`flex rounded-xl p-1 mb-6 ${isLight ? 'bg-gray-200' : 'bg-[#2a2a2a]'}`}>
                {['monthly', 'yearly'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      billing === b ? 'bg-white text-gray-900 shadow' : muted
                    }`}
                  >
                    {b === 'monthly' ? 'Monthly' : 'Yearly'}
                    {b === 'yearly' && <span className="ml-1 text-xs text-green-400">Save 27%</span>}
                  </button>
                ))}
              </div>

              {/* Price */}
              <div className="mb-6">
                {(() => {
                  const base = PLANS[selected].monthlyPrice;
                  const yearlyTotal = base * 12 * (1 - YEARLY_DISCOUNT);
                  const finalPrice = getFinalPrice(base, billing);
                  const originalPrice = billing === 'yearly' ? base * 12 : base;
                  return (
                    <div>
                      <div className="flex items-baseline gap-2">
                        {(promoActive || billing === 'yearly') && (
                          <span className={`text-lg line-through ${muted}`}>${originalPrice.toFixed(2)}</span>
                        )}
                        <span className="text-5xl font-bold">${finalPrice.toFixed(2)}</span>
                        <span className={muted}>{billing === 'yearly' ? '/year' : '/month'}</span>
                      </div>
                      {billing === 'yearly' && (
                        <p className={`text-sm mt-1 ${muted}`}>≈ ${(finalPrice / 12).toFixed(2)}/month</p>
                      )}
                    </div>
                  );
                })()}
                {promoActive && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs rounded-full px-3 py-1">
                    🎉 30% welcome discount applied
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2.5 mb-6">
                {PLANS[selected].features.map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
                {PLANS[selected].notIncluded.map(f => (
                  <div key={f} className={`flex items-start gap-2 text-sm ${muted} line-through`}>
                    <X className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button className={`w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r ${PLANS[selected].color} hover:opacity-90 transition-opacity text-lg`}>
                Subscribe — ${getFinalPrice(PLANS[selected].monthlyPrice, billing).toFixed(2)}{billing === 'yearly' ? '/yr' : '/mo'}
              </button>
              <p className={`text-xs text-center mt-3 ${muted}`}>Cancel anytime. No hidden fees.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}