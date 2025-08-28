'use client';

import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <main className="pt-32 pb-20">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">
              Join a Game
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Enter a room code to join your friends' storytelling adventure
            </p>
          </div>

          <Card variant="glass" className="p-12 max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="roomCode" className="block text-sm font-medium text-gray-300 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  id="roomCode"
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={6}
                />
              </div>
              
              <Button className="w-full" size="lg">
                Join Game
              </Button>
              
              <div className="text-center">
                <span className="text-gray-400 text-sm">Don't have a code? </span>
                <Link href="/multiplayer" className="text-purple-400 hover:text-purple-300 text-sm">
                  Create a room
                </Link>
              </div>
            </div>
          </Card>

          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}