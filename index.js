const express = require("express");
const crypto = require("crypto");
const app = express();
const PORT = 3000;


const negotiateContent = (req, res, next) => {
    const accept = req.headers.accept;
    if (!accept) return res.status(406).send("Not Acceptable");
    next();
};


app.get("/info", negotiateContent, (req, res) => {
    const accept = req.headers.accept;
    const data = { mensaje: "Bienvenido a la API" };
    
    if (accept.includes("application/json")) {
        res.json(data);
    } else if (accept.includes("application/xml")) {
        res.type("application/xml").send(`<mensaje>${data.mensaje}</mensaje>`);
    } else if (accept.includes("text/html")) {
        res.type("text/html").send(`<h1>${data.mensaje}</h1>`);
    } else {
        res.status(406).send("Not Acceptable");
    }
});


app.get("/preferencia", (req, res) => {
    const acceptHeader = req.headers.accept || "";
    const options = acceptHeader.split(",").map(item => {
        const [type, qValue] = item.split(";q=");
        return { type: type.trim(), q: qValue ? parseFloat(qValue) : 1 };
    }).sort((a, b) => b.q - a.q);

    const data = { mensaje: "Respuesta con negociación de calidad" };
    for (const option of options) {
        if (option.type === "application/json") {
            return res.json(data);
        } else if (option.type === "application/xml") {
            return res.type("application/xml").send(`<mensaje>${data.mensaje}</mensaje>`);
        } else if (option.type === "text/html") {
            return res.type("text/html").send(`<h1>${data.mensaje}</h1>`);
        }
    }
    res.status(406).send("Not Acceptable");
});


app.get("/cache", (req, res) => {
    res.set({
        "Cache-Control": "max-age=30",
        "Expires": new Date(Date.now() + 30 * 1000).toUTCString(),
        "Pragma": "no-cache"
    });
    res.send("Esta respuesta está cacheada por 30 segundos.");
});


app.get("/etag", (req, res) => {
    const data = "Contenido con ETag";
    const etag = crypto.createHash("md5").update(data).digest("hex");
    
    if (req.headers["if-none-match"] === etag) {
        return res.status(304).end();
    }
    res.set("ETag", etag);
    res.send(data);
});


app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en el puerto http://localhost:${PORT}`);
});