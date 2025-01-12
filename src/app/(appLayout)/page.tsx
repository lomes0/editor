import Home from "@/components/Home";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_TITLE,
  description: 'A free text editor, with support for LaTeX, Geogebra, Excalidraw and markdown shortcuts. Create, share and print math documents with ease.',
}

const page = () => <Home />;

export default page;
