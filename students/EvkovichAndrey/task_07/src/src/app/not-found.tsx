import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music, Home, Search, Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Большая иконка */}
        <div className="relative">
          <div className="mx-auto w-48 h-48 relative">
            <Music className="w-full h-full text-primary/20 absolute inset-0 animate-pulse" />
            <Frown className="w-24 h-24 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Текст */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-3xl font-semibold text-foreground">
            Страница не найдена
          </h2>
          <p className="text-lg text-muted-foreground">
            Кажется, этот артист сбежал со сцены или ссылка устарела.
            <br />
            Но музыка всё ещё играет — давайте найдём то, что вам нужно!
          </p>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Button size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-5 h-5" />
              На главную
            </Link>
          </Button>

          <Button variant="outline" size="lg" className="gap-2">
            <Link href="/artists">
              <Search className="w-5 h-5" />
              Искать артистов
            </Link>
          </Button>
        </div>

        {/* Маленькая шутка */}
        <p className="text-sm text-muted-foreground pt-10">
          P.S. Даже Боб Марли иногда терялся в реге… но потом находил дорогу домой
        </p>
      </div>
    </div>
  );
}

// Опционально: можно добавить метаданные для 404
export const metadata = {
  title: "404 — Страница не найдена | MusicBrainz App",
  description: "Ой! Страница, которую вы ищете, не существует.",
  robots: "noindex",
};