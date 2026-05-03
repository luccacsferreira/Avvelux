import React, { useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { Shield, Lock, FileText, Scale } from 'lucide-react';

export default function Policies() {
  const { isLight } = useTheme();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const textCls = isLight ? 'text-black' : 'text-white';
  const mutedCls = isLight ? 'text-gray-600' : 'text-gray-400';
  const sectionCls = `p-8 rounded-2xl border mb-8 ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h1 className={`text-4xl font-black mb-4 ${textCls}`}>Platform Policies</h1>
        <p className={`text-lg ${mutedCls}`}>Transparency, safety, and community guidelines for Avvelux.</p>
      </div>

      <div className={sectionCls}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className={`text-2xl font-bold ${textCls}`}>Community Guidelines</h2>
        </div>
        <div className={`space-y-4 ${mutedCls} leading-relaxed`}>
          <p>Avvelux is a home for creativity and learning. We have zero tolerance for certain types of content:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>No Explicit Content:</strong> Pornography or sexually explicit material is strictly prohibited.</li>
            <li><strong>No Hate Speech:</strong> We do not allow content that promotes violence or incites hatred based on race, religion, gender, or orientation.</li>
            <li><strong>Respect Intellectual Property:</strong> Only upload content you own or have permission to use.</li>
            <li><strong>Safety First:</strong> Harassment and bullying are not tolerated.</li>
          </ul>
        </div>
      </div>

      <div className={sectionCls}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <Lock className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className={`text-2xl font-bold ${textCls}`}>Privacy Policy</h2>
        </div>
        <div className={`space-y-4 ${mutedCls} leading-relaxed`}>
          <p>Your privacy is paramount. We only collect data necessary to provide and improve your experience:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We do not sell your personal information to third parties.</li>
            <li>You have full control over your content's privacy settings (Public, Private, Unlisted).</li>
            <li>We use secure encryption for all sensitive data transfers.</li>
          </ul>
        </div>
      </div>

      <div className={sectionCls}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Scale className="w-6 h-6 text-green-400" />
          </div>
          <h2 className={`text-2xl font-bold ${textCls}`}>Terms of Service</h2>
        </div>
        <div className={`space-y-4 ${mutedCls} leading-relaxed`}>
          <p>By using Avvelux, you agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Be at least 13 years of age.</li>
            <li>Provide accurate information during account registration.</li>
            <li>Be responsible for any activity that occurs under your account.</li>
            <li>Abide by the AI-powered moderation system decisions.</li>
          </ul>
        </div>
      </div>

      <div className={sectionCls}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-yellow-400" />
          </div>
          <h2 className={`text-2xl font-bold ${textCls}`}>AI Safety Disclosure</h2>
        </div>
        <div className={`space-y-4 ${mutedCls} leading-relaxed`}>
          <p>We use Gemini AI models to assist with content moderation and user assistance:</p>
          <p>Our AI analyzes uploads to prevent harmful content. While highly accurate, we maintain a human-in-the-loop review process for disputed moderation decisions.</p>
        </div>
      </div>

      <div className="text-center py-12 border-t border-gray-800">
        <p className={mutedCls}>Last Updated: April 2026</p>
        <p className={`mt-2 ${mutedCls}`}>Questions? Contact us at legal@avvelux.com</p>
      </div>
    </div>
  );
}
