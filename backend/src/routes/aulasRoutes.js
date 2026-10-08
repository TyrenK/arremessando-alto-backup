const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { listarAulasPorSemana, concluirAula, desmarcarAula } = require("../controllers/aulasController");

router.get("/", auth, listarAulasPorSemana);
router.post("/:id/concluir", auth, concluirAula);
router.delete("/:id/concluir", auth, desmarcarAula);

module.exports = router;