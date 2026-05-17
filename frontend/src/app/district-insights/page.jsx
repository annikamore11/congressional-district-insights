import DistrictView from "@/components/views/DistrictView";

export const metadata = {
  title: "District Data — CivicLens",
  description:
    "Demographics, economy, health, education, and civic engagement metrics for your state and county.",
};

export default function Page() {
  return <DistrictView />;
}
