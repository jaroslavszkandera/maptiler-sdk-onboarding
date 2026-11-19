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
	zoom: 12,
});

const coordsEl = document.getElementById("coords") as HTMLPreElement;

const marker = new maptilersdk.Marker({ draggable: true, color: "#e53935" })
	.setLngLat(map.getCenter())
	.addTo(map);

const format = ({ lng, lat }: maptilersdk.LngLat) =>
	`${lng.toFixed(6)}, ${lat.toFixed(6)}`;

const cityEl = document.getElementById("city") as HTMLInputElement;

let lookupId = 0;

async function findNearestCity(
	lngLat: maptilersdk.LngLat,
): Promise<string | null> {
	const res = await maptilersdk.geocoding.reverse([lngLat.lng, lngLat.lat], {
		types: ["municipality", "subregion"],
	});
	const byType = (t: "municipality" | "subregion") =>
		res.features.find((f) => f.place_type.includes(t))?.text;
	console.log(res);
	return byType("municipality") ?? byType("subregion") ?? null;
}

async function onCoordinates(lngLat: maptilersdk.LngLat): Promise<void> {
	coordsEl.textContent = format(lngLat);
	const id = ++lookupId;
	cityEl.value = "Looking up…";

	try {
		const city = await findNearestCity(lngLat);
		if (id !== lookupId) return; // a newer drop will discard stale req
		cityEl.value = city ?? "No city nearby";
	} catch (err) {
		if (id !== lookupId) return;
		console.error("Reverse geocoding failed:", err);
		cityEl.value = "Lookup failed";
	}
}

marker.on("drag", () => {
	coordsEl.textContent = format(marker.getLngLat());
});

marker.on("dragend", () => void onCoordinates(marker.getLngLat()));

void onCoordinates(marker.getLngLat());

export { map, marker };
