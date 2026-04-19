import "../styles/globals.css";

export const metadata = {
  title: "AI Todo — Smart Task Manager",
  description:
    "A minimal, AI-assisted todo app with Google authentication. Break down tasks, get title suggestions, and stay productive.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
