"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Music, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {ArtistsSkeleton} from "@/components/artists/ArtistsSkeleton";

const LIMIT = 25;

type Artist = {
  id: string;
  name: string;
  disambiguation?: string;
  type?: string;
  score?: number;
};

type SearchResponse = {
  count: number;
  offset: number;
  artists: Artist[];
};

async function searchArtists(query: string, offset: number): Promise<SearchResponse> {
  const params = new URLSearchParams({
    query: query || "*:*",
    limit: LIMIT.toString(),
    offset: offset.toString(),
    fmt: "json",
  });

  const res = await fetch(`https://musicbrainz.org/ws/2/artist/?${params}`, {
    headers: {
      "User-Agent": "MyMusicApp/1.0 ( https://example.com )",
    },
  });

  if (!res.ok) throw new Error("Не удалось загрузить артистов");

  return res.json();
}

export function ArtistsList({
                              initialQuery = "",
                            }: {
  initialQuery?: string;
  initialOffset?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  const currentQuery = searchParams.get("query") || "";
  const currentOffset = Number(searchParams.get("offset")) || 0;

  const { data, isPending, error } = useQuery({
    queryKey: ["artists", currentQuery, currentOffset],
    queryFn: () => searchArtists(currentQuery, currentOffset),
    staleTime: 1000 * 60 * 5, // 5 минут
  });

  // Синхронизация инпута с URL
  useEffect(() => {
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    router.push(`/artists?${params.toString()}`);
  };

  const totalPages = data ? Math.ceil(data.count / LIMIT) : 0;
  const currentPage = Math.floor(currentOffset / LIMIT) + 1;

  const setPage = (page: number) => {
    const newOffset = (page - 1) * LIMIT;
    const params = new URLSearchParams(searchParams);
    if (newOffset > 0) {
      params.set("offset", newOffset.toString());
    } else {
      params.delete("offset");
    }
    router.push(`/artists?${params.toString()}`);
  };

  if (isPending && !data) {
    return <ArtistsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Ошибка загрузки: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.artists.length === 0) {
    return (
      <div className="text-center py-20">
        <Music className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <p className="text-xl text-muted-foreground">
          {currentQuery ? `Ничего не найдено по запросу "${currentQuery}"` : "Начните поиск артистов"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Поиск */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10 flex gap-2">
        <Input
          type="text"
          placeholder="Введите имя артиста..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="text-lg"
        />
        <Button type="submit" size="lg">
          <Search className="h-5 w-5 mr-2" />
          Найти
        </Button>
      </form>

      {/* Счётчик */}
      <p className="text-center text-muted-foreground mb-8">
        Найдено артистов: <strong>{data.count.toLocaleString("ru")}</strong>
      </p>

      {/* Список */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {data.artists.map((artist) => (
          <Link key={artist.id} href={`/artists/${artist.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{artist.name}</h3>
                {artist.disambiguation && (
                  <p className="text-sm text-muted-foreground mb-2">
                    ({artist.disambiguation})
                  </p>
                )}
                {artist.type && (
                  <p className="text-sm capitalize text-muted-foreground">
                    {artist.type === "Person" ? "Исполнитель" : artist.type === "Group" ? "Группа" : artist.type}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            ← Назад
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) pageNum = i + 1;
              else if (currentPage <= 4) pageNum = i + 1;
              else if (currentPage >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = currentPage - 3 + i;

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 7 && currentPage < totalPages - 3 && (
              <>
                <span className="px-3 py-2">...</span>
                <Button variant="outline" size="sm" onClick={() => setPage(totalPages)}>
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            Вперед →
          </Button>
        </div>
      )}
    </>
  );
}