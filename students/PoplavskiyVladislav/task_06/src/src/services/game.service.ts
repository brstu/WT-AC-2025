import prisma from '../config/database';
import {
  Game,
  CreateGameDto,
  UpdateGameDto,
  GameQuery,
  GameResponse,
} from '../models/Game';
import { AppError } from '../middleware/error.middleware';

// Хелпер для преобразования Game в GameResponse
const toGameResponse = (game: Game): GameResponse => ({
  ...game,
  description: game.description || undefined,
  rating: game.rating || undefined,
  imageUrl: game.imageUrl || undefined,
});

export class GameService {
  async createGame(userId: string, data: CreateGameDto): Promise<GameResponse> {
    const game = await prisma.game.create({
      data: {
        ...data,
        ownerId: userId,
      },
    });

    return toGameResponse(game);
  }

  async getGames(userId: string, query: GameQuery = {}): Promise<GameResponse[]> {
    const {
      genre,
      platform,
      minRating,
      maxRating,
      minYear,
      maxYear,
      search,
    } = query;

    const where: any = {
      ownerId: userId,
    };

    if (genre) where.genre = genre;
    if (platform) where.platform = platform;

    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) where.rating.gte = minRating;
      if (maxRating !== undefined) where.rating.lte = maxRating;
    }

    if (minYear !== undefined || maxYear !== undefined) {
      where.releaseYear = {};
      if (minYear !== undefined) where.releaseYear.gte = minYear;
      if (maxYear !== undefined) where.releaseYear.lte = maxYear;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const games = await prisma.game.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return games.map(toGameResponse);
  }

  async getGameById(userId: string, gameId: string): Promise<GameResponse | null> {
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        ownerId: userId,
      },
    });

    if (!game) return null;
    return toGameResponse(game);
  }

  async updateGame(
    userId: string,
    gameId: string,
    data: UpdateGameDto
  ): Promise<GameResponse> {
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        ownerId: userId,
      },
    });

    if (!game) {
      throw new AppError('Игра не найдена', 404);
    }

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        ...data,
        // Преобразуем undefined в null для Prisma
        description: data.description === undefined ? undefined : data.description,
        rating: data.rating === undefined ? undefined : data.rating,
        imageUrl: data.imageUrl === undefined ? undefined : data.imageUrl,
      },
    });

    return toGameResponse(updatedGame);
  }

  async deleteGame(userId: string, gameId: string): Promise<void> {
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        ownerId: userId,
      },
    });

    if (!game) {
      throw new AppError('Игра не найдена', 404);
    }

    await prisma.game.delete({
      where: { id: gameId },
    });
  }

  async getGameStats(userId: string): Promise<any> {
    const games = await prisma.game.findMany({
      where: { ownerId: userId },
    });

    const stats = {
      totalGames: games.length,
      byGenre: {} as Record<string, number>,
      byPlatform: {} as Record<string, number>,
      averageRating: 0,
    };

    let totalRating = 0;
    let ratedGames = 0;

    games.forEach(game => {
      // Статистика по жанрам
      stats.byGenre[game.genre] = (stats.byGenre[game.genre] || 0) + 1;

      // Статистика по платформам
      stats.byPlatform[game.platform] = (stats.byPlatform[game.platform] || 0) + 1;

      // Средний рейтинг
      if (game.rating) {
        totalRating += game.rating;
        ratedGames++;
      }
    });

    stats.averageRating = ratedGames > 0 ? totalRating / ratedGames : 0;

    return stats;
  }
}