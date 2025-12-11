import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

// Props:
//   * formData: objeto con los valores del formulario (correo, contraseña)
//   * handlecChange: funcion para manejar cambios en los inputs
//   * handleSubmit: funcion que se ejecuta al enviar el formulario
//   * rol: determina si es login de "turista" o "Administrador"

export default function LoginForm({
  formData,
  handleChange,
  handleSubmit,
  rol,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    // Contenedor del formulario
    // Estilos y pocision del formulario
    <div
      className={`flex w-96 h-96  bg-nav text-white p-8 rounded-lg z-30 border-3 absolute top-35 border-black md:w-90 md:h-80 xl:w-102 xl:h-90
            ${rol === 'admin' ? 'sm:h-85 sm:ml-8 sm:top-70  md:ml-18 md:top-25 lg:ml-55 xl:ml-90 xl:mt-10' : ''}
            ${rol === 'turista' ? 'sm:left-15 sm:top-70 md:ml-70 md:top-25 lg:left-50 xl:left-100 xl:top-35' : ''}`}
    >
      {/* Formuario de login */}
      <form
        className="text-black text-lg font-bold font-general"
        onSubmit={handleSubmit}
      >
        {/* Campo para ingresar el correo */}
        <label>Correo:</label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          required
          className="w-full p-2 rounded-md text-black mt-2 bg-gray-200 focus:outline-none md:h-8"
        />

        {/* Campo para ingresar la contraseña */}
        <div>
          <label className="mt-4 md:mt-2">Contraseña:</label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            required
            className="w-full p-2 rounded text-black mt-2 bg-gray-200 focus:outline-none md:h-8"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-15 top-34 transform -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Caso: turista */}
        {rol === 'turista' && (
          <>
            {/* Enlace para recuperacion de contraseña */}
            <p className="text-center mt-10 text-sm md:mt-5">
              <Link to="/ingresar_correo" className="underline text-black">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
            {/* Enlace para registrarse */}
            <p className="text-center mt-2 text-sm">
              <Link to="/registro" className="underline text-black">
                ¿No tienes cuenta? Regístrate
              </Link>
            </p>
          </>
        )}

        {/* Caso: Administrador */}
        {rol === 'admin' && (
          <>
            {/* Enlace para recuperar contraseña */}

            <p className="text-center mt-15 text-sm sm:mt-5">
              <Link to="/ingresar_correo" className="underline text-black">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </>
        )}

        {/* Boton para enviar el formulario */}
        <button
          type="submit"
          className="bg-fondo border-2 border-black px-4 py-2 rounded-md hover:bg-gray-300 transition-colors ml-25 mt-8 md:mt-5 absolute sm:left-32 md:left-30 xl:left-38"
        >
          Continuar
        </button>
      </form>
    </div>
  )
}
