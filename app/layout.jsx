import './globals.css';

export const metadata = {
  title: 'Blare: Homebase',
  description: 'Personal website for Blare',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}