const express = require("express");
const PDFDocument = require("pdfkit");
const moment = require("moment");
const fs = require("fs");
const svgToPDF = require("svg-to-pdfkit");
const https = require("https");
const axios = require("axios");
const cors = require("cors");

const { logo, location } = require("./utils/exportSvgs");

const app = express();

app.use(cors());
app.use(express.json());
const port = 8080;

const createGraph = async (myCallback) => {
  let response;

  try {
    response = await axios.get(
      "https://api.usa.gov/crime/fbi/cde/arrest/state/AK/all?from=2015&to=2020&API_KEY=iiHnOKfno2Mgkt5AynpvPpUQTEyxE77jo1RU8PIv"
    );
  } catch (error) {
    console.error("Error fetching or opening the PDF:", error);
  }

  const years = response.data?.data?.map((year) => year.data_year);
  const frauds = response.data?.data?.map((fraud) => fraud.Fraud);

  const graphImageUrl = `https://quickchart.io/apex-charts/render?config={ chart: { type: 'line' }, series: [{ name: 'sales', data: [${frauds}]}], yaxis: {labels: {style: {fontSize: '15px'}}, title: {text: 'Frauds', style: {fontSize: '15px'}}}, xaxis: { categories: [${years}],labels: {style: {fontSize: '15px'}}}}`;

  https.get(graphImageUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error(
        `Failed to load the image. Status code: ${response.statusCode}`
      );
      return;
    }

    let imageData = Buffer.alloc(0);

    response.on("data", (chunk) => {
      imageData = Buffer.concat([imageData, chunk]);
    });

    response.on("end", () => {
      fs.writeFileSync("lineGraph.jpg", imageData);
      myCallback();
    });
  });
};

app.get("/generate-pdf", async (_req, res) => {
  const doc = new PDFDocument({ margin: 15 });
  doc.pipe(res);

  const headerLine = () => {
    const x1 = 15;
    const y1 = 30;
    const x2 = 596;
    const y2 = 30;

    const colorStops = [
      { color: "#005DFF", offset: 0 },
      { color: "#21DDFF", offset: 1 },
    ];

    const gradient = doc.linearGradient(x1, y1, x2, y2);
    for (const stop of colorStops) {
      gradient.stop(stop.offset, stop.color);
    }

    doc.stroke(gradient);

    doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(2).stroke();
  };

  const footerLine = () => {
    const x1 = 15;
    const y1 = 745;
    const x2 = 596;
    const y2 = 745;

    const colorStops = [
      { color: "#005DFF", offset: 0 },
      { color: "#21DDFF", offset: 1 },
    ];

    const gradient = doc.linearGradient(x1, y1, x2, y2);
    for (const stop of colorStops) {
      gradient.stop(stop.offset, stop.color);
    }

    doc.stroke(gradient);

    doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(2).stroke();
  };

  const locationLine = () => {
    const x1 = 65;
    const y1 = 347;
    const x2 = 596;
    const y2 = 347;

    const colorStops = [
      { color: "#005DFF", offset: 0 },
      { color: "#21DDFF", offset: 1 },
    ];

    const gradient = doc.linearGradient(x1, y1, x2, y2);
    for (const stop of colorStops) {
      gradient.stop(stop.offset, stop.color);
    }

    doc.stroke(gradient);

    doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(2).stroke();
  };

  const addHeader = () => {
    svgToPDF(doc, `${logo}`, 15, 10);
    doc.fontSize(12).text("RealAssist.AI", 30, 12);
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("123 Main Street, Dover, NH 03820-4667", { align: "right" }, 13);
    headerLine();
  };

  const addFooter = () => {
    footerLine();

    doc
      .fontSize(9)
      .fillColor("blue")
      .font("Helvetica-Bold")
      .text(`Report Generated on ${moment().format("LL")}`, 15, 760)
      .underline(15, 762, 165, 10, { color: "#0000FF" })
      .link(15, 762, 165, 10, "");

    doc
      .fontSize(9)
      .fillColor("black")
      .text(
        "RealAssist Property Report | Page 1 of 25",
        { align: "right" },
        760
      );
  };

  const addGraphSection = () => {
    svgToPDF(doc, `${location}`, 15, 340);
    doc.fontSize(10).font("Helvetica").text("Crime", 30, 342);
    locationLine();
  };

  const createPDF = () => {
    addHeader();
    addGraphSection();
    doc.roundedRect(15, 365, 580, 370, 20).fill("#eef1f2");
    doc
      .fontSize(13)
      .font("Helvetica")
      .fillColor("#4615ff")
      .text("Burglary", 25, 380);
    doc.image("lineGraph.jpg", 30, 410, { width: 550, height: 310 });
    addFooter();
    doc.end();
  };

  createGraph(createPDF);
});

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
