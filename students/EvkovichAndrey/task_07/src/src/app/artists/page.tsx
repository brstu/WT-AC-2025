import { Suspense } from "react";
import { ArtistsList } from "@/components/artists/ArtistsList";
import { ArtistsSkeleton } from "@/components/artists/ArtistsSkeleton";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Мой проект",
  description: "Описание проекта"
};

export default async function ArtistsPage({searchParams}: {
  searchParams: Promise<{ query?: string; offset?: string }>
}) {
  const {query = '', offset = "0"} = await searchParams;
  const offsetNumber = Number(offset) || 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">Артисты MusicBrainz</h1>

      <Suspense fallback={<ArtistsSkeleton />}>
        <ArtistsList initialQuery={query} initialOffset={offsetNumber} />
      </Suspense>
    </div>
  );
}