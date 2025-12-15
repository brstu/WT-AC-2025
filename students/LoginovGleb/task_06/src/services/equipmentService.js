const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ForbiddenError, ConflictError } = require('../middleware/errors');

const prisma = new PrismaClient();

/**
 * Получить список оборудования с фильтрацией и пагинацией
 */
const getEquipment = async (query, userId, userRole) => {
  const { q, type, status, limit, offset, sortBy, order } = query;

  // Базовые условия фильтрации
  const where = {};

  // Если пользователь не админ, показываем только его оборудование
  if (userRole !== 'ADMIN') {
    where.ownerId = userId;
  }

  // Поиск по названию, производителю или модели
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { manufacturer: { contains: q, mode: 'insensitive' } },
      { model: { contains: q, mode: 'insensitive' } },
      { serialNumber: { contains: q, mode: 'insensitive' } },
    ];
  }

  // Фильтр по типу
  if (type) {
    where.type = type;
  }

  // Фильтр по статусу
  if (status) {
    where.status = status;
  }

  // Получаем общее количество записей
  const total = await prisma.equipment.count({ where });

  // Получаем оборудование с пагинацией и сортировкой
  const equipment = await prisma.equipment.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: { [sortBy]: order },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  return {
    data: equipment,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
};

/**
 * Получить оборудование по ID
 */
const getEquipmentById = async (id, userId, userRole) => {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  if (!equipment) {
    throw new NotFoundError('Оборудование не найдено');
  }

  // Проверяем права доступа
  if (userRole !== 'ADMIN' && equipment.ownerId !== userId) {
    throw new ForbiddenError('Доступ запрещен');
  }

  return equipment;
};

/**
 * Создать новое оборудование
 */
const createEquipment = async (data, userId) => {
  // Проверяем уникальность серийного номера
  const existing = await prisma.equipment.findUnique({
    where: { serialNumber: data.serialNumber },
  });

  if (existing) {
    throw new ConflictError('Оборудование с таким серийным номером уже существует');
  }

  // Создаем оборудование
  const equipment = await prisma.equipment.create({
    data: {
      ...data,
      ownerId: userId,
      purchaseDate: new Date(data.purchaseDate),
      warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : null,
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  return equipment;
};

/**
 * Обновить оборудование
 */
const updateEquipment = async (id, data, userId, userRole) => {
  // Проверяем существование оборудования
  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!equipment) {
    throw new NotFoundError('Оборудование не найдено');
  }

  // Проверяем права доступа
  if (userRole !== 'ADMIN' && equipment.ownerId !== userId) {
    throw new ForbiddenError('Доступ запрещен');
  }

  // Если меняется серийный номер, проверяем его уникальность
  if (data.serialNumber && data.serialNumber !== equipment.serialNumber) {
    const existing = await prisma.equipment.findUnique({
      where: { serialNumber: data.serialNumber },
    });

    if (existing) {
      throw new ConflictError('Оборудование с таким серийным номером уже существует');
    }
  }

  // Обновляем оборудование
  const updated = await prisma.equipment.update({
    where: { id },
    data: {
      ...data,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
      warrantyEnd: data.warrantyEnd ? new Date(data.warrantyEnd) : undefined,
    },
    include: {
      owner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Удалить оборудование
 */
const deleteEquipment = async (id, userId, userRole) => {
  // Проверяем существование оборудования
  const equipment = await prisma.equipment.findUnique({
    where: { id },
  });

  if (!equipment) {
    throw new NotFoundError('Оборудование не найдено');
  }

  // Проверяем права доступа
  if (userRole !== 'ADMIN' && equipment.ownerId !== userId) {
    throw new ForbiddenError('Доступ запрещен');
  }

  // Удаляем оборудование
  await prisma.equipment.delete({
    where: { id },
  });

  return true;
};

module.exports = {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
};
