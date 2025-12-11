import { useState } from "react";

export default function TermsModal({ isOpen, onClose, onAccept }) {
    const [checked, setChecked] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-fondo rounded-2xl shadow-lg p-6 max-w-lg w-full relative">
                <h2 className="text-xl mb-4">TÉRMINOS Y CONDICIONES</h2>
                <div className="h-64 overflow-y-auto mb-4 border p-4 rounded">
                    <p>
                        Términos y Condiciones ESCAPADE PARFAITE.
                    </p>
                    <p className="mt-2">
                        Bienvenido/a a Escapade Parfaite, una plataforma que le permitirá conocer nuevos
                        destinos turísticos. Al acceder, navegar o utilizar nuestros servicios, el usuario acepta los
                        siguientes términos y condiciones. Si no está de acuerdo con alguna parte de este documento,
                        se recomienda abstenerse de utilizar la plataforma.
                        La plataforma tiene como finalidad facilitar la conexión entre personas interesadas en
                        experiencias turísticas rurales y los proveedores de dichos servicios. A través de nuestro sitio
                        web, los Usuarios pueden consultar planes disponibles, realizar y gestionar sus reservas,
                        gestionar pagos y cancelaciones, y agregar sus planes deseados al panel favoritos.
                        Para acceder a ciertos servicios, el Usuario deberá registrarse proporcionando
                        información personal, completa y actualizada. Es responsabilidad exclusiva del Usuario
                        mantener la confidencialidad de sus credenciales de acceso. La plataforma se reserva el
                        derecho de suspender o eliminar cuentas en caso de uso indebido, fraude o incumplimiento de
                        estos términos.
                        Las reservas están sujetas a disponibilidad y a las condiciones específicas de cada plan
                        dependiendo del proveedor del servicio. El Usuario deberá realizar el pago conforme a las
                        modalidades establecidas. Las políticas de cancelación y reembolso son definidas por cada
                        Proveedor, y la plataforma actuará como intermediario para facilitar dichos procesos, sin
                        asumir responsabilidad directa por decisiones o incumplimientos de los Proveedores.
                        La plataforma no garantiza la calidad, seguridad ni cumplimiento de los servicios
                        ofrecidos por los Proveedores. Cualquier reclamo relacionado con la experiencia turística
                        deberá ser dirigido directamente al Proveedor correspondiente. La plataforma no será
                        responsable por daños, pérdidas o inconvenientes derivados del uso de los servicios
                        contratados.
                        Todo el contenido presente en la plataforma, incluyendo textos, imágenes, logotipos,
                        diseños y funcionalidades, está protegido por derechos de propiedad intelectual. Queda
                        prohibida su reproducción, distribución o modificación sin autorización.
                        La información personal del Usuario será tratada conforme a la legislación vigente en
                        Colombia y a nuestra Política de Privacidad. El Usuario podrá solicitar la eliminación de sus
                        datos personales en cualquier momento, conforme a los procedimientos establecidos.
                        La plataforma se reserva el derecho de modificar estos términos y condiciones en
                        cualquier momento. Las modificaciones serán publicadas en el sitio web y entrarán en vigor
                        desde su fecha de publicación.
                    </p>
                </div>

                <label className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        className="mr-2"
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                    />
                    Acepto los términos y condiciones
                </label>

                <div className="flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        className={`px-4 py-2 rounded text-white ${checked ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
                            }`}
                        onClick={() => {
                            if (checked) {
                                onAccept();
                                onClose();
                            }
                        }}
                        disabled={!checked}
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}
