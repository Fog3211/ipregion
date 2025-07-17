import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { GoogleAnalytics } from "~/app/_components/analytics";

export const metadata: Metadata = {
	title: "Geo IP Generator - Generate Real IP Addresses by Country/Region",
	description: "Professional geo-location IP address generation service. Generate real IP addresses from any country or region worldwide.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<GoogleAnalytics />
				{children}
			</body>
		</html>
	);
}
