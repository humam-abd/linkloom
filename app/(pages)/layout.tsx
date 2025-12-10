import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { Providers } from "@/providers";

export const metadata = {
  title: "LinkLoom - Curate & Share",
  description:
    "A beautiful tool to curate and share collections of links with images.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Using Tailwind CDN for quick migration compatibility. 
            In a production app, use standard PostCSS setup. */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    brand: {
                      50: '#f0f9ff',
                      100: '#e0f2fe',
                      500: '#0ea5e9',
                      600: '#0284c7',
                      900: '#0c4a6e',
                    }
                  },
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                  },
                },
              },
            }
          `,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-brand-100 selection:text-brand-900 font-sans">
        <Providers>
          <AuthProvider>
            <div className="min-h-screen">
              <Navbar />
              {children}
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
