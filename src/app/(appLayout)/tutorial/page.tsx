import type { Metadata } from "next";
import Tutorial from "@/components/Tutorial";

export const metadata: Metadata = {
  title: 'Tutorial',
  description: 'Learn how to use Math Editor',
}

const page = () => <Tutorial />;

export default page;