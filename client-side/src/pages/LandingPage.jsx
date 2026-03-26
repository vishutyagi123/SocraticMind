import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import ProblemSection from '../components/landing/ProblemSection'
import SolutionSection from '../components/landing/SolutionSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import StepFlowSection from '../components/landing/StepFlowSection'
import SocialProofSection from '../components/landing/SocialProofSection'
import AudienceSection from '../components/landing/AudienceSection'
import FooterCTA from '../components/landing/FooterCTA'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <StepFlowSection />
      <SocialProofSection />
      <AudienceSection />
      <FooterCTA />
    </div>
  )
}
