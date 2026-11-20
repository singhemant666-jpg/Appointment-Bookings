import { Bricolage_Grotesque, DM_Sans } from 'next/font/google';
import Navbar from '@/components/Navbar';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display' });
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'ClinicSlot - Doctor appointment book karein',
  description: 'Doctor ke timing dekho aur slot book karo.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Navbar />
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
