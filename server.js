require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(express.static('public'));

// Function to fetch walking routes from OpenRouteService
const fetchRoute = async (start, end) => {
    const url = `https://api.openrouteservice.org/v2/directions/foot-walking/geojson`;
    
    const body = {
        coordinates: [
            [parseFloat(start[1]), parseFloat(start[0])],
            [parseFloat(end[1]), parseFloat(end[0])]
        ]
    };

    try {
        const response = await axios.post(url, body, {
            headers: {
                'Authorization': process.env.ORS_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching route:', error);
        throw error;
    }
};

// Route to fetch multiple walking routes
app.get('/routes', async (req, res) => {
    const routes = [
        { start: [51.5007, -0.1246], end: [51.5081, -0.0759] },  // Big Ben → Tower of London
        { start: [51.5014, -0.1419], end: [51.5074, -0.1657] },  // Buckingham Palace → Hyde Park
        { start: [51.5033, -0.1195], end: [51.5194, -0.1270] }   // London Eye → British Museum
    ];

    try {
        const results = await Promise.all(routes.map(route => 
            fetchRoute(route.start, route.end)
        ));
        
        res.json(results);
    } catch (error) {
        res.status(500).send('Error fetching routes');
    }
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
