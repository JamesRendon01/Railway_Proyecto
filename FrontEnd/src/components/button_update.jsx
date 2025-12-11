import { useNavigate } from "react-router-dom";

export default function ButtonUpdate({ id }) {

    const navigate = useNavigate(); 
    const handleUpdate = () =>{
        navigate(`/update-planes/${id}`);
    }

    return (
        <button
            onClick={handleUpdate}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 border-2 border-black font-bold"
        >
            Editar
        </button>
    );
}