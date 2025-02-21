import { useEffect, useState } from "react";
import axios from "axios";
import "../styles.css"



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
    <div className="p-8 bg-gray-100 min-h-screen">
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestión de Hojas de Vida</h1>

            {/* Search */}
            <div className="mb-8 flex items-center gap-3">
                <select
                    className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                >
                    <option value="documento">Buscar por Documento</option>
                    <option value="nombre">Buscar por Nombre</option>
                </select>
                <input
                    type="text"
                    className="border p-2 rounded-md w-64 focus:ring-2 focus:ring-blue-500"
                    placeholder={`Ingrese ${searchType === "documento" ? "el documento" : "el nombre"}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:ring-2 focus:ring-green-300" onClick={handleSearch}>
                    Buscar
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md ml-2 focus:ring-2 focus:ring-blue-300" onClick={handleShowAll}>
                    Mostrar Todas
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                {Object.keys(formData).map((key) => (
                    <div key={key} className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">{key.replace(/([A-Z])/g, " $1").toUpperCase()}</label>
                        <input
                            type="text"
                            className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500"
                            name={key}
                            value={formData[key]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}

                {[
                    { name: "foto", label: "Subir Foto" },
                    { name: "accidentalidad", label: "Accidentalidad" },
                    { name: "hojaDeVida", label: "Hoja de Vida" },
                    { name: "ausentismo", label: "Ausentismo" },
                    { name: "suspension", label: "Suspensión" },
                    { name: "otros", label: "Otros" },
                ].map((file, index) => (
                    <div key={index} className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">{file.label}</label>
                        <input type="file" name={file.name} onChange={(e) => handleFileChange(e, eval(`setSelected${file.name.charAt(0).toUpperCase() + file.name.slice(1)}`))} />
                    </div>
                ))}

                <button type="submit" className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-md w-full focus:ring-2 focus:ring-purple-300">
                    {editingId ? "Actualizar" : "Agregar"}
                </button>
            </form>

            {/* CV List */}
            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-800">Hojas de Vida Registradas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cvs.length === 0 ? (
                    <p className="text-gray-500">No se encontraron resultados.</p>
                ) : (
                    cvs.map((cv, index) => (
                        <div key={index} className="border p-6 rounded-lg shadow-md bg-white">
                            {Object.keys(cv).map(
                                (key) =>
                                    key !== "_id" &&
                                    key !== "__v" && (
                                        <p key={key} className="mb-2 text-gray-700">
                                            <strong className="text-gray-800">{key.replace(/([A-Z])/g, " $1").toUpperCase()}:</strong> {cv[key]}
                                        </p>
                                    )
                            )}

                            {/* File Links */}
                            {[
                                { key: "foto", label: "Ver Foto" },
                                { key: "accidentalidad", label: "Ver Accidentalidad" },
                                { key: "hojaDeVida", label: "Ver Hoja de Vida" },
                                { key: "ausentismo", label: "Ver Ausentismo" },
                                { key: "suspension", label: "Ver Suspensión" },
                                { key: "otros", label: "Ver Otros" },
                            ].map((file, i) =>
                                cv[file.key] ? (
                                    <a
                                        key={i}
                                        href={`http://localhost:5000/uploads/${cv[file.key].split('/').pop()}`}
                                        download
                                        className="block text-blue-600 hover:text-blue-800 underline mt-1"
                                    >
                                        {file.label}
                                    </a>
                                ) : null
                            )}

                            <div className="mt-4 flex justify-center">
                                <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md mr-2 focus:ring-2 focus:ring-yellow-300" onClick={() => handleEdit(cv)}>
                                    Editar
                                </button>
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md focus:ring-2 focus:ring-red-300"
                                    onClick={() => handleDelete(cv._id)}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
);
}