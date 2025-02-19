import { useEffect, useState } from "react";
import axios from "axios";



export default function Home() {
  const [cvs, setCvs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("documento");
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [selectedAccidentalidad, setSelectedAccidentalidad] = useState(null);
  const [selectedHojaDeVida, setSelectedHojaDeVida] = useState(null);
  const [selectedAusentismo, setSelectedAusentismo] = useState(null);
  const [selectedSuspension, setSelectedSuspension] = useState(null);
  const [selectedOtros, setSelectedOtros] = useState(null);
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

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]); // This is the CORRECT way to update the state
    console.log("File selected:", e.target.files[0]); // Add this for debugging
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append all form data (text inputs)
    Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
    });

    // Append files, handling each one individually
    if (selectedFoto) {
        data.append("foto", selectedFoto);
    }
    if (selectedAccidentalidad) {
        data.append("accidentalidad", selectedAccidentalidad);
    }
    if (selectedHojaDeVida) {
        data.append("hojaDeVida", selectedHojaDeVida);
    }
    if (selectedAusentismo) {
        data.append("ausentismo", selectedAusentismo);
    }
    if (selectedSuspension) {
      data.append("suspension", selectedSuspension);
    }
    if (selectedOtros) {
        data.append("otros", selectedOtros);
    }

    console.log("FormData:", data);
    try {
        let response;
        if (editingId) {
            response = await axios.put(`http://localhost:5000/cvs/${editingId}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("✅ CV actualizado:", response.data);
        } else {
            response = await axios.post("http://localhost:5000/cvs", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log("✅ CV agregado:", response.data);
        }

        fetchCVs(); // Refresh the CV list
        setFormData({  // Clear form data
            documentoIdentidad: "", nombreEmpleado: "", fechaNacimiento: "", edad: "",
            contacto: "", enfermedadesReportadas: "", direccion: "", telefono: "", celular: "",
            cargo: "", salario: "", fechaIngreso: "", tiempoEmpresa: "", nivelAcademico: "",
            fechaLlamadoAtencion: "", accidentalidad: "", fechaAccidente: "", ARL: "", EPS: "",
            fondoPension: "", cajaCompensacion: "", fechaSuspension: "", fechaAusentismo: "",
        });
        setEditingId(null);       // Reset editing ID
        setSelectedFoto(null);   // Reset selected files
        setSelectedAccidentalidad(null);
        setSelectedHojaDeVida(null);
        setSelectedAusentismo(null);
        setSelectedSuspension(null)
        setSelectedOtros(null);

    } catch (error) {
        console.error("❌ Error al agregar/actualizar CV:", error.response?.data || error);
        alert("Error al agregar/actualizar CV: " + (error.response?.data?.message || ""));
    }
};
  
  

const handleEdit = (cv) => {
  setFormData(cv);
  setEditingId(cv._id);

  // Simulate file objects for all files:
  setSelectedFoto(cv.foto ? { name: cv.foto.split('/').pop() } : null);
  setSelectedAccidentalidad(cv.accidentalidad ? { name: cv.accidentalidad.split('/').pop() } : null);
  setSelectedHojaDeVida(cv.hojaDeVida ? { name: cv.hojaDeVida.split('/').pop() } : null);
  setSelectedAusentismo(cv.ausentismo ? { name: cv.ausentismo.split('/').pop() } : null);
  setSelectedSuspension(cv.suspension ? { name: cv.suspension.split('/').pop() } : null);
  setSelectedOtros(cv.otros ? { name: cv.otros.split('/').pop() } : null);
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
                    <input type="file" name="foto" onChange={(e) => handleFileChange(e, setSelectedFoto)} />
                    
                </div>
                <div>
                    <label>VAccidentalidad</label>
                    <input type="file" name="Vaccidentalidad" onChange={(e) => handleFileChange(e, setSelectedAccidentalidad)} />
                    
                </div>
                <div>
                    <label>Hoja de vida</label>
                    <input type="file" name="hojaDeVida" onChange={(e) => handleFileChange(e, setSelectedHojaDeVida)} />
                    {selectedHojaDeVida && (
                        <div>
                            <p>File selected</p>
                        </div>
                    )}
                </div>
                <div>
                    <label>Ausentismo</label>
                    <input type="file" name="ausentismo" onChange={(e) => handleFileChange(e, setSelectedAusentismo)} />
                    {selectedAusentismo && (
                        <div>
                            <p>File selected</p>
                        </div>
                    )}
                </div>
<div>
    <label>Suspensión:</label>
    <input type="file" name="suspension" onChange={(e) => handleFileChange(e, setSelectedSuspension)} />
    {selectedSuspension && (
        <div>
            <p>File selected</p>
        </div>
    )}
</div>
                <div>
                    <label>Otros</label>
                    <input type="file" name="otros" onChange={(e) => handleFileChange(e, setSelectedOtros)} />
                    {selectedOtros && (
                        <div>
                           <p>File selected</p>
                        </div>
                    )}
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
            
            {/* Corrected href for Suspension and previews for all files: */}
{cv.foto && (
    <a href={`http://localhost:5000/uploads/${cv.foto.split('/').pop()}`} download>Ver Foto</a>
)}
{cv.accidentalidad && (
    <a href={`http://localhost:5000/uploads/${cv.accidentalidad.split('/').pop()}`} download>Ver Accidentalidad</a>
)}
{cv.hojaDeVida && (
    <a href={`http://localhost:5000/uploads/${cv.hojaDeVida.split('/').pop()}`} download>Ver Hoja de Vida</a>
)}
{cv.ausentismo && (
    <a href={`http://localhost:5000/uploads/${cv.ausentismo.split('/').pop()}`} download>Ver Ausentismo</a>
)}
{cv.suspension && (
    <a href={`http://localhost:5000/uploads/${cv.suspension.split('/').pop()}`} download>Ver Suspension</a>
)}
{cv.otros && (
    <a href={`http://localhost:5000/uploads/${cv.otros.split('/').pop()}`} download>Ver Otros</a>
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


