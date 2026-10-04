const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const {
  buscarPerfil,
  atualizarPerfil,
  atualizarFoto,
  atualizarExperiencia,
} = require("../controllers/jogadorController");

router.get("/perfil", auth, buscarPerfil);
router.put("/perfil", auth, atualizarPerfil);
router.post("/foto", auth, upload.single("foto"), atualizarFoto);
router.put("/experiencia", auth, atualizarExperiencia);

module.exports = router;
