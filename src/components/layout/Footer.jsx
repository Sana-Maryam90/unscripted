import Link from 'next/link';
import Container from '../ui/Container';

const Footer = () => {
  return (
    <footer className="bg-slate-darker/30 backdrop-blur-md border-t border-cream/10 mt-20">
      <Container>
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-400 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-cream font-display">Unscripted</span>
              </div>
              <p className="text-cream/70 text-sm max-w-md">
                Transform your favorite movies into interactive storytelling experiences. 
                Create alternate storylines with friends through AI-powered collaborative gameplay.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-cream font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-cream/70 hover:text-cream text-sm transition-colors duration-200">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-cream/70 hover:text-cream text-sm transition-colors duration-200">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/movies" className="text-cream/70 hover:text-cream text-sm transition-colors duration-200">
                    Available Movies
                  </Link>
                </li>
              </ul>
            </div>

            {/* Game Modes */}
            <div>
              <h3 className="text-cream font-semibold mb-4">Game Modes</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/single-player" className="text-cream/70 hover:text-cream text-sm transition-colors duration-200">
                    Single Player
                  </Link>
                </li>
                <li>
                  <Link href="/quiz-game" className="text-cream/70 hover:text-cream text-sm transition-colors duration-200">
                    Quiz Game
                  </Link>
                </li>
                <li>
                  <Link href="/join" className="text-cream/70 hover:text-cream text-sm transition-colors duration-200">
                    Join Game
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-cream/10 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-cream/50 text-sm">
              © 2024 Unscripted. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link href="/privacy" className="text-cream/50 hover:text-cream text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-cream/50 hover:text-cream text-sm transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;