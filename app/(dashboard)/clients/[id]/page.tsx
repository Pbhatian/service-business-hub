import { redirect } from "next/navigation";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  void params;
  redirect("/dashboard/clients");
}
