import { useState } from 'react';
import PersonalInfo from '../components/profile/PersonalInfo';
import Education from '../components/profile/Education';
import Experience from '../components/profile/Experience';
import Skills from '../components/profile/Skills';
import Documents from '../components/profile/Documents';
import Preferences from '../components/profile/Preferences';
import './ProfileLayout.css';

const sections = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'skills', label: 'Skills', icon: '⚡' },
  { id: 'documents', label: 'Documents', icon: '📄' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' }
];

const ProfileLayout = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'personal': return <PersonalInfo />;
      case 'education': return <Education />;
      case 'experience': return <Experience />;
      case 'skills': return <Skills />;
      case 'documents': return <Documents />;
      case 'preferences': return <Preferences />;
      default: return <PersonalInfo />;
    }
  };

  return (
    <div className="profile-layout">
      <aside className={`profile-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h3>Profile</h3>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{section.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
      <main className="profile-content">
        <div className="content-header">
          <h2>{sections.find(s => s.id === activeSection)?.label}</h2>
        </div>
        <div className="content-body">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default ProfileLayout;
