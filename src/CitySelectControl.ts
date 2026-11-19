import type { IControl } from "@maptiler/sdk";
import * as maptilersdk from "@maptiler/sdk";

export type City = {
	name: string;
	zoom?: number;
};

export class CitySelectControl implements IControl {
	private map?: maptilersdk.Map;
	private container?: HTMLElement;
	private marker?: maptilersdk.Marker;
	private readonly cities: City[];

	constructor(cities: City[]) {
		this.cities = cities;
	}

	onAdd(map: maptilersdk.Map): HTMLElement {
		this.map = map;

		const container = document.createElement("div");
		container.className =
			"maplibregl-ctrl maplibregl-ctrl-group city-select-ctrl";

		const select = document.createElement("select");
		select.setAttribute("aria-label", "Choose a city");
		select.append(new Option("Choose a city...", "", true, true));
		select.options[0].disabled = true;
		this.cities.forEach((city, i) =>
			select.append(new Option(city.name, String(i))),
		);
		select.addEventListener("change", () => {
			this.goTo(this.cities[Number(select.value)]).catch((err) =>
				console.error("Geocoding failed:", err),
			);
		});

		container.append(select);
		this.container = container;
		return container;
	}

	onRemove(): void {
		this.marker?.remove();
		this.container?.remove();
		this.marker = undefined;
		this.container = undefined;
		this.map = undefined;
	}

	getDefaultPosition(): maptilersdk.ControlPosition {
		return "top-left";
	}

	private async goTo(city: City) {
		if (!this.map) return;

		const result = await maptilersdk.geocoding.forward(city.name, {
			limit: 1,
			autocomplete: false,
			fuzzyMatch: false,
			language: "en",
		});
		const feature = result.features[0];
		if (!feature || !this.map) return;

		const lngLat = feature.center as [number, number];
		this.map.flyTo({
			center: lngLat,
			zoom: city.zoom ?? 11,
			speed: 2,
			curve: 1,
			essential: true,
		});
		if (this.marker) {
			this.marker.setLngLat(lngLat);
		} else {
			this.marker = new maptilersdk.Marker({
				element: createCityIcon(),
				anchor: "bottom",
			})
				.setLngLat(lngLat)
				.addTo(this.map);
		}
	}
}

function createCityIcon(): HTMLElement {
	const el = document.createElement("div");
	el.className = "city-marker";
	el.innerHTML = `
		<svg width="36" height="46" viewBox="0 0 36 46" aria-hidden="true">
			<path d="M18 45C18 45 34 28.5 34 17A16 16 0 0 0 2 17C2 28.5 18 45 18 45Z"
				fill="#6a4c93" stroke="#fff" stroke-width="2"/>
			<path d="M18 8l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"
				fill="#ffd166"/>
		</svg>`;
	return el;
}
