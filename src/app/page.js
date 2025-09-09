import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FeatureCard from '../components/game/FeatureCard';
import MovieSection from '../components/game/MovieSection';
import PacmanCursor from '../components/ui/PacmanCursor';
import { getFeaturedMovies } from '../lib/movies';

const features = [
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Multiplayer Collaboration',
    description: 'Team up with up to 4 friends to reshape movie storylines together in real-time.'
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI-Powered Stories',
    description: 'Advanced AI generates unique story segments and visuals based on your choices.'
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
      </svg>
    ),
    title: 'Character Perspectives',
    description: 'Play from different character viewpoints and influence the story from their unique perspective.'
  },
  {
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Real-time Sync',
    description: 'Experience seamless real-time synchronization with other players for smooth gameplay.'
  }
];

export default async function Home() {
  const featuredMovies = await getFeaturedMovies();
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gaming Cursor */}
      <PacmanCursor />
      
      {/* Cartoonish Background with Design Assets */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Floating Design Assets */}
        <div className="absolute top-20 left-16 w-20 h-20 animate-float">
          <img src="/images/designAssets/Group 14.png" alt="Game Element" className="w-full h-full object-contain opacity-40" />
        </div>
        <div className="absolute top-32 right-20 w-24 h-24 animate-float delay-1">
          <img src="/images/designAssets/Group 15.png" alt="Game Element" className="w-full h-full object-contain opacity-35" />
        </div>
        <div className="absolute bottom-32 left-20 w-28 h-28 animate-float delay-2">
          <img src="/images/designAssets/Group 16.png" alt="Game Element" className="w-full h-full object-contain opacity-40" />
        </div>
        <div className="absolute bottom-20 right-16 w-22 h-22 animate-wobble">
          <img src="/images/designAssets/Group 17.png" alt="Game Element" className="w-full h-full object-contain opacity-30" />
        </div>
        <div className="absolute top-60 left-1/3 w-16 h-16 animate-bounce-soft">
          <img src="/images/designAssets/Group 18.png" alt="Game Element" className="w-full h-full object-contain opacity-35" />
        </div>
        <div className="absolute bottom-60 right-1/3 w-20 h-20 animate-float delay-3">
          <img src="/images/designAssets/Group 19.png" alt="Game Element" className="w-full h-full object-contain opacity-30" />
        </div>
        
        {/* Geometric shapes */}
        <div className="absolute top-40 right-1/2 w-12 h-12 bg-pink-400/30 rounded-2xl transform rotate-45 animate-wobble"></div>
        <div className="absolute bottom-40 left-1/2 w-8 h-8 bg-blue-400/40 rounded-full animate-pulse-glow"></div>
        <div className="absolute top-1/2 left-16 w-6 h-6 bg-purple-400/50 rounded-full animate-sparkle"></div>
      </div>

      <Header />

      <main className="relative pt-24 z-10">
        {/* Hero Section - Gaming Style */}
        <section className="py-16 sm:py-20">
          <Container>
            <div className="text-center max-w-5xl mx-auto">
              {/* Gaming Title with ByteBounce Font */}
              <div className="mb-8">
                <h1 className="mb-6">
                  <span 
                    className="block text-5xl sm:text-6xl lg:text-7xl text-purple-900 leading-tight"
                    style={{ fontFamily: 'ByteBounce, monospace' }}
                  >
                    UNSCRIPTED
                  </span>
                  <span 
                    className="block text-2xl sm:text-3xl lg:text-4xl text-purple-600 mt-4 animate-pulse"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                  >
                    Cinema Adventures
                  </span>
                </h1>
              </div>
              
              {/* Simplified description with cartoonish feel */}
              <p 
                className="text-lg sm:text-xl text-purple-800 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                🎬 Transform movies into interactive games! Choose your character, make decisions, and create amazing new stories with friends! 🎮✨
              </p>
              
              {/* Fun Game-style CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <Link href="/quiz-game">
                  <Button size="xl" variant="primary" className="w-full sm:w-auto animate-pulse-glow">
                    🚀 START ADVENTURE
                  </Button>
                </Link>
                <Link href="/single-player">
                  <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                    🎯 SOLO MISSION
                  </Button>
                </Link>
              </div>

              {/* Join game with fun styling */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-6 bg-white/70 rounded-3xl border-3 border-pink-300 inline-block">
                <span className="text-purple-800 font-bold text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  🎪 Got a game code?
                </span>
                <Link href="/join">
                  <Button variant="outline" size="md" className="animate-bounce-soft">
                    JOIN THE FUN! 🎉
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section - Cartoonish Style */}
        <section id="features" className="py-20 relative">
          {/* Floating design elements for this section */}
          <div className="absolute top-10 left-10 w-16 h-16 animate-float">
            <img src="/images/designAssets/Group 20.png" alt="Decoration" className="w-full h-full object-contain opacity-30" />
          </div>
          <div className="absolute top-20 right-10 w-12 h-12 animate-wobble">
            <img src="/images/designAssets/Group 21.png" alt="Decoration" className="w-full h-full object-contain opacity-25" />
          </div>
          
          <Container>
            <div className="text-center mb-16">
              <h2 
                className="text-4xl sm:text-5xl font-bold text-purple-900 mb-6"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                🌟 Why Choose Unscripted? 🌟
              </h2>
              <p 
                className="text-xl text-purple-700 max-w-3xl mx-auto"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Discover what makes our interactive cinema experience absolutely amazing!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </Container>
        </section>

        {/* How It Works Section - Gaming Style */}
        <section id="how-it-works" className="py-20 relative">
          {/* More floating elements */}
          <div className="absolute bottom-10 left-1/4 w-14 h-14 animate-bounce-soft">
            <img src="/images/designAssets/Group 22.png" alt="Decoration" className="w-full h-full object-contain opacity-35" />
          </div>
          
          <Container>
            <div className="text-center mb-16">
              <h2 
                className="text-4xl sm:text-5xl font-bold text-purple-900 mb-6"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                🎮 How It Works 🎮
              </h2>
              <p 
                className="text-xl text-purple-700 max-w-3xl mx-auto"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Get started in just a few super easy steps!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '1️⃣',
                  title: 'Pick Your Movie',
                  description: 'Choose from our awesome collection of movies and start or join a game room!'
                },
                {
                  step: '2️⃣',
                  title: 'Be The Character',
                  description: 'Select which character you want to play as and make their decisions!'
                },
                {
                  step: '3️⃣',
                  title: 'Create Magic',
                  description: 'Make choices and watch AI create amazing new storylines based on what you decide!'
                }
              ].map((step, index) => (
                <Card key={index} variant="gaming" className="p-8 text-center group">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-4xl animate-bounce-soft">
                    {step.step}
                  </div>
                  <h3 
                    className="text-2xl font-bold text-purple-900 mb-4"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  <p 
                    className="text-purple-700 leading-relaxed"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Featured Movies Section - Cinema Style */}
        <section id="movies" className="py-20 relative">
          <div className="absolute top-1/2 right-10 w-18 h-18 animate-float delay-2">
            <img src="/images/designAssets/Vector.png" alt="Decoration" className="w-full h-full object-contain opacity-30" />
          </div>
          
          <Container>
            <div className="text-center mb-16">
              <h2 
                className="text-4xl sm:text-5xl font-bold text-purple-900 mb-6"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                🎬 Featured Movies 🎬
              </h2>
              <p 
                className="text-xl text-purple-700 max-w-3xl mx-auto"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Start your epic adventure with these popular movies!
              </p>
            </div>

            <MovieSection movies={featuredMovies} />

            <div className="text-center mt-12">
              <Link href="/movies">
                <Button variant="secondary" size="lg" className="animate-pulse-glow">
                  🎭 EXPLORE ALL MOVIES
                </Button>
              </Link>
            </div>
          </Container>
        </section>

        {/* CTA Section - Final Call to Action */}
        <section className="py-20 relative">
          {/* Final decorative elements */}
          <div className="absolute top-10 left-1/3 w-16 h-16 animate-sparkle">
            <img src="/images/designAssets/Clip path group.png" alt="Sparkle" className="w-full h-full object-contain opacity-40" />
          </div>
          <div className="absolute bottom-10 right-1/4 w-14 h-14 animate-wobble">
            <img src="/images/designAssets/Clip path group-1.png" alt="Decoration" className="w-full h-full object-contain opacity-35" />
          </div>
          
          <Container>
            <Card variant="cinema" className="p-12 text-center relative overflow-hidden">
              {/* Background decorations inside the card */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
              <div className="absolute top-4 right-4 w-6 h-6 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-4 left-1/2 w-4 h-4 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              
              <h2 
                className="text-3xl sm:text-4xl font-bold text-purple-900 mb-6"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              >
                🎉 Ready to Create Movie Magic? 🎉
              </h2>
              <p 
                className="text-xl text-purple-800 mb-8 max-w-2xl mx-auto leading-relaxed"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Join thousands of storytellers creating incredible movie experiences every day! The adventure awaits! ✨
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/quiz-game">
                  <Button size="lg" variant="primary" className="w-full sm:w-auto animate-bounce-soft">
                    🚀 START PLAYING NOW
                  </Button>
                </Link>
                <Link href="/join">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    🎪 JOIN A GAME
                  </Button>
                </Link>
              </div>
            </Card>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}