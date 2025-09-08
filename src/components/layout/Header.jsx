import Link from 'next/link';
import Container from '../ui/Container';
import Button from '../ui/Button';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-darker/20 backdrop-blur-md border-b border-cream/10">
      <Container>
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <svg className="w-6 h-6 text-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-cream font-display">Unscripted</h1>
              <p className="text-xs text-cream/70 -mt-1">Cinema Storytelling</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-cream/70 hover:text-cream transition-colors duration-200">
              Features
            </Link>
            <Link href="#how-it-works" className="text-cream/70 hover:text-cream transition-colors duration-200">
              How It Works
            </Link>
            <Link href="/movies" className="text-cream/70 hover:text-cream transition-colors duration-200">
              Movies
            </Link>
            <Link href="/test-chat" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
              Test Chat
            </Link>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Button size="sm" className="hidden sm:inline-flex modern-button">
              Get Started
            </Button>
            <Button size="sm" className="sm:hidden modern-button">
              Play
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;