import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-background border-t py-6">
      <div className="container mx-auto px-6">
        <div className="text-muted-foreground text-body-sm flex justify-center gap-6">
          <Link href="/about" className="hover:text-foreground transition-base">
            About
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-base"
          >
            Privacy
          </Link>
          <Link
            href="https://github.com/Juhnk/type"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-base"
          >
            GitHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
