import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project ClearRiver",
  description: "Bio-char Adsorption & IoT Compliance Monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Add suppressHydrationWarning here to ignore browser extension injections */}
      <body 
        className="bg-zinc-950 text-zinc-100 antialiased overflow-x-hidden"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}