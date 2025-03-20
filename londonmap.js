document.addEventListener("DOMContentLoaded", async function () {
    // Initialize the map with a view over both London, NYC, Tokyo
    const map = L.map('map').setView([51.5074, -0.1278], 5); // Zoomed out to show both cities

    // Add OpenStreetMap basemap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // ✅ Fetch routes from the server
    const response = await fetch('/routes');
    const routes = await response.json();

    // ✅ Load London boroughs GeoJSON
    const londonBoroughResponse = await fetch('london-boroughs_1179.geojson');
    const londonBoroughData = await londonBoroughResponse.json();

    // ✅ Load NYC neighborhoods GeoJSON
    const nycNeighborhoodResponse = await fetch('nyc_zipcode.json');
    const nycNeighborhoodData = await nycNeighborhoodResponse.json();

    // ✅ Load NOLA neighborhoods GeoJSON
    const nolaNeighborhoodResponse = await fetch('new-orleans.geojson');
    const nolaNeighborhoodData = await nolaNeighborhoodResponse.json();

    // ✅ Create layer groups for boroughs
    const londonLayer = L.geoJSON(londonBoroughData, {
        style: {
            color: 'gray',
            weight: 1,
            opacity: 0.5
        }
    }).addTo(map);

    const nycLayer = L.geoJSON(nycNeighborhoodData, {
        style: {
            color: 'purple',
            weight: 1,
            opacity: 0.5
        }
    }).addTo(map);

    const NOLA_Layer = L.geoJSON(nolaNeighborhoodData, {
        style: {
            color: 'green',
            weight: 1,
            opacity: 0.5
        }
    }).addTo(map);

    // ✅ Create layer groups for each route
    const routeLayers = [];
    routes.forEach(route => {
        const routeLayer = L.geoJSON(route.route, {
            style: {
                color: 'blue',
                weight: 4
            }
        }).addTo(map);

        // ✅ Add POIs with popups
        route.pois.forEach(poi => {
            const poiMarker = L.marker(poi.coords, {
                icon: L.divIcon({
                    className: 'custom-icon',
                    html: poi.icon
                })
            });

            // Check if the POI is in London or NYC and find its borough/neighborhood
            const borough = getBoroughForLandmark(poi.coords, londonBoroughData) ||
                            getBoroughForLandmark(poi.coords, nycNeighborhoodData) || "Unknown";

            // ✅ Popup with images and borough/neighborhood name
            poiMarker.bindPopup(`
                <b>${poi.name}</b><br>
                <img src="${poi.img}" width="150"><br>
                ${poi.description}<br>
                <b>Borough/Neighborhood:</b> ${borough}
            `).addTo(map);

            // ✅ Update the sidebar on click
            poiMarker.on('click', () => {
                const sidebar = document.getElementById('landmark-info');
                sidebar.innerHTML = `
                    <h3>${poi.name}</h3>
                    <img src="${poi.img}" alt="${poi.name}" width="200">
                    <p>${poi.description}</p>
                    <p><strong>Borough/Neighborhood:</strong> ${borough}</p>
                    <p><strong>Distance:</strong> ${route.distanceMiles} miles</p>
                `;
            });
        });

        routeLayers.push(routeLayer);
    });

    // ✅ Toggleable layers for London and NYC
    const overlayMaps = {
        "London Boroughs": londonLayer,
        "NYC Neighborhoods": nycLayer,
        "Tokyo Neighborhoods": tokyoLayer,
        "Rome Neighborhoods": romeLayer,
        "NOLA Neighborhoods": nolaLayer
    };

    routes.forEach((route, index) => {
        overlayMaps[route.name] = routeLayers[index];
    });

    L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);
});

// ✅ Function to determine which borough/neighborhood a POI is in
function getBoroughForLandmark(coords, geojsonData) {
    const latLng = L.latLng(coords[0], coords[1]);

    for (const feature of geojsonData.features) {
        const borough = feature.properties.name || feature.properties.neighborhood;
        const boroughPolygon = L.geoJSON(feature.geometry);

        if (boroughPolygon.getBounds().contains(latLng)) {
            return borough;
        }
    }

    return null;  // If no match is found
}
