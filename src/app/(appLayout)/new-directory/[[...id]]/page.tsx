import type { Metadata } from "next";
import NewDirectory from "@/components/NewDirectory";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cache } from "react";

const getCachedSession = cache(async () => await getServerSession(authOptions));

export const metadata: Metadata = {
  title: "New Directory",
  description: "Create a new directory on Math Editor"
};

export default async function Page(
  props: { params: Promise<{ id?: string[] }> }
) {
  const params = await props.params;
  const parentId = params.id?.[0] || undefined;
  
  return <NewDirectory parentId={parentId} />;
}
