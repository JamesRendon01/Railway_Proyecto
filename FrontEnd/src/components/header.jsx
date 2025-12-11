//Contiene unos props definidos:
//  *titulo: El texto que mostrara como encabezado
//  *rol: Define que alementos adicionales se renderizan
export default function Header({ titulo, rol }) {
  return (
    //Contenedor principal header
    //se concadena con rol
    <header className={`w-full flex relative ${rol}`}>

      {/* Caso: Turista o Admin */}
      {(rol === "turista" || rol === "admin") && (
        <>
          {/* Logo de la empresa */}
          <img className="w-38 h-18 sm:w-15 sm:h-10 sm:mt-0 md:w-28 md:h-38 xl:w-40 xl:h-20" src="/img/logo.png" alt="logo" />
          {/* Imagen animada del avion */}
          <img className="w-39 h-18 sm:w-15 sm:h-10 sm:mt-0 sm:mr-0 md:w-28 md:h-18 xl:w-40 xl:h-20" src="/img/avion.gif" alt="logo" />
        </>
      )}

      {/* Caso: inicio */}
      {rol === "inicio" && (
        <>

          {/* Logo */}
          <img
            className="w-55 h-30 sm:w-25 sm:h-15 lg:w-35 lg:h-25 rounded-full"
            src="/img/logo.png"
            alt="logo"
          />

        </>
      )}

      {/* Titulo del header */}
      <h1 className={'text-6xl font-bold text-black sm:text-3xl sm:ml-0 md:text-4xl md:mt-3 md:ml-10 lg:text-5xl lg:ml-25 xl:text-6xl xl:ml-40'}>
        {titulo}
      </h1>
    </header>
  );
}
