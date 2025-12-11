// src/pages/Reservas.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import NavDashAdmin from "../../components/navDashAdmin.jsx";
import Contador from "../../components/contador.jsx";
import CrudTable from "../../components/tablaAdmin.jsx";
import ButtonDelete from "../../components/button_eliminar.jsx";
import SearchBar from "../../components/search.jsx";
import ProgressCircle from "../../components/barraCarga.jsx"; // Animación de carga
import { message, Modal, Form, Select, DatePicker, Button } from "antd";
import moment from "moment";

export default function Reservas() {
  const [totales, setTotales] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState(""); // 🔹 Filtro de estado
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [form] = Form.useForm();
  const pageSize = 5;

  // Cargar totales
  useEffect(() => {
    axios
      .get("http://localhost:8000/dashboard/reservas")
      .then((res) => setTotales(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Cargar reservas (según el filtro)
  const fetchReservas = async () => {
    try {
      const url = filtroEstado
        ? `http://localhost:8000/reserva/listar_reservas?estado=${filtroEstado}`
        : "http://localhost:8000/reserva/listar_reservas";

      const res = await axios.get(url);
      setReservas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, [filtroEstado]);

  // Eliminar reserva
  const handleDeleteReserva = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/reserva/${id}`);
      setReservas((prev) => prev.filter((r) => r.id !== id));
      message.success("Reserva eliminada correctamente");
    } catch (error) {
      console.error(error);
      message.error("Error al eliminar la reserva");
    }
  };

  // Abrir modal de edición
  const handleEditReserva = (reserva) => {
    setSelectedReserva(reserva);
    setModalVisible(true);
    form.setFieldsValue({
      estado: reserva.disponibilidad,
      fecha: moment(reserva.fecha_reserva),
    });
  };

  // Guardar cambios de edición
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        disponibilidad: values.estado,
        fecha_reserva: values.fecha.format("YYYY-MM-DD"),
      };
      await axios.put(`http://localhost:8000/reserva/${selectedReserva.id}`, payload);
      message.success("Reserva actualizada correctamente");
      setModalVisible(false);
      setSelectedReserva(null);
      fetchReservas(); // recargar lista
    } catch (error) {
      console.error(error);
      message.error("Error al actualizar la reserva");
    }
  };

  // Filtrado local (por texto)
  const filteredReservas = reservas.filter((reserva) => {
    const search = query.toLowerCase();
    return (
      reserva.turista_nombre?.toLowerCase().includes(search) ||
      reserva.plan_nombre?.toLowerCase().includes(search)
    );
  });

  // Mientras carga
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <ProgressCircle size={80} color="primary" />
        <p className="text-gray-600 text-lg">Cargando información de reservas...</p>
      </div>
    );

  if (!totales)
    return <p className="text-center text-red-500">Error al cargar los datos</p>;

  // Tarjetas de totales
  const items = [
    { titulo: "Total Reservas", valor: totales.total_reservas },
    { titulo: "Reservas Hoy", valor: totales.reservas_hoy },
    {
      titulo: "Total Ingresos",
      valor: `$${totales.total_ingresos.toLocaleString("es-CO")}`,
    },
  ];

  // Encabezados de tabla
  const headers = [
    { key: "turista_nombre", label: "Turista" },
    { key: "plan_nombre", label: "Plan" },
    {
      key: "fecha_reserva",
      label: "Fecha Reserva",
      render: (val) => new Date(val).toLocaleDateString(),
    },
    { key: "numero_personas", label: "Número de Personas" },
    { key: "disponibilidad", label: "Estado" },
    { key: "costo_final", label: "Total" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64">
        <NavDashAdmin />
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-4xl font-semibold">Reservas</h1>

          {/* 🔹 Controles de filtro y búsqueda */}
          <div className="flex gap-4 items-center">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border border-gray-400 rounded-md p-2"
            >
              <option value="">Todos</option>
              <option value="Confirmada">Confirmadas</option>
              <option value="Cancelada">Canceladas</option>
              <option value="Finalizada">Finalizadas</option>
            </select>

            <SearchBar query={query} setQuery={setQuery} />
          </div>
        </header>

        <section>
          {/* Contadores */}
          <Contador items={items} />

          <hr className="border-t-2 border-black my-6 w-full" />

          {/* Tabla de reservas */}
          <CrudTable
            headers={headers}
            data={filteredReservas}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={filteredReservas.length}
            onPageChange={setCurrentPage}
            renderActions={(reserva) => (
              <div className="flex justify-center gap-2">
                <Button
                  type="primary"
                  onClick={() => handleEditReserva(reserva)}
                >
                  Editar
                </Button>
                <ButtonDelete
                  label="Eliminar"
                  onConfirm={() => handleDeleteReserva(reserva.id)}
                />
              </div>
            )}
          />
        </section>

        {/* Modal de edición */}
        <Modal
          title="Editar Reserva"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={handleSaveEdit}
          okText="Guardar"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Estado"
              name="estado"
              rules={[{ required: true, message: "Seleccione un estado" }]}
            >
              <Select>
                <Select.Option value="Confirmada">Confirmada</Select.Option>
                <Select.Option value="Cancelada">Cancelada</Select.Option>
                <Select.Option value="Finalizada">Finalizada</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Fecha de reserva"
              name="fecha"
              rules={[{ required: true, message: "Seleccione una fecha" }]}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
          </Form>
        </Modal>
      </main>
    </div>
  );
}
