import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t py-6">
      <div className="container mx-auto px-6">
        <div className="text-muted-foreground flex justify-center space-x-6 text-sm">
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="https://github.com/Juhnk/type"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
