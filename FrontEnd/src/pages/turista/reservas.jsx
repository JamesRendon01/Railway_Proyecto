import Nav from "../../components/nav.jsx";
import FormReservas from "../../components/form_reservas.jsx";
import Footer from "../../components/footer.jsx";
export default function Reservas() {

    return (
        <div>
            <Nav
                showFilter={false}
                showTitle={false}
                showNavbar={true}
                showSearch={false}
                showButtonsLogin={false}
                showTitleReservas={true}
            />
            <div className="flex justify-center mt-30 mb-20">
            <FormReservas/>
            </div>

            <div>
                <Footer />
            </div>
        </div>
    );
}
