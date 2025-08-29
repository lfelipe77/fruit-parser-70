import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

function* walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (p.endsWith(".js")) yield p;
  }
}

let found = false;
for (const file of walk("dist/assets")) {
  const txt = readFileSync(file, "utf8");
  if (txt.includes("require(")) {
    console.error(`❌ Found "require(" in ${file}`);
    found = true;
  }
}
if (found) {
  console.error("Build contains CommonJS require(). Fail.");
  process.exit(1);
} else {
  console.log("✅ No require() found in built assets.");
}