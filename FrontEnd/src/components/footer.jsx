import { Twitter, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <div className="bg-black/40 w-full h-60">
            <div className='flex items-center justify-center gap-60'>
                <div className="flex flex-col font-general text-1xl text-center gap-y-4">
                    <p className=''>
                        ¡Siguenos en nuestras redes!
                    </p>
                    <div className="flex gap-5 justify-center">
                        <Twitter size={40} />
                        <Instagram size={40} />
                        <Facebook size={40} />
                    </div>
                    <p>
                        escapadeparfaite@gmail.com
                    </p>
                </div>

                <div className="flex flex-col text-center gap-y-4">
                    <h3 className="font-bold">
                        SOBRE ESCAPADE PARFAITE
                    </h3>
                    <p className="text-1xlm">
                        ¡Tu viaje empieza aquí! Explora nuestras guías de viaje y<br /> consejos para tu próxima aventura.
                    </p>
                </div>
                <div className="w-40 h-auto">
                    <img src="/img/footer.png" alt="footer" />
                </div>
            </div>
            <div className="border-t-2 border-black flex items-center justify-center gap-60 pt-3 text-1xl font-bold">
                <p>© 2025 EscapadeParafaite</p>
                <a href="/pdf/TerminosyCondiciones.pdf" target="_blank" rel="noopener noreferrer" className="cursor-pointer hover:underline">Términos y condiciones</a>
            </div>
        </div>
    );
}