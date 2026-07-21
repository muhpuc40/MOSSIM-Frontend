import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "@/styles/styles.scss";
import GlobalProvider from "./GlobalProvider";
import ModalCart from "@/components/Modal/ModalCart";
import ModalWishlist from "@/components/Modal/ModalWishlist";
import ModalSearch from "@/components/Modal/ModalSearch";
import ModalQuickview from "@/components/Modal/ModalQuickview";
import ModalCompare from "@/components/Modal/ModalCompare";
import { Suspense } from "react";
import MetaPixel from "@/components/Analytics/MetaPixel";

const instrument = Instrument_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://mossim.net",
  ),
  title: {
    default: "MOSSIM | Premium Traditional Fashion in Bangladesh",
    template: "%s | MOSSIM",
  },
  description:
    "Shop premium Panjabi, Kurta, three-piece suits and coordinated family fashion for men, women and kids at MOSSIM Bangladesh.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: "/",
    siteName: "MOSSIM",
    title: "MOSSIM | Premium Traditional Fashion in Bangladesh",
    description:
      "Shop premium Panjabi, Kurta, three-piece suits and coordinated family fashion for men, women and kids at MOSSIM Bangladesh.",
    images: [
      {
        url: "https://mossim.net/images/social-mossim.png",
        width: 1200,
        height: 630,
        alt: "MOSSIM premium traditional fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOSSIM | Premium Traditional Fashion in Bangladesh",
    description:
      "Shop premium Panjabi, Kurta, three-piece suits and coordinated family fashion for men, women and kids at MOSSIM Bangladesh.",
    images: ["https://mossim.net/images/social-mossim.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalProvider>
      <html lang="en" data-scroll-behavior="smooth">
        <body className={instrument.className}>
          {children}
          <ModalCart />
          <ModalWishlist />
          <ModalSearch />
          <ModalQuickview />
          <ModalCompare />
          <Suspense fallback={null}>
            <MetaPixel />
          </Suspense>
        </body>
      </html>
    </GlobalProvider>
  );
}
