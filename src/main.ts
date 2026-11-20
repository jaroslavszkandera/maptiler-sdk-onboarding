import "@maptiler/sdk/dist/maptiler-sdk.css";
import "./style.css";
import * as maptilersdk from "@maptiler/sdk";

const apiKey = import.meta.env.MAPTILER_API_KEY;
if (!apiKey) {
	throw new Error(
		"MAPTILER_API_KEY is missing — set it in .env (see vite.config.ts envPrefix)",
	);
}

maptilersdk.config.apiKey = apiKey;

const map = new maptilersdk.Map({
	container: "map",
	style: maptilersdk.MapStyle.STREETS,
	center: [14.42, 50.087],
	zoom: 3,
});

const hue = (t: number, offset = 0, s = 85, l = 55) =>
	`hsl(${(t * 60 + offset) % 360}, ${s}%, ${l}%)`;

map.on("load", () => {
	const layers = map.getLayersOrder();
	console.table(layers.map((id) => ({ id, type: map.getLayer(id)?.type })));

	const has = (id: string) => layers.includes(id);
	const roadLines = [
		"Highway line",
		"Major road line",
		"Minor road line",
	].filter(has);
	const labels = layers.filter((id) => map.getLayer(id)?.type === "symbol");

	const animate = (now: number) => {
		const t = now / 1000; // seconds

		if (has("Water")) map.setPaintProperty("Water", "fill-color", hue(t));
		if (has("Background"))
			map.setPaintProperty(
				"Background",
				"background-color",
				hue(t, 180, 60, 20),
			);

		if (has("Forest")) map.setPaintProperty("Forest", "fill-color", hue(t, 90));
		if (has("Residential"))
			map.setPaintProperty(
				"Residential",
				"fill-opacity",
				0.4 + 0.4 * Math.sin(t * 2),
			);

		roadLines.forEach((id, i) => {
			map.setPaintProperty(id, "line-color", hue(t, 120 + i * 40, 100, 60));
			map.setPaintProperty(id, "line-width", 2 + 1.5 * Math.sin(t * 3 + i)); // pulse
		});

		for (const id of labels) {
			map.setPaintProperty(id, "text-color", hue(t, 240, 100, 70));
			map.setPaintProperty(id, "text-halo-color", hue(t, 60, 100, 15));
		}

		requestAnimationFrame(animate);
	};

	requestAnimationFrame(animate);
});

export { map };
