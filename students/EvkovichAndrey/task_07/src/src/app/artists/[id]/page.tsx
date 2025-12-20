import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Music,
  Users,
  Tag,
  ExternalLink,
  Home,
} from "lucide-react";

// Типы из MusicBrainz
type Artist = {
  id: string;
  name: string;
  disambiguation?: string;
  type?: string;
  gender?: string;
  "life-span"?: {
    begin?: string;
    end?: string;
    ended: boolean;
  };
  country?: string;
  area?: { name: string };
  tags?: { name: string }[];
  relations?: Array<{
    type: string;
    url?: { resource: string };
  }>;
};

type ReleaseGroup = {
  id: string;
  title: string;
  "first-release-date"?: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
};

// Функция загрузки артиста
async function getArtist(id: string): Promise<Artist> {
  const url = `https://musicbrainz.org/ws/2/artist/${id}?inc=tags+url-rels&fmt=json`;
  const res = await fetch(url, {
    headers: { "User-Agent": "MusicBrainzExplorer/1.0 (+https://example.com)" },
    next: { revalidate: 3600 },
  });

  if (res.status === 404) {
    notFound(); // ← вот так правильно
  }

  if (!res.ok) {
    throw new Error("Failed to fetch artist");
  }

  const artist = await res.json();

  // Иногда возвращается объект без id — значит 404
  if (!artist?.id) {
    notFound();
  }

  return artist;
}

// Функция загрузки релизов
async function getReleases(id: string, offset = 0): Promise<{
  "release-group-count": number;
  "release-groups": ReleaseGroup[];
}> {
  const res = await fetch(
    `https://musicbrainz.org/ws/2/release-group?artist=${id}&limit=12&offset=${offset}&fmt=json`,
    {
      headers: {
        "User-Agent": "MusicBrainzExplorer/1.0 ( https://example.com )",
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch releases");
  return res.json();
}

// Основная страница
export default async function ArtistPage({
                                           params,
                                         }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let artist: Artist;
  let releasesData: Awaited<ReturnType<typeof getReleases>>;

  try {
    [artist, releasesData] = await Promise.all([
      getArtist(id),
      getReleases(id, 0),
    ]);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Ошибка:", err.message);
    }
    notFound();
  }


  const releases = releasesData["release-groups"] || [];
  const totalReleases = releasesData["release-group-count"] || 0;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": artist.type === "Person" ? "Person" : "MusicGroup",
            name: artist.name,
            url: `https://musicbrainz.org/artist/${id}`,
          }),
        }}
      />

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Заголовок */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold mb-2">{artist.name}</h1>
          {artist.disambiguation && (
            <p className="text-xl text-muted-foreground">
              {artist.disambiguation}
            </p>
          )}
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="info">Информация</TabsTrigger>
            <TabsTrigger value="releases">
              Релизы ({totalReleases})
            </TabsTrigger>
          </TabsList>

          {/* Вкладка: Информация */}
          <TabsContent value="info" className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Основные данные
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {artist.type && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Тип</span>
                      <span className="font-medium">
                        {artist.type === "Person"
                          ? "Исполнитель"
                          : artist.type === "Group"
                            ? "Группа"
                            : artist.type}
                      </span>
                    </div>
                  )}
                  {artist.country && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Страна</span>
                      <span className="font-medium flex items-center gap-1">
                        {artist.country}
                      </span>
                    </div>
                  )}
                  {(artist["life-span"]?.begin || artist["life-span"]?.end) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Годы</span>
                      <span className="font-medium">
                        {artist["life-span"].begin?.split("-")[0]} —{" "}
                        {artist["life-span"].ended
                          ? artist["life-span"].end?.split("-")[0]
                          : "наши дни"}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {artist.tags && artist.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Теги
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {artist.tags.slice(0, 10).map((tag) => (
                        <Badge key={tag.name} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                      {artist.tags.length > 10 && (
                        <Badge variant="outline">+{artist.tags.length - 10}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {artist.relations && artist.relations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      Ссылки
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {artist.relations
                      .filter((r) => r.url?.resource)
                      .slice(0, 5)
                      .map((rel, i) => (
                        <Link
                          key={i}
                          href={rel.url!.resource}
                          target="_blank"
                          className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {rel.type.replace("wikipedia", "Wikipedia").replace("official homepage", "Оф. сайт")}
                        </Link>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Вкладка: Релизы */}
          <TabsContent value="releases">
            {releases.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg">Релизы не найдены</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {releases.map((rg) => (
                  <Link
                    key={rg.id}
                    href={`https://musicbrainz.org/release-group/${rg.id}`}
                    target="_blank"
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 text-center">
                        <div className="bg-muted border-2 border-dashed rounded-xl w-full aspect-square mb-4 flex items-center justify-center">
                          <Music className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {rg.title}
                        </h3>
                        {rg["first-release-date"] && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {rg["first-release-date"].split("-")[0]}
                          </p>
                        )}
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {rg["primary-type"] || "Альбом"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator className="my-12" />

        <div className="text-center">
          <Button variant="outline">
            <Link className={"flex"} href="/artists">
              <Home className="w-4 h-4 mr-2" />
              Вернуться к списку артистов
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

// Генерация метаданных
export async function generateMetadata({
                                         params,
                                       }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  try {
    const artist = await getArtist(id);
    return {
      title: `${artist.name} | MusicBrainz Explorer`,
      description: `Информация об артисте ${artist.name} — страна, годы активности, релизы, теги`,
      openGraph: {
        title: artist.name,
        description: `Артист на MusicBrainz${artist.country ? ` • ${artist.country}` : ""}`,
        url: `https://yoursite.com/artists/${id}`,
        type: "profile",
      },
    };
  } catch {
    return {
      title: "Артист не найден",
    };
  }
}