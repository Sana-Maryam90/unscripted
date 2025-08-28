import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function MultiplayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <main className="pt-32 pb-20">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Multiplayer Mode
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Create a room and invite friends to collaborate on epic storytelling adventures
            </p>
          </div>

          <Card variant="glass" className="p-12 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Create Your Room
            </h2>
            <p className="text-gray-300 mb-8">
              Multiplayer functionality is currently being implemented. Check back soon for collaborative storytelling!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join">
                <Button size="lg" className="w-full sm:w-auto">
                  Join Existing Room
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