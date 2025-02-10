import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [cvs, setCvs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("documento"); // "documento" o "nombre"
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

  // Obtener todos los CVs
  const fetchCVs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/cvs");
      setCvs(response.data);
    } catch (error) {
      console.error("Error cargando CVs:", error);
    }
  };

  // Buscar CV por documento o nombre
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
  

  // Restaurar la lista completa
  const handleShowAll = () => {
    fetchCVs();
    setSearchQuery(""); // Limpiar el campo de búsqueda
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Agregar o editar un CV
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/cvs/${editingId}`, formData);
        setEditingId(null);
      } else {
        const response = await axios.post("http://localhost:5000/cvs", formData);
        setCvs([...cvs, response.data]);
      }

      // Limpiar formulario
      setFormData({
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

      fetchCVs();
    } catch (error) {
      console.error("Error agregando o editando CV:", error);
    }
  };

  // Editar CV
  const handleEdit = (cv) => {
    setFormData(cv);
    setEditingId(cv._id);
  };

  // Eliminar CV
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/cvs/${id}`);
      fetchCVs();
    } catch (error) {
      console.error("Error eliminando CV:", error);
    }
  };

  return (
    <div>
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
      <form onSubmit={handleSubmit}>
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

