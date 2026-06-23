import "./globals.css";

export const metadata = {
  title: "Exam Intelligence",
  description: "Track government and bank IT recruitment exam notifications powered by AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
