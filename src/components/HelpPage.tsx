import { useState } from 'react';
import { Mail, MessageSquare, BookOpen, Search, ChevronDown, ChevronUp, Send } from 'lucide-react';

const faqs = [
  {
    question: 'How do I create a post?',
    answer: 'Click the "What\'s on your mind?" box at the top of your feed. You can add text, images, videos, or links. Then click "Post" to share with the community.'
  },
  {
    question: 'How do I edit my profile?',
    answer: 'Click your profile picture in the top right corner, then select "Edit profile" from the dropdown menu. You can update your name, email, profile photo, and password.'
  },
  {
    question: 'How do I report inappropriate content?',
    answer: 'Click the three-dot menu (⋯) on any post or comment, then select "Report". Choose a reason and add details. Our moderation team will review it.'
  },
  {
    question: 'How do I change my notification settings?',
    answer: 'Go to Preferences from your profile menu. Under "Notifications", you can toggle email notifications, push notifications, and weekly digest emails.'
  },
  {
    question: 'Can I delete my account?',
    answer: 'Yes, go to Preferences > Privacy & Security, then click "Delete Account". This action is irreversible and will permanently remove all your data.'
  },
  {
    question: 'How do I invite friends?',
    answer: 'Click the "Invite" button in the top bar. You can send invitations via email or WhatsApp.'
  },
];

export function HelpPage({ onClose }: { onClose: () => void }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thanks for reaching out! We\'ll get back to you soon.');
    setContactForm({ subject: '', message: '', email: '' });
  };

  return (
    <div className="page-container">
      <div className="help-page">
        <div className="page-header">
          <h1>Help & Support</h1>
          <button className="outline-button" onClick={onClose}>Close</button>
        </div>

        <div className="help-content">
          <div className="help-sidebar">
            <div className="help-search">
              <Search size={18} />
              <input type="text" placeholder="Search help articles..." />
            </div>

            <div className="help-categories">
              <h3>Browse by Category</h3>
              <ul>
                <li className="active"><MessageSquare size={16} /> Getting Started</li>
                <li><BookOpen size={16} /> Account & Profile</li>
                <li><Bell size={16} /> Notifications</li>
                <li><Shield size={16} /> Privacy & Safety</li>
                <li><Palette size={16} /> Customization</li>
              </ul>
            </div>

            <div className="help-contact-quick">
              <h3>Still need help?</h3>
              <p>Contact our support team directly.</p>
              <a href="mailto:support@kommunity.app" className="contact-link">
                <Mail size={16} /> support@kommunity.app
              </a>
            </div>
          </div>

          <div className="help-main">
            <div className="help-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className={`faq-item ${expandedIndex === index ? 'open' : ''}`}
                    onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  >
                    <summary className="faq-question">
                      <span>{faq.question}</span>
                      <span className={`faq-chevron ${expandedIndex === index ? 'open' : ''}`}>
                        {expandedIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </summary>
                    <div className="faq-answer">{faq.answer}</div>
                  </details>
                ))}
              </div>
            </div>

            <div className="help-section">
              <h2>Contact Support</h2>
              <p className="help-intro">Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.</p>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-field">
                  <label htmlFor="contact-email">Your Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contact-subject">Subject</label>
                  <select
                    id="contact-subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="privacy">Privacy & Security</option>
                    <option value="feedback">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Describe your issue or question..."
                    rows={5}
                    required
                  />
                </div>
                <button type="submit" className="primary-button"><Send size={16} /> Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Shield({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function Palette({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="18.5" cy="11.5" r="2.5" />
      <circle cx="8.5" cy="11.5" r="2.5" />
      <circle cx="13.5" cy="16.5" r="2.5" />
      <path d="M13.5 2c-3.14 0-5.68 1.79-7.07 4.35" />
      <path d="M13.5 2c3.14 0 5.68 1.79 7.07 4.35" />
      <path d="M13.5 22c-3.14 0-5.68-1.79-7.07-4.35" />
      <path d="M13.5 22c3.14 0 5.68-1.79 7.07-4.35" />
    </svg>
  );
}

function Bell({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}