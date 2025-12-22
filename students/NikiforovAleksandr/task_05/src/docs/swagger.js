import swaggerJsdoc from 'swagger-jsdoc';

export default swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sports Leagues & Matches API',
      version: '1.0.0',
      description: 'REST API for sports leagues and matches'
    },
    servers: [
      { url: 'http://localhost:3000' }
    ],
    paths: {
      // ------------------- LEAGUES -------------------
      '/api/v1/leagues': {
        get: {
          summary: 'Get all leagues',
          operationId: 'getLeagues',
          parameters: [
            { name: 'q', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
          ],
          responses: { 200: { description: 'List of leagues' } }
        },
        post: {
          summary: 'Create league',
          operationId: 'createLeague',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'country', 'foundedYear'],
                  properties: {
                    name: { type: 'string' },
                    country: { type: 'string' },
                    foundedYear: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'League created' } }
        }
      },
      '/api/v1/leagues/{id}': {
        get: {
          summary: 'Get league by ID',
          operationId: 'getLeagueById',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: { 200: { description: 'League retrieved' }, 404: { description: 'Not found' } }
        },
        patch: {
          summary: 'Update league',
          operationId: 'updateLeague',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    country: { type: 'string' },
                    foundedYear: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: { 200: { description: 'League updated' } }
        },
        delete: {
          summary: 'Delete league',
          operationId: 'deleteLeague',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'League deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { message: { type: 'string', example: 'League deleted successfully' } }
                  }
                }
              }
            },
            404: { description: 'Not found' }
          }
        }
      },

      // ------------------- MATCHES -------------------
      '/api/v1/matches': {
        get: {
          summary: 'Get all matches',
          operationId: 'getMatches',
          parameters: [
            { name: 'leagueId', in: 'query', schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
            { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } }
          ],
          responses: { 200: { description: 'List of matches' } }
        },
        post: {
          summary: 'Create match',
          operationId: 'createMatch',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['leagueId', 'homeTeam', 'awayTeam', 'date', 'finished'],
                  properties: {
                    leagueId: { type: 'string', format: 'uuid' },
                    homeTeam: { type: 'string' },
                    awayTeam: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    finished: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'Match created' } }
        }
      },
      '/api/v1/matches/{id}': {
        get: {
          summary: 'Get match by ID',
          operationId: 'getMatchById',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          responses: {
            200: {
              description: 'Match retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      leagueId: { type: 'string', format: 'uuid' },
                      homeTeam: { type: 'string' },
                      awayTeam: { type: 'string' },
                      date: { type: 'string', format: 'date-time' },
                      finished: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            404: { description: 'Match not found' }
          }
        },
        patch: {
          summary: 'Update match',
          operationId: 'updateMatch',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    leagueId: { type: 'string', format: 'uuid' },
                    homeTeam: { type: 'string' },
                    awayTeam: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    finished: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Match updated successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      leagueId: { type: 'string', format: 'uuid' },
                      homeTeam: { type: 'string' },
                      awayTeam: { type: 'string' },
                      date: { type: 'string', format: 'date-time' },
                      finished: { type: 'boolean' }
                    }
                  }
                }
              }
            },
            404: { description: 'Match not found' }
          }
        },
        delete: {
          summary: 'Delete match',
          operationId: 'deleteMatch',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
          ],
          requestBody: {
            description: 'Required to render DELETE button in Swagger UI',
            content: {
              'application/json': {
                schema: { type: 'object', properties: {} }
              }
            }
          },
          responses: {
            200: {
              description: 'Match deleted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string', example: 'Match deleted successfully' }
                    }
                  }
                }
              }
            },
            404: { description: 'Match not found' }
          }
        }
      }
    }
  },
  apis: []
});
