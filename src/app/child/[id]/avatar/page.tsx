"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarWizard, { AvatarConfig } from "@/components/AvatarWizard";

export default function AvatarPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const [childName, setChildName] = useState("Toi");

  useEffect(() => {
    fetch(`/api/children/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data?.name) setChildName(data.name); });
  }, [id]);

  function handleComplete(config: AvatarConfig) {
    console.log("Avatar created:", config);
    router.push(`/child/${id}`);
  }

  return (
    <AvatarWizard
      childName={childName}
      childId={id}
      onComplete={handleComplete}
      onSkip={() => router.push(`/child/${id}`)}
    />
  );
}
