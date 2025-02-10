const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Servir imágenes

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir el esquema del CV
const cvSchema = new mongoose.Schema({
  documentoIdentidad: { type: String, required: true, unique: true },
  nombreEmpleado: { type: String, required: true },
  fechaNacimiento: { type: String, required: true },
  edad: { type: String, required: true },
  contacto: { type: String, required: true },
  enfermedadesReportadas: { type: String },
  direccion: { type: String, required: true },
  telefono: { type: String, required: true },
  celular: { type: String, required: true },
  cargo: { type: String, required: true },
  salario: { type: String, required: true },
  fechaIngreso: { type: String, required: true },
  tiempoEmpresa: { type: String, required: true },
  nivelAcademico: { type: String, required: true },
  fechaLlamadoAtencion: { type: String },
  accidentalidad: { type: String },
  fechaAccidente: { type: String },
  ARL: { type: String },
  EPS: { type: String },
  fondoPension: { type: String },
  cajaCompensacion: { type: String },
  fechaSuspension: { type: String },
  fechaAusentismo: { type: String },
  foto: { type: String }, // Campo para la foto
});

const CV = mongoose.model("CV", cvSchema);

// Configurar multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Guardar con un nombre único
  },
});
const upload = multer({ storage });

// Crear un nuevo CV
app.post("/cvs", upload.single("foto"), async (req, res) => {
  try {
    const newCV = new CV({ ...req.body, foto: req.file ? `/uploads/${req.file.filename}` : "" });
    await newCV.save();
    res.status(201).json(newCV);
  } catch (error) {
    res.status(400).json({ message: "Error al guardar el CV", error });
  }
});

// Obtener todos los CVs
app.get("/cvs", async (req, res) => {
  try {
    const cvs = await CV.find();
    res.json(cvs);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los CVs" });
  }
});

// Obtener un CV por documento de identidad
app.get("/cvs/documento/:documento", async (req, res) => {
  try {
    const cv = await CV.findOne({ documentoIdentidad: req.params.documento });
    if (!cv) return res.status(404).json({ message: "CV no encontrado" });
    res.json(cv);
  } catch (error) {
    res.status(500).json({ message: "Error en la búsqueda" });
  }
});

// Obtener CVs por nombre (búsqueda parcial)
app.get("/cvs/nombre/:nombre", async (req, res) => {
  try {
    const cvs = await CV.find({ nombreEmpleado: new RegExp(req.params.nombre, "i") });
    if (cvs.length === 0) return res.status(404).json({ message: "No se encontraron CVs" });
    res.json(cvs);
  } catch (error) {
    res.status(500).json({ message: "Error en la búsqueda" });
  }
});

// Actualizar un CV
app.put("/cvs/:id", async (req, res) => {
  try {
    const updatedCV = await CV.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCV) return res.status(404).json({ message: "CV no encontrado" });
    res.json(updatedCV);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el CV" });
  }
});

// Eliminar un CV
app.delete("/cvs/:id", async (req, res) => {
  try {
    const deletedCV = await CV.findByIdAndDelete(req.params.id);
    if (!deletedCV) return res.status(404).json({ message: "CV no encontrado" });
    res.json({ message: "CV eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el CV" });
  }
});

// Ruta raíz para verificar si el servidor está corriendo
app.get("/", (req, res) => {
  res.send("API de CVs funcionando!");
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
