import { useEffect, useState } from "react";
import axios from "axios";



export default function Home() {
  const [cvs, setCvs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("documento");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    documentoIdentidad: "",
    nombreEmpleado: "",
    fechaNacimiento: "",
    edad: "",
    contacto: "",
    enfermedadesReportadas: "",
    direccion: "",
    telefono: "",
    celular: "",
    cargo: "",
    salario: "",
    fechaIngreso: "",
    tiempoEmpresa: "",
    nivelAcademico: "",
    fechaLlamadoAtencion: "",
    accidentalidad: "",
    fechaAccidente: "",
    ARL: "",
    EPS: "",
    fondoPension: "",
    cajaCompensacion: "",
    fechaSuspension: "",
    fechaAusentismo: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/cvs");
      setCvs(response.data);
    } catch (error) {
      console.error("Error cargando CVs:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      alert("Ingrese un término de búsqueda");
      return;
    }

    try {
      const url =
        searchType === "documento"
          ? `http://localhost:5000/cvs/documento/${searchQuery}`
          : `http://localhost:5000/cvs/nombre/${searchQuery}`;

      const response = await axios.get(url);
      setCvs(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.error("Error buscando CV:", error);
      alert("No se encontraron resultados");
      setCvs([]);
    }
  };

  const handleShowAll = () => {
    fetchCVs();
    setSearchQuery("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
  
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
  
    if (selectedFile) {
      data.append("foto", selectedFile);
    }
  
    try {
      const response = await axios.post("http://localhost:5000/cvs", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("✅ CV agregado:", response.data);
    } catch (error) {
      console.error("❌ Error al agregar CV:", error.response?.data || error);
    }
  };
  
  

  const handleEdit = (cv) => {
    setFormData(cv);
    setEditingId(cv._id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/cvs/${id}`);
      fetchCVs();
    } catch (error) {
      console.error("Error eliminando CV:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Gestión de Hojas de Vida</h1>

      {/* Buscador */}
      <div>
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
          <option value="documento">Buscar por Documento</option>
          <option value="nombre">Buscar por Nombre</option>
        </select>

        <input
          type="text"
          placeholder={`Ingrese ${searchType === "documento" ? "el documento" : "el nombre"}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Buscar</button>
        <button onClick={handleShowAll} style={{ marginLeft: "10px", backgroundColor: "blue", color: "white" }}>
          Mostrar Todas
        </button>
      </div>

      {/* Formulario para agregar/editar CVs */}
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label>{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        {/* Campo para subir foto */}
        <div>
          <label>Subir Foto</label>
          <input type="file" onChange={handleFileChange} />
        </div>

        <button type="submit">{editingId ? "Actualizar" : "Agregar"}</button>
      </form>

      <h2>Hojas de Vida Registradas</h2>
      {cvs.length === 0 ? (
        <p>No se encontraron resultados.</p>
      ) : (
        cvs.map((cv, index) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            {Object.keys(cv).map(
              (key) =>
                key !== "_id" &&
                key !== "__v" && (
                  <p key={key}>
                    <strong>{key.replace(/([A-Z])/g, " $1").toUpperCase()}:</strong> {cv[key]}
                  </p>
                )
            )}
            
            {/* Botón para descargar la foto */}
            {cv.foto && (
              <a
                href={`http://localhost:5000${cv.foto}`}
                download
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "5px 10px",
                  backgroundColor: "green",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "5px",
                }}
              >
                Ver Foto 
              </a>
            )}

            <button onClick={() => handleEdit(cv)}>Editar</button>
            <button onClick={() => handleDelete(cv._id)} style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}>
              Eliminar
            </button>
          </div>
        ))
      )}
    </div>
  );
}


