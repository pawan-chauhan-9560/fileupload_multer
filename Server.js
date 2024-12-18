const path = require("path");
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const status=require('express-status-monitor');
const zlib=require("zlib");

const app = express();
// checking the spike of memory
app.use(status());

//Converting file in zip
fs.createReadStream("./uploads/sample.txt").pipe(zlib.createGzip().pipe(fs.createWriteStream("./uploads/sample.zip")))

const PORT = process.env.PORT || 8000;
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "_" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
});

app.use(express.urlencoded({ extended: false }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.get("/", (req, res) => {
  return res.render("homepage", { fileUrl: null });
});
//Example of read file
app.get("/sample", (req,res) => {
  const  stream =fs.createReadStream("./uploads/sample.txt","utf-8");
    stream.on('data',(chunk)=>res.write(chunk));
    stream.pipe(res);
});

app.post("/upload", upload.single("profileImage"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  console.log(req.body);
  console.log(req.file);

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.render("homepage", { fileUrl });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
