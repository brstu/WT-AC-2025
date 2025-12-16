const router = require("express").Router();
const prisma = require("../prisma");
const auth = require("../middleware/auth.middleware");

// Получить свои фильмы
router.get("/", auth, async (req, res) => {
  const movies = await prisma.movie.findMany({
    where: { ownerId: req.user.id }
  });
  res.json(movies);
});

// Добавить фильм/сериал
router.post("/", auth, async (req, res) => {
  const movie = await prisma.movie.create({
    data: {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      ownerId: req.user.id
    }
  });
  res.json(movie);
});

// Удалить
router.delete("/:id", auth, async (req, res) => {
  await prisma.movie.deleteMany({
    where: {
      id: Number(req.params.id),
      ownerId: req.user.id
    }
  });
  res.json({ message: "Удалено" });
});

module.exports = router;
