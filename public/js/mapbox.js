// console.log('Hello from the client side');

// dataset.locations for "data-locations"
const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoiemFyY2siLCJhIjoiY2ttbnRtd2NnMGt3ZjJucGVhb3I1b3dwbSJ9.iMpPMIlYT92ZGx7nQ2jqbQ';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/zarck/cknthj8sf03wa17l8f0q30y2p', // customized in mapbox account, in styles
    // center: [-118.113491, 34.111745],
    // zoom: 10, // starting zoom,
    // interactive: false // look like an image
});

// disable map zoom when using scroll
map.scrollZoom.disable();

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl({showCompass: false}));

// Define boundaries to group all points
const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    //Create Marker
    const el = document.createElement('div');
    el.className = 'marker'; // see the class in style.css

    // Create popup -- THIS DOES NOT SHOW THE POPUP AT LOAD, BUT ON CLICK
    // const popup = new mapboxgl.Popup({
    //     closeButton: false,
    //     anchor : 'top'
    // }).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)

    //Add Marker
    new mapboxgl.Marker({
        element: el,
        anchor: 'bottom' // bottom of the pin image which is located at the exact coordinates location
    })
        .setLngLat(loc.coordinates)
        // .setPopup(popup) -- for above solution -- THIS DOES NOT SHOW THE POPUP AT LOAD, BUT ON CLICK
        .addTo(map);

    new mapboxgl.Popup({
        closeOnClick: false,
        closeButton: false,
        anchor : 'top'
    })
        .setLngLat(loc.coordinates)
        .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
        .addTo(map);

    //Extends map bounds to include current location (basically define the size of the aera with all points)
    bounds.extend(loc.coordinates)
})

// fit the map to see all points Marker
map.fitBounds(bounds, {
    padding: { // add padding
        top: 200,
        bottom: 200,
        left: 100,
        right: 100
    }
})