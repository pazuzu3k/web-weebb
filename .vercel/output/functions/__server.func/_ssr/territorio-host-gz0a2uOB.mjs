import { o as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/territorio-host-gz0a2uOB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TerritorioHost({ pagina, cota, sesion }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!ref.current) return;
		let alive = true;
		let stop;
		import("./territorio-sBNdWgYm.mjs").then((mod) => {
			if (!alive || !ref.current) return;
			const maybe = mod.boot(ref.current);
			if (typeof maybe === "function") stop = maybe;
		});
		return () => {
			alive = false;
			stop?.();
		};
	}, [
		pagina,
		cota,
		sesion
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		id: "territorio",
		ref,
		"data-pagina": pagina,
		"data-cota": cota ?? "",
		"data-sesion": sesion ?? "",
		"data-strato": pagina === "cota" ? "vacio" : ""
	});
}
//#endregion
export { TerritorioHost as t };
