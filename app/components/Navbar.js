"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">
        Exam Intelligence
      </Link>
      <div className="nav-links">
        <Link href="/" className={`nav-link ${pathname === '/' ? 'nav-active' : ''}`}>
          Dashboard
        </Link>
        <Link href="/history" className={`nav-link ${pathname === '/history' ? 'nav-active' : ''}`}>
          History Logs
        </Link>
        <Link href="/api-keys" className={`nav-link ${pathname === '/api-keys' ? 'nav-active' : ''}`}>
          API Keys
        </Link>
      </div>
    </nav>
  );
}
