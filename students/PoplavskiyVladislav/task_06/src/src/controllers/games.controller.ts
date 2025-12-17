import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/game.service';
import { AuthRequest } from '../middleware/auth.middleware';

const gameService = new GameService();

export class GameController {
  async createGame(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      // Преобразуем пустые строки в null
      const gameData = {
        ...req.body,
        description: req.body.description === '' ? null : req.body.description,
        rating: req.body.rating === '' ? null : req.body.rating,
        imageUrl: req.body.imageUrl === '' ? null : req.body.imageUrl,
      };

      const game = await gameService.createGame(req.user.id, gameData);
      res.status(201).json({
        status: 'success',
        data: { game },
      });
    } catch (error) {
      next(error);
    }
  }

  async getGames(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const games = await gameService.getGames(req.user.id, req.query);
      res.json({
        status: 'success',
        data: { games },
      });
    } catch (error) {
      next(error);
    }
  }

  async getGame(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const game = await gameService.getGameById(req.user.id, req.params.id);
      
      if (!game) {
        return res.status(404).json({
          status: 'error',
          message: 'Игра не найдена',
        });
      }

      res.json({
        status: 'success',
        data: { game },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateGame(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const game = await gameService.updateGame(
        req.user.id,
        req.params.id,
        req.body
      );
      
      res.json({
        status: 'success',
        data: { game },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteGame(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      await gameService.deleteGame(req.user.id, req.params.id);
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Не авторизован' });
      }

      const stats = await gameService.getGameStats(req.user.id);
      
      res.json({
        status: 'success',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }
}