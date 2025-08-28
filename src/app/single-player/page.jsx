import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function SinglePlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <main className="pt-32 pb-20">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Single Player Mode
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Embark on a solo storytelling adventure and reshape your favorite movies
            </p>
          </div>

          <Card variant="glass" className="p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Coming Soon!
            </h2>
            <p className="text-gray-300 mb-8">
              Single player mode is currently in development. Experience the full power of collaborative storytelling in multiplayer mode.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/multiplayer">
                <Button size="lg" className="w-full sm:w-auto">
                  Try Multiplayer Instead
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        </Container>
      </main>

      <Footer />
    </div>
  );
}