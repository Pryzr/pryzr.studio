import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Pryzr Studio — Launch Your Social Casino Brand",
  description:
    "Launch a branded social casino in 4–6 weeks with Pryzr Studio: technology, games, compliance guidance, payments, and operational support.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Script id="reddit-pixel" strategy="beforeInteractive">
          {`
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js";t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
            rdt("init","a2_ipmxh3ti5t5m");
            rdt("track","PageVisit");
          `}
        </Script>
      </body>
    </html>
  );
}
