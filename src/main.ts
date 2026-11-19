import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./style.css";
import * as maptilersdk from "@maptiler/sdk";
import { CitySelectControl } from "./CitySelectControl";

const apiKey = import.meta.env.MAPTILER_API_KEY;
if (!apiKey) {
	throw new Error(
		"MAPTILER_API_KEY is missing — set it in .env (see vite.config.ts envPrefix)",
	);
}

maptilersdk.config.apiKey = apiKey;
const map = new maptilersdk.Map({
	container: "map", // container's id or the HTML element to render the map
	style: maptilersdk.MapStyle.STREETS,
});

map.addControl(
	new CitySelectControl([
		{ name: "Tbilisi" },
		{ name: "Yerevan" },
		{ name: "Tainan" },
		{ name: "Cebu" },
		{ name: "Mexico City" },
		{ name: "Sarajevo" },
		{ name: "Hangzhou" },
		{ name: "Gamvik" },
	]),
	"top-left",
);

export { map };
