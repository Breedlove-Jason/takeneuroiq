import Hero from "../components/Hero"
import HowItWorks from "../components/HowItWorks"
import FeatureHighlights from "../components/FeatureHighlights"

function Home({ theme }) {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <FeatureHighlights />
    </main>
  )
}

export default Home
