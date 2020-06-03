
export const displayMaps = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoic2h1YmhhbXNheGVuYSIsImEiOiJja2FsMGFjcjAwbHN0MnlvNjU2eHI3NXdzIn0.q6tiDzR1HuNk3fOq3wktSA';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/shubhamsaxena/ckal0vktk0q1b1ill2rffsc0u',
        scrollZoom: false
        // center: [-115.172652,
        //     36.110904],
        // zoom: 4
    });


    const bounds = new mapboxgl.LngLatBounds()
    locations.forEach(loc => {
        //create and add marker
        const el = document.createElement('div');
        el.className = 'marker'

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(loc.coordinates).addTo(map);
        // add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}:${loc.description} </p>`)
            .addTo(map);
        //extend map bound include current location
        bounds.extend(loc.coordinates)

    });
    //zooms and fit
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }

    })
}


