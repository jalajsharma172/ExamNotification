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
        <Link href="/frontend/history" className={`nav-link ${pathname === '/frontend/history' ? 'nav-active' : ''}`}>
          History Logs
        </Link>
        <Link href="/frontend/api-keys" className={`nav-link ${pathname === '/frontend/api-keys' ? 'nav-active' : ''}`}>
          API Keys
        </Link>
      </div>
    </nav>
  );
}
