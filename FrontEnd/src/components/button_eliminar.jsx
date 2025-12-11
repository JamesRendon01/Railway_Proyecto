// components/ButtonDelete.jsx
import { Modal, message } from "antd";
import { ExclamationCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

export default function ButtonDelete({ onConfirm, label = "Eliminar" }) {
  const showConfirm = () => {
    Modal.confirm({
      title: `¿Seguro que deseas ${label.toLowerCase()}?`,
      icon: <ExclamationCircleOutlined style={{ color: "orange" }} />,
      content: "Esta acción es irreversible.",
      okText: "Sí, eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk() {
        // Confirmación final
        Modal.confirm({
          title: "⚠️ Confirmación final",
          icon: <CloseCircleOutlined style={{ color: "red" }} />,
          content: `¿Confirmas ${label.toLowerCase()} definitivamente?`,
          okText: "Eliminar",
          okType: "danger",
          cancelText: "Cancelar",
          onOk() {
            if (onConfirm) onConfirm();
          },
        });
      },
    });
  };

  return (
    <button
      onClick={showConfirm}
      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 border-2 border-black font-bold"
    >
      {label}
    </button>
  );
}
