import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Music, Search, Headphones, Mic, Guitar, Sparkles } from "lucide-react";

export const metadata = {
  title: "MusicBrainz Explorer",
  description: "Поиск артистов, альбомов и треков в самой большой открытой музыкальной базе данных",
};

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pt-24 pb-32">
        <div className="absolute inset-0 bg-grid-primary/5 bg-grid-16 pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Music className="w-24 h-24 text-primary animate-pulse" />
              <Sparkles className="w-8 h-8 text-primary absolute top-0 right-0 animate-ping" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-primary via-primary/80 to-foreground bg-clip-text text-transparent mb-6">
            MusicBrainz Explorer
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Исследуйте миллионы артистов, альбомов и треков в самой большой
            <span className="text-primary font-semibold"> открытой </span>
            музыкальной базе данных мира
          </p>

          {/* Быстрый поиск */}
          <form action="/artists" className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                name="query"
                type="text"
                placeholder="Введите имя артиста... (например: Radiohead, Шостакович, Nirvana)"
                className="text-lg h-14"
                required
                autoFocus
              />
              <Button type="submit" size="lg" className="h-14 px-8 text-lg">
                <Search className="w-5 h-5 mr-2" />
                Найти
              </Button>
            </div>
          </form>

          {/* Популярные запросы */}
          <div className="mt-12">
            <p className="text-sm text-muted-foreground mb-4">Популярные сейчас:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["The Beatles", "Radiohead", "Daft Punk", "Баста", "Queen", "Metallica", "Чайковский"].map((artist) => (
                <Link key={artist} href={`/artists?query=${encodeURIComponent(artist)}`}>
                  <Button variant="secondary" size="sm" className="hover:scale-105 transition-transform">
                    {artist}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">15+ миллионов артистов</h3>
              <p className="text-muted-foreground">
                От классики до андеграунда — всё в одном месте
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Открытые данные</h3>
              <p className="text-muted-foreground">
                Полностью бесплатный API и база данных
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Guitar className="w-9 h-9 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Точная информация</h3>
              <p className="text-muted-foreground">
                Диски, даты, составы групп — всё проверено сообществом
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Готовы найти своего любимого артиста?
          </h2>
          <Button size="lg" className="text-lg px-8 h-14">
            <Link href="/artists">
              Перейти к поиску артистов
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}