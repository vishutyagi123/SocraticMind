import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/dashboard/Sidebar';
import StatsCards from '../components/dashboard/StatsCards';
import RadarFingerprint from '../components/dashboard/RadarFingerprint';
import { jdCoverage, interviewHistory, learningProgress } from '../data/mockData';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, always visible on lg */}
      <div className={`lg:block ${sidebarOpen ? 'block' : 'hidden'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-text-muted hover:text-text-primary"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-text-primary">
                Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || 'there'}</span>
              </h1>
              <p className="text-xs text-text-dim mt-0.5">Here's your cognitive growth overview</p>
            </div>
          </div>

          <button className="px-5 py-2.5 bg-violet hover:bg-violet-light text-white text-sm font-semibold rounded-xl transition-all duration-200 glow-violet hover:scale-105 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Interview
          </button>
        </header>

        <div className="p-6 space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <StatsCards />

              <div className="grid lg:grid-cols-2 gap-6">
                <RadarFingerprint />

                {/* JD Coverage */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">JD Coverage Map</h3>
                  <p className="text-xs text-text-dim mb-6">Last interview: SDE Intern - Google</p>

                  <div className="space-y-4">
                    {jdCoverage.map((item) => (
                      <div key={item.topic}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-text-muted">{item.topic}</span>
                          <span className="text-xs font-semibold text-text-primary">{item.covered}%</span>
                        </div>
                        <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${item.covered}%`,
                              background: item.covered >= 75
                                ? 'linear-gradient(90deg, #7C3AED, #8B5CF6)'
                                : item.covered >= 50
                                ? 'linear-gradient(90deg, #06B6D4, #22D3EE)'
                                : 'linear-gradient(90deg, #EF4444, #F87171)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Interviews */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-1">Recent Interviews</h3>
                <p className="text-xs text-text-dim mb-6">Your last 3 interview sessions</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-text-dim text-xs uppercase tracking-wider border-b border-border">
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Role</th>
                        <th className="pb-3 pr-4">Duration</th>
                        <th className="pb-3 pr-4">Score</th>
                        <th className="pb-3 pr-4">Weak Spots</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {interviewHistory.map((interview) => (
                        <tr key={interview.id} className="hover:bg-bg-card transition-colors">
                          <td className="py-4 pr-4 text-text-muted whitespace-nowrap">{interview.date}</td>
                          <td className="py-4 pr-4 text-text-primary font-medium">{interview.role}</td>
                          <td className="py-4 pr-4 text-text-muted">{interview.duration}</td>
                          <td className="py-4 pr-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              interview.overallScore >= 70
                                ? 'bg-violet/15 text-violet-light'
                                : interview.overallScore >= 55
                                ? 'bg-cyan/15 text-cyan-light'
                                : 'bg-red-500/15 text-red-400'
                            }`}>
                              {interview.overallScore}%
                            </span>
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex flex-wrap gap-1.5">
                              {interview.weakSpots.map((spot) => (
                                <span key={spot} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-card text-text-dim border border-border">
                                  {spot}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Interviews Tab */}
          {activeTab === 'interviews' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-card p-8 text-center">
                <div className="text-5xl mb-4">🎤</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Interview Sessions</h3>
                <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
                  Start a new AI-powered interview or review your past sessions. Each session builds on your Reasoning Fingerprint.
                </p>
                <button className="px-8 py-3 bg-violet hover:bg-violet-light text-white font-semibold rounded-xl transition-all duration-200 glow-violet hover:scale-105">
                  Start New Interview
                </button>
              </div>

              {interviewHistory.map((interview) => (
                <div key={interview.id} className="glass-card p-6 hover:glass-card-hover transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-text-primary">{interview.role}</h4>
                      <p className="text-xs text-text-dim mt-1">{interview.date} · {interview.duration}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      interview.overallScore >= 70
                        ? 'bg-violet/15 text-violet-light'
                        : 'bg-cyan/15 text-cyan-light'
                    }`}>
                      {interview.overallScore}%
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {interview.topicsAsked.map((t) => (
                      <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-violet/10 text-violet-light border border-violet/20">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {interview.weakSpots.map((s) => (
                      <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        ⚠ {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Learning Tab */}
          {activeTab === 'learning' && (
            <div className="space-y-6 animate-fade-in">
              <div className="glass-card p-8 text-center">
                <div className="text-5xl mb-4">🧠</div>
                <h3 className="text-xl font-bold text-text-primary mb-2">SocraticMind Learning</h3>
                <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
                  Track your progress across topics. SocraticMind teaches through questions — never gives answers directly.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {learningProgress.map((item) => (
                  <div key={item.id} className="glass-card p-6 hover:glass-card-hover transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-text-primary">{item.topic}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.status === 'mastered'
                          ? 'bg-green-500/15 text-green-400'
                          : item.status === 'in_progress'
                          ? 'bg-cyan/15 text-cyan-light'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {item.status === 'mastered' ? '✓ Mastered' : item.status === 'in_progress' ? '⟳ In Progress' : '⚠ Needs Work'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-dim mb-3">
                      <span>{item.sessions} sessions</span>
                      <span>Last: {item.lastSession}</span>
                    </div>

                    <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${item.masteryLevel}%`,
                          background: item.masteryLevel >= 70
                            ? 'linear-gradient(90deg, #10B981, #34D399)'
                            : item.masteryLevel >= 40
                            ? 'linear-gradient(90deg, #06B6D4, #22D3EE)'
                            : 'linear-gradient(90deg, #EF4444, #F87171)',
                        }}
                      />
                    </div>
                    <p className="text-right text-xs text-text-dim mt-1">{item.masteryLevel}% mastery</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="glass-card p-8 text-center">
                {user?.picture ? (
                  <img src={user.picture} alt="" className="w-20 h-20 rounded-full ring-4 ring-violet/30 mx-auto mb-4" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-violet/20 flex items-center justify-center text-3xl font-bold text-violet-light mx-auto mb-4">
                    {user?.name?.[0] || '?'}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-text-primary">{user?.name || 'User'}</h3>
                <p className="text-sm text-text-dim mt-1">{user?.email || ''}</p>

                <div className="mt-6 flex justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gradient">12</p>
                    <p className="text-xs text-text-dim mt-1">Interviews</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gradient">68%</p>
                    <p className="text-xs text-text-dim mt-1">Avg Score</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gradient">5</p>
                    <p className="text-xs text-text-dim mt-1">Day Streak</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h4 className="font-semibold text-text-primary mb-4">Account Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm text-text-primary">Email notifications</p>
                      <p className="text-xs text-text-dim">Get weekly progress reports</p>
                    </div>
                    <div className="w-10 h-6 bg-violet/30 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-violet rounded-full absolute top-1 right-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <p className="text-sm text-text-primary">Dark mode</p>
                      <p className="text-xs text-text-dim">Always on (it's who we are)</p>
                    </div>
                    <div className="w-10 h-6 bg-violet/30 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-violet rounded-full absolute top-1 right-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
