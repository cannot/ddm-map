const express = require("express");
const path = require("path");

const PORT = 12010;
const STATIC_ASSETS_PATH = path.resolve(`${__dirname}/../../static`);

const app = express();

// Serve front end assets which have been built by webpack
// app.use("/static", express.static(STATIC_ASSETS_PATH));
app.use("/Gis",express.static(path.resolve(__dirname, "../../", "build")));

// งานสำรวจหลังออกปฏิบัติงานภาคสนาม
app.get("/Gis/Map113-LD-A", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map113-LD-A.html"));
});

// งานสำรวจก่อนออกปฏิบัติงานภาคสนาม
app.get("/Gis/Map113-LD-B", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map113-LD-B.html"));
});

// งานซ่อมท่อหลังออกปฏิบัติงานภาคสนาม
app.get("/Gis/Map113-LR-A", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map113-LR-A.html"));
});

// งานซ่อมท่อก่อนออกปฏิบัติงานภาคสนาม
app.get("/Gis/Map113-LR-B", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map113-LR-B.html"));
});

// FM 139 - แผนที่แสดงตำแหน่งงานภาคสนาม
app.get("/Gis/Map139-FM", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map139-FM.html"));
});

// NFA 255 - คาดการณ์อัตราน้ำสูญเสีย
app.get("/Gis/Map255-NFA", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map255-NFA.html"));
});

// PM 275 - แผนที่แรงดันน้ำ
app.get("/Gis/Map275-PM", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map275-PM.html"));
});

// AM 450 - แผนที่เส้นท่อ
app.get("/Gis/Map450-AM", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map450-AM.html"));
});

// WLM 602 - แผนที่เส้นท่อประธาน
app.get("/Gis/Map602-WLM", (req, res) => {
	res.sendFile(path.resolve(__dirname, "../../build", "Map602-WLM.html"));
});

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}.\n\nLoad it in your browser at http://localhost:${PORT}`))
