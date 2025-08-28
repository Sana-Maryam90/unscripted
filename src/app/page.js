import Link from 'next/link';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import FeatureCard from '../components/game/FeatureCard';
import MovieSection from '../components/game/MovieSection';

// Sample movie data for the landing page
const featuredMovies = [
  {
    id: 'harry-potter-1',
    title: 'Harry Potter and the Philosopher\'s Stone',
    description: 'Join Harry on his magical journey to Hogwarts and discover alternate paths in the wizarding world.',
    characters: [
      { id: 'harry', name: 'Harry Potter' },
      { id: 'hermione', name: 'Hermione Granger' },
      { id: 'ron', name: 'Ron Weasley' }
    ]
  },
  {
    id: 'star-wars-4',
    title: 'Star Wars: A New Hope',
    description: 'Experience the galaxy far, far away and reshape the destiny of the Rebel Alliance.',
    characters: [
      { id: 'luke', name: 'Luke Skywalker' },
      { id: 'leia', name: 'Princess Leia' },
      { id: 'han', name: 'Han Solo' }
    ]
  },
  {
    id: 'lord-of-the-rings-1',
    title: 'The Lord of the Rings: The Fellowship',
    description: 'Guide the Fellowship through Middle-earth and create new paths to destroy the One Ring.',
    characters: [
      { id: 'frodo', name: 'Frodo Baggins' },
      { id: 'gandalf', name: 'Gandalf' },
      { id: 'aragorn', name: 'Aragorn' }
    ]
  }
];

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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Header />

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="py-20 sm:py-32">
          <Container>
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
                Rewrite Your Favorite
                <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Movie Stories
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Transform passive movie watching into interactive storytelling adventures. 
                Collaborate with friends to create alternate storylines using AI-powered narrative generation.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Link href="/multiplayer">
                  <Button size="xl" className="w-full sm:w-auto">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Create Multiplayer Room
                  </Button>
                </Link>
                <Link href="/single-player">
                  <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Play Solo
                  </Button>
                </Link>
              </div>

              {/* Join Game */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <span className="text-gray-400">Already have a room code?</span>
                <Link href="/join">
                  <Button variant="ghost" className="text-purple-400 hover:text-white">
                    Join Game →
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                Why Choose Unscripted?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Experience cinema like never before with our innovative storytelling platform
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

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Get started in just a few simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Choose Your Movie',
                  description: 'Select from our collection of popular movies and create or join a game room.'
                },
                {
                  step: '02',
                  title: 'Pick Your Character',
                  description: 'Choose which character perspective you want to play from and influence their decisions.'
                },
                {
                  step: '03',
                  title: 'Shape the Story',
                  description: 'Make choices at key moments and watch AI generate unique storylines based on your decisions.'
                }
              ].map((step, index) => (
                <Card key={index} variant="glass" className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Featured Movies Section */}
        <section id="movies" className="py-20">
          <Container>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
                Featured Movies
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Start your storytelling adventure with these popular movies
              </p>
            </div>

            <MovieSection movies={featuredMovies} />

            <div className="text-center mt-12">
              <Button variant="secondary" size="lg">
                View All Movies
              </Button>
            </div>
          </Container>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <Container>
            <Card variant="gradient" className="p-12 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Ready to Rewrite Cinema History?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of storytellers creating unique movie experiences every day.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/multiplayer">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Playing Now
                  </Button>
                </Link>
                <Link href="/join">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Join a Game
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