import RepresentativesView from "@/components/views/RepresentativesView";

export const metadata = {
  title: "Your Representatives — CivicLens",
  description:
    "Contact info, profiles, and campaign finance data for your federal and state legislators.",
};

export default function Page() {
  return <RepresentativesView />;
}
