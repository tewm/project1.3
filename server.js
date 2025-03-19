const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const OPENROUTESERVICE_API_KEY = 'YO5b3ce3597851110001cf624873f0cd24934c451887c693e3a326d5d8';  // Replace with your actual ORS API key

app.use(express.static('public'));

// ✅ Predefine POIs for each route (London + NYC)
const routePOIs = [
    // London Routes
    [
        { name: "Buckingham Palace", coords: [51.5014, -0.1419], icon: "🏰", img: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Buckingham_Palace_March_2009.JPG", description: "Official residence of the British monarch." },
        { name: "Big Ben", coords: [51.5007, -0.1246], icon: "🕰️", img: "https://upload.wikimedia.org/wikipedia/commons/4/47/Big_Ben_2012.JPG", description: "Renowned clock tower in London." },
        { name: "London Eye", coords: [51.5033, -0.1195], icon: "🎡", img: "https://upload.wikimedia.org/wikipedia/commons/2/26/London_Eye_from_Westminster_Bridge.jpg", description: "Famous Ferris wheel on the River Thames." }
    ],
    [
        { name: "St Paul's Cathedral", coords: [51.5138, -0.0984], icon: "⛪", img: "https://upload.wikimedia.org/wikipedia/commons/2/2e/St_Paul%27s_Cathedral_from_the_River_Thames.jpg", description: "Iconic cathedral in the heart of London." },
        { name: "Shakespeare's Globe", coords: [51.5080, -0.0977], icon: "🎭", img: "https://upload.wikimedia.org/wikipedia/commons/9/9c/Shakespeare%27s_Globe_Theatre_in_London.jpg", description: "Historic theater dedicated to Shakespeare's plays." },
        { name: "London Bridge", coords: [51.5079, -0.0877], icon: "🌉", img: "https://upload.wikimedia.org/wikipedia/commons/4/4d/London_Bridge_in_2012.JPG", description: "Famous bridge spanning the River Thames." }
    ],
    [
        { name: "Tower Bridge", coords: [51.5055, -0.0754], icon: "🌉", img: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Tower_Bridge_London_2012.jpg", description: "Iconic bascule and suspension bridge." },
        { name: "Salt Tower", coords: [51.5080, -0.0775], icon: "🛡️", img: "https://upload.wikimedia.org/wikipedia/commons/d/d7/Tower_of_London_-_Salt_Tower.jpg", description: "Part of the Tower of London, used for various purposes." },
        { name: "Tower of London", coords: [51.5081, -0.0759], icon: "🏰", img: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Tower_of_London_viewed_from_the_River_Thames.jpg", description: "Historic castle and former prison." }
    ],
    // NYC Routes
    [
        { name: "Empire State Building", coords: [40.7484, -73.9857], icon: "🏙️", img: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Empire_State_Building_from_the_Top_of_the_Rock.jpg", description: "Iconic skyscraper with observation decks." },
        { name: "Times Square", coords: [40.7580, -73.9855], icon: "🌆", img: "https://upload.wikimedia.org/wikipedia/commons/4/47/Times_Square_%28June_2019%29.jpg", description: "Vibrant entertainment and commercial hub." },
        { name: "Rockefeller Center", coords: [40.7587, -73.9787], icon: "🏢", img: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Rockefeller_Center_New_York_City_2017.jpg", description: "Famous complex with shops and observatory." },
        { name: "St. Patrick's Cathedral", coords: [40.7585, -73.9760], icon: "⛪", img: "https://upload.wikimedia.org/wikipedia/commons/3/32/St_Patrick%27s_Cathedral%2C_NYC.jpg", description: "Neo-Gothic Catholic cathedral in NYC." }
    ],
    [
        { name: "SoHo", coords: [40.7233, -74.0020], icon: "🛍️", img: "https://upload.wikimedia.org/wikipedia/commons/7/7f/SoHo_NYC_street.jpg", description: "Famous district known for shopping and art." },
        { name: "One World Trade Center", coords: [40.7127, -74.0134], icon: "🏢", img: "https://upload.wikimedia.org/wikipedia/commons/5/5e/One_World_Trade_Center_%28cropped%29.jpg", description: "Tallest building in the Western Hemisphere." },
        { name: "Statue of Liberty Viewpoint", coords: [40.6892, -74.0445], icon: "🗽", img: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Statue_of_Liberty_7.jpg", description: "Iconic statue symbolizing freedom and democracy." }
    ]
    // Tokyo Routes
    [
        { name: "Tokyo Tower", coords: [35.6895, 139.6917], icon: "🗼", img: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Tokyo_Tower_and_Skyline.jpg", description: "Iconic landmark offering panoramic city views." },
        { name: "Zojoji Temple", coords: [35.6586, 139.7454], icon: "⛩️", img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Zojoji_Temple_and_Tokyo_Tower.jpg", description: "Historic Buddhist temple near Tokyo Tower." },
        { name: "Senso-ji Temple", coords: [35.7101, 139.8107], icon: "🏯", img: "https://upload.wikimedia.org/wikipedia/commons/7/72/Sensoji_Temple.jpg", description: "Famous ancient temple with a vibrant shopping street." }
    ]
    // Rome Routes
    [
        { name: "Colosseum", coords: [41.8902, 12.4922], icon: "🏛️", img: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Colosseum_in_Rome%2C_Italy_-_April_2007.jpg", description: "Ancient Roman amphitheater." },
            { name: "Roman Forum", coords: [41.8925, 12.4853], icon: "🏺", img: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Roman_Forum_view.jpg", description: "Historic center of ancient Rome." },
            { name: "Trevi Fountain", coords: [41.9009, 12.4833], icon: "⛲", img: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Trevi_Fountain_-_Rome.jpg", description: "Famous Baroque fountain." },
            { name: "Pantheon", coords: [41.8986, 12.4769], icon: "🏛️", img: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Pantheon_in_Rome.jpg", description: "Ancient Roman temple turned church." }
    ]
];

// ✅ Walking routes (coordinates) for London and NYC
const coordinates = [
    // London Routes
    [
        [51.5014, -0.1419],
        [51.5007, -0.1246],
        [51.5033, -0.1195]
    ],
    [
        [51.5138, -0.0984],
        [51.5080, -0.0977],
        [51.5079, -0.0877]
    ],
    [
        [51.5055, -0.0754],
        [51.5080, -0.0775],
        [51.5081, -0.0759]
    ],
    // NYC Routes
    [
        [40.7484, -73.9857],
        [40.7580, -73.9855],
        [40.7587, -73.9787],
        [40.7585, -73.9760]
    ],
    [
        [40.7233, -74.0020],
        [40.7127, -74.0134],
        [40.6892, -74.0445]
    ]
    // Tokyo Routes
    [
        [35.6895, 139.6917],  // Tokyo Tower
        [35.6586, 139.7454],  // Zojoji Temple
        [35.7101, 139.8107]   // Senso-ji Temple
    ]
    // Rome Routes
    [
        [41.8902, 12.4922],  // Colosseum
        [41.8925, 12.4853],  // Roman Forum
        [41.9009, 12.4833],  // Trevi Fountain
        [41.8986, 12.4769]   // Pantheon
    ]
];

// ✅ Fetch walking routes from OpenRouteService
const routePromises = coordinates.map(async (routeCoords) => {
    console.log(`Fetching route for: ${JSON.stringify(routeCoords)}`);
    const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/walking/geojson',
        {
            coordinates: routeCoords.map(coord => [coord[1], coord[0]])  // ORS requires lon/lat format
        },
        {
            headers: {
                'Authorization': OPENROUTESERVICE_API_KEY,
                'Content-Type': 'application/json'
            }
        }
    );

    const routeData = response.data;
    const distanceMiles = routeData.features[0].properties.summary.distance / 1609.34;  // Meters to miles

    return {
        name: `Route ${coordinates.indexOf(routeCoords) + 1}`,
        route: routeData,
        distanceMiles: distanceMiles.toFixed(2),
        pois: getPOIsForRoute(routeCoords)
    };
});

app.get('/routes', async (req, res) => {
    try {
        const routes = await Promise.all(routePromises);
        res.json(routes);
    } catch (error) {
        console.error('Error fetching routes from OpenRouteService:', error);
        res.status(500).send('Error fetching routes');
    }
});

// ✅ Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
