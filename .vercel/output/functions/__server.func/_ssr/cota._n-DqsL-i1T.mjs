import { I as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as TerritorioHost } from "./territorio-host-gz0a2uOB.mjs";
import { n as Route$10 } from "./router-CBvvf761.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cota._n-DqsL-i1T.js
var import_jsx_runtime = require_jsx_runtime();
function CotaPage() {
	const { n } = Route$10.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerritorioHost, {
		pagina: "cota",
		cota: n
	});
}
//#endregion
export { CotaPage as component };
