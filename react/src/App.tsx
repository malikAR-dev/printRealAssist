import "./App.css";
import axios from "axios";

function App() {
  const printPDF = async () => {
    try {
      const response = await axios.get("http://localhost:8080/generate-pdf", {
        responseType: "arraybuffer",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank");
    } catch (error) {
      console.error("Error fetching or opening the PDF:", error);
    }
  };

  return (
    <div className="App">
      <button onClick={() => printPDF()}>Print Button</button>
    </div>
  );
}

export default App;
