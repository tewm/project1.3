document.addEventListener("DOMContentLoaded", async function() {
        // Function to fetch walking routes
async function getWalkingRoutes() {
    try {
        const response = await fetch('/routes');  // Fetch from the server
        const routes = await response.json();
        return routes;
    } catch (error) {
        console.error('Error fetching walking routes:', error);
        return [];
    }
}

// Initialize the map
document.addEventListener("DOMContentLoaded", async function () {
    var map = L.map('map').setView([51.5074, -0.1278], 13);  // London center

    // Add OpenStreetMap basemap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Layer groups for the walking routes
    var route1Layer = L.layerGroup();
    var route2Layer = L.layerGroup();
    var route3Layer = L.layerGroup();

    // Fetch and display the routes
    const routes = await getWalkingRoutes();
    
    if (routes.length === 3) {
        // Add Route 1
        L.geoJSON(routes[0], {
            style: { color: 'blue', weight: 4 }
        }).addTo(route1Layer);

        // Add Route 2
        L.geoJSON(routes[1], {
            style: { color: 'green', weight: 4 }
        }).addTo(route2Layer);

        // Add Route 3
        L.geoJSON(routes[2], {
            style: { color: 'red', weight: 4 }
        }).addTo(route3Layer);
    }

    // Add layers to the map
    route1Layer.addTo(map);
    route2Layer.addTo(map);
    route3Layer.addTo(map);

    // Layer control to toggle the routes
    var overlayMaps = {
        "Route 1: Big Ben → Tower of London": route1Layer,
        "Route 2: Buckingham Palace → Hyde Park": route2Layer,
        "Route 3: London Eye → British Museum": route3Layer
    };

    L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);
});
