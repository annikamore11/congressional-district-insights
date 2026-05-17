import "./globals.css";
import LocationProvider from "@/app/providers/LocationProvider";

export const metadata = {
  title: "CivicLens",
  description:
    "Transparent civic data and campaign finance tracking — explore demographics, economy, health, education, and your representatives by congressional district.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  );
}
