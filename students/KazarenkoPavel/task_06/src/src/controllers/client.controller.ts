import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClientService } from '../services/client.service';
import { CreateClientDto, UpdateClientDto } from '../dtos/client.dto';

export class ClientController {
  private clientService = new ClientService();

  async createClient(req: AuthRequest, res: Response) {
    try {
      const createClientDto: CreateClientDto = req.body;
      const userId = req.user!.id;

      const client = await this.clientService.createClient(createClientDto, userId);
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getClients(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const result = await this.clientService.getClients(
        userId,
        userRole,
        parseInt(page as string),
        parseInt(limit as string),
        search as string
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getClientById(req: AuthRequest, res: Response) {
    try {
      const clientId = parseInt(req.params.id);
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const client = await this.clientService.getClientById(clientId, userId, userRole);
      res.json(client);
    } catch (error) {
      if (error.message === 'Client not found') {
        res.status(404).json({ message: error.message });
      } else if (error.message === 'Access denied') {
        res.status(403).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }

  async updateClient(req: AuthRequest, res: Response) {
    try {
      const clientId = parseInt(req.params.id);
      const updateClientDto: UpdateClientDto = req.body;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const client = await this.clientService.updateClient(
        clientId,
        updateClientDto,
        userId,
        userRole
      );
      res.json(client);
    } catch (error) {
      if (error.message === 'Client not found') {
        res.status(404).json({ message: error.message });
      } else if (error.message === 'Access denied') {
        res.status(403).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }

  async deleteClient(req: AuthRequest, res: Response) {
    try {
      const clientId = parseInt(req.params.id);
      const userId = req.user!.id;
      const userRole = req.user!.role;

      await this.clientService.deleteClient(clientId, userId, userRole);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'Client not found') {
        res.status(404).json({ message: error.message });
      } else if (error.message === 'Access denied') {
        res.status(403).json({ message: error.message });
      } else {
        res.status(400).json({ message: error.message });
      }
    }
  }
}
