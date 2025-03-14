const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const bcrypt = require('bcrypt'); // Para encriptar contraseñas
const jwt = require('jsonwebtoken');


dotenv.config();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true })); // Para datos de formularios
app.use(express.json()); // Para datos en JSON
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
  foto: { type: String },
  accidentalidad: { type: String },
  hojaDeVida: { type: String },
  ausentismo: { type: String },
  suspension: { type: String },
  otros: { type: String }, 
});

const CV = mongoose.model("CV", cvSchema);

// Definir el esquema de usuario
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Configurar multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Guardar con un nombre único
  },
});

const upload = multer({ storage: storage });

// Rutas para autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
      const { username, password } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
          return res.status(400).json({ message: 'El usuario ya existe' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
      const { username, password } = req.body;

      const user = await User.findOne({ username });
      if (!user) {
          return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

      res.json({ token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});




// Servir archivos estáticos desde la carpeta 'uploads'
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ruta para descargar imágenes
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);
  res.download(filePath, (err) => {
    if (err) {
      console.error("Error al descargar el archivo:", err);
      res.status(500).send("Error al descargar el archivo");
    }
  });
});

app.post("/cvs", upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'accidentalidad', maxCount: 1 },
  { name: 'hojaDeVida', maxCount: 1 },
  { name: 'ausentismo', maxCount: 1 },
  { name: 'suspension', maxCount: 1 },
  { name: 'otros', maxCount: 1 }
]), async (req, res) => {
      console.log("req.body:", req.body);
    console.log("req.files:", req.files);
  try {
      console.log(" Datos recibidos:", req.body);
      console.log(" Archivos recibidos:", req.files); // Ahora req.files contendrá un objeto con los archivos

      // Verificar si el documento ya existe (igual que antes)
      const existeCV = await CV.findOne({ documentoIdentidad: req.body.documentoIdentidad });
      if (existeCV) {
          return res.status(400).json({ message: "El documento de identidad ya está registrado" });
      }

      const newCV = new CV({
          ...req.body,
          foto: req.files['foto'] ? `/uploads/${req.files['foto'][0].filename}` : "",
          accidentalidad: req.files['accidentalidad'] ? `/uploads/${req.files['accidentalidad'][0].filename}` : "",
          hojaDeVida: req.files['hojaDeVida'] ? `/uploads/${req.files['hojaDeVida'][0].filename}` : "",
          ausentismo: req.files['ausentismo'] ? `/uploads/${req.files['ausentismo'][0].filename}` : "",
          suspension: req.files['suspension'] ? `/uploads/${req.files['suspension'][0].filename}` : "",
          otros: req.files['otros'] ? `/uploads/${req.files['otros'][0].filename}` : "",
      });

      await newCV.save();
      res.status(201).json(newCV);
  } catch (error) {
      console.error("❌ Error al guardar el CV:", error);
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

app.put("/cvs/:id", upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'accidentalidad', maxCount: 1 },
  { name: 'hojaDeVida', maxCount: 1 },
  { name: 'ausentismo', maxCount: 1 },
  { name: 'suspension', maxCount: 1 },
  { name: 'otros', maxCount: 1 },
]), async (req, res) => {
  try {
      const { id } = req.params;
      const updateData = req.body; // Get text fields

      // 1. Fetch the existing CV *FIRST*
      const cv = await CV.findById(id);  // This is the CRUCIAL missing line

      if (!cv) { // Handle the case where the CV is not found
          return res.status(404).json({ error: "CV not found" });
      }

      if (req.files) {
          // 2. Now you can safely delete old files:
          const deleteOldFile = (fieldName) => {
              if (req.files[fieldName] && cv[fieldName]) { // Now cv is defined!
                  const oldFilePath = path.join(__dirname, cv[fieldName]);
                  try {
                      fs.unlinkSync(oldFilePath);
                  } catch (err) {
                      console.error(`Error deleting old ${fieldName}:`, err);
                  }
              }
          };

          deleteOldFile('foto');
          deleteOldFile('accidentalidad');
          deleteOldFile('hojaDeVida');
          deleteOldFile('ausentismo');
          deleteOldFile('suspension');
          deleteOldFile('otros');

          // 3. Update file paths in updateData:
          updateData.foto = req.files['foto'] ? `/uploads/${req.files['foto'][0].filename}` : cv.foto;
          updateData.accidentalidad = req.files['accidentalidad'] ? `/uploads/${req.files['accidentalidad'][0].filename}` : cv.accidentalidad;
          updateData.hojaDeVida = req.files['hojaDeVida'] ? `/uploads/${req.files['hojaDeVida'][0].filename}` : cv.hojaDeVida;
          updateData.ausentismo = req.files['ausentismo'] ? `/uploads/${req.files['ausentismo'][0].filename}` : cv.ausentismo;
          updateData.suspension = req.files['suspension'] ? `/uploads/${req.files['suspension'][0].filename}` : cv.suspension;
          updateData.otros = req.files['otros'] ? `/uploads/${req.files['otros'][0].filename}` : cv.otros;
      }

      const updatedCV = await CV.findByIdAndUpdate(id, updateData, { new: true });
      res.json(updatedCV);

  } catch (error) {
      console.error("Error updating CV:", error);
      res.status(500).json({ error: "Error actualizando el CV" });
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
