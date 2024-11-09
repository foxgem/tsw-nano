import Footer from "~/components/Footer";
import Header from "~/components/Header";

function MainPage() {
  return (
    <div className="w-[350px] h-auto min-h-[246px] flex flex-col pb-12">
      <Header />
      <div>TSW-NANO</div>
      <Footer className="mt-auto" />
    </div>
  );
}

export default MainPage;
