import { useState } from 'react'
import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import ProblemSection from '../components/landing/ProblemSection'
import SolutionSection from '../components/landing/SolutionSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import StepFlowSection from '../components/landing/StepFlowSection'
import SocialProofSection from '../components/landing/SocialProofSection'
import AudienceSection from '../components/landing/AudienceSection'
import FooterCTA from '../components/landing/FooterCTA'
import AuthModal from '../components/auth/AuthModal'

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const openAuth = (mode = 'login') => {
    setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar onOpenAuth={() => openAuth('login')} />
      <HeroSection onOpenAuth={() => openAuth('signup')} />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <StepFlowSection />
      <SocialProofSection />
      <AudienceSection />
      <FooterCTA />
      
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          defaultMode={authMode} 
        />
      )}
    </div>
  )
}
