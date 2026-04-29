import { Orbitron, Rajdhani, Share_Tech_Mono } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
});

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400'],
});

export const metadata = {
  title: 'Decode The Tech — Quiz Platform',
  description: 'Crack the code behind everyday technology. The ultimate tech quiz experience.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable} font-body bg-dark-900 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
