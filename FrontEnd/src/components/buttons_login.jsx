import { Link } from "react-router-dom";
export default function ButtonsLogin() {
    return (
            //Contenedor principal
            <div className="flex gap-5">
                {/*Boton de "Iniciar Sesion" */}
                <Link
                    to="/turista"
                    className="w-48 h-16 sm:w-40 sm:h-14 font-bold bg-white border-2 border-black rounded-2xl flex text-black text-xl  items-center justify-center no-underline transitions-colors">
                    Iniciar Sesion
                </Link>

                {/*Boton de "Registrarse" */}
                <Link
                    to="/registro"
                    className="w-48 h-16 sm:w-40 sm:h-14 font-bold bg-white border-2 border-black rounded-2xl flex text-black text-xl items-center justify-center no-underline transitions-colors">
                    Registrarse
                </Link>
            </div>
    );
}