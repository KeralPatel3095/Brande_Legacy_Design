const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const m = html.match(/<style>\s*([\s\S]*?)\s*<\/style>/);
if (!m) {
  console.error("No <style> block found");
  process.exit(1);
}
const css = m[1];
const footerStart = css.indexOf("/* Magazine-style footer");
const mainPadding = css.indexOf("main{padding:0}");
if (footerStart === -1 || mainPadding === -1) {
  console.error("Markers missing", { footerStart, mainPadding });
  process.exit(1);
}
const headPart = css.slice(0, mainPadding).trimEnd();
const footerOnly = css.slice(footerStart).trimEnd();
const out = [headPart, "", footerOnly, "", "main{padding:0}", ""].join("\n");
fs.writeFileSync(path.join(__dirname, "site-layout.css"), out);
console.log("Wrote site-layout.css", out.length, "bytes");
