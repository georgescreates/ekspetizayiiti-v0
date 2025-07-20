const rangeMin = document.getElementById('range-min');
const rangeMax = document.getElementById('range-max');
const rangeMinValue = document.getElementById('range-min-value');
const rangeMaxValue = document.getElementById('range-max-value');
const rangeTrack = document.getElementById('range-track');

const suggestionsContainer = document.getElementById('address-suggestions');
const addressInput = document.getElementById('location-panel-address-input');

let microZonesGeoJSON = null;

let allBusinessPoints = [];
let markers = [];

export function updateRangeUI() {
    let min = parseInt(rangeMin.value);
    let max = parseInt(rangeMax.value);

    // Prevent overlap with buffer of 5
    if (min > max - 5) {
        min = max - 5;
        rangeMin.value = min;
    }

    if (max < min + 5) {
        max = min + 5;
        rangeMax.value = max;
    }

    const maxRange = parseInt(rangeMax.max);

    rangeMinValue.textContent = `${min} km`;
    rangeMaxValue.textContent = `${max} km`;

    const percentMin = (min / maxRange) * 100;
    const percentMax = (max / maxRange) * 100;

    rangeTrack.style.left = `${percentMin}%`;
    rangeTrack.style.width = `${percentMax - percentMin}%`;

    // Automatic handle priority
    if (Math.abs(min - max) <= 5) {
        // If handles are close, prioritize the one being dragged
        // Otherwise, decide based on last moved value
    }

    // Remove active-handle class from both
    rangeMin.classList.remove('active-handle');
    rangeMax.classList.remove('active-handle');

    // Add active-handle to the currently dragged one
    if (lastActive === 'min') {
        rangeMin.classList.add('active-handle');
        // Also ensure rangeMin has pointer-events: auto on its thumb
    } else if (lastActive === 'max') {
        rangeMax.classList.add('active-handle');
        // Also ensure rangeMax has pointer-events: auto on its thumb
    }

    // Update the map circle radius
    if (map && map.getSource('radius-circle')) {
        const circleData = turf.circle(circleCenter, max, { steps: 64, units: 'kilometers' });
        map.getSource('radius-circle').setData(circleData);
    }

    updateVisibleMarkers();
}

let lastActive = null;

rangeMin.addEventListener('input', () => {
    lastActive = 'min';
    updateRangeUI();
});

rangeMax.addEventListener('input', () => {
    lastActive = 'max';
    updateRangeUI();
});

// Also consider a 'mouseup' or 'touchend' event listener on the document
// to clear lastActive after the drag ends, so neither is prioritized.
document.addEventListener('mouseup', () => {
    lastActive = null;
    rangeMin.classList.remove('active-handle');
    rangeMax.classList.remove('active-handle');
    // Re-apply default z-index if needed, or let the CSS handle it by default
});
document.addEventListener('touchend', () => {
    lastActive = null;
    rangeMin.classList.remove('active-handle');
    rangeMax.classList.remove('active-handle');
});

let map;
let radiusCircle;
let accessToken = 'pk.eyJ1IjoiZ2Vvcmdlc2NyZWF0ZXMiLCJhIjoiY21id3ZoNm9jMTV4bjJpcHd2bjdhbTF5byJ9.vCV1mCKQPEY6iAWJE470CQ';
let circleCenter = [-72.334, 18.539];

export function initializeMap() {
    mapboxgl.accessToken = accessToken;

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: circleCenter,
        zoom: 11
    });

    fetch('./HTI/gadm41_HTI_4.json')
        .then(res => res.json())
        .then(data => {
            microZonesGeoJSON = data;

            map.addSource('haiti-microzones', {
                type: 'geojson',
                data: data
            });

            map.addLayer({
                id: 'microzones-outline',
                type: 'line',
                source: 'haiti-microzones',
                paint: {
                    'line-color': '#ff5252',
                    'line-width': 3,
                    'line-dasharray': [2, 2]
                },
                layout: {
                    'visibility': 'none'
                }
            });
        });

    map.on('load', async () => {
        // Set default address input to center
        const addressInput = document.getElementById('location-panel-address-input');
        if (addressInput) {
            const center = map.getCenter();
            const address = await reverseGeocode(center.lat, center.lng);
            addressInput.value = address;
        }

        if (microZonesGeoJSON) {
            const defaultZone = microZonesGeoJSON.features.find(f => {
                return turf.booleanPointInPolygon(
                    turf.point(circleCenter),
                    f
                );
            });

            if (defaultZone) {
                map.setLayoutProperty('microzones-outline', 'visibility', 'visible');
                map.setFilter('microzones-outline', ['==', ['get', 'NAME_4'], defaultZone.properties.NAME_4]);
            }
        }

        await loadBusinessData();
        updateVisibleMarkers();

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl());
    });
}

const recenterBtn = document.getElementById('recenter-map-btn');

recenterBtn.addEventListener('click', () => {
    map.flyTo({
        center: circleCenter,
        zoom: 11,
        essential: true
    });
});


export async function reverseGeocode(lat, lng) {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&types=address,place,locality`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            return data.features[0].place_name;
        } else {
            return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; // fallback to coords
        }
    } catch (error) {
        console.error('Reverse geocoding failed:', error);
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
}

export async function geocodeAutocomplete(query) {
    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?autocomplete=true&country=HT&access_token=${accessToken}&types=address,place,locality`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        return data.features; // List of places
    } catch (error) {
        console.error('Autocomplete failed:', error);
        return [];
    }
}

addressInput.addEventListener('input', async (e) => {
    const query = e.target.value;

    if (query.length < 3) {
        suggestionsContainer.classList.add('hidden');
        suggestionsContainer.innerHTML = '';
        return;
    }

    // First check local section match (Level 3)
    const localMatch = searchLocalMicroZone(query);

    if (localMatch) {
        const bbox = turf.bbox(localMatch);
        map.fitBounds(bbox, { padding: 40, duration: 800 });

        const centerPoint = turf.center(localMatch).geometry.coordinates;
        circleCenter = centerPoint;

        map.setLayoutProperty('microzones-outline', 'visibility', 'visible');
        map.setFilter('microzones-outline', ['==', ['get', 'NAME_4'], localMatch.properties.NAME_4]);

        suggestionsContainer.classList.add('hidden');
        suggestionsContainer.innerHTML = '';
        addressInput.value = localMatch.properties.NAME_4;

        return;
    }


    // If no local match, fallback to Mapbox autocomplete
    const suggestions = await geocodeAutocomplete(query);

    suggestionsContainer.innerHTML = '';

    suggestions.forEach(feature => {
        const item = document.createElement('div');
        item.textContent = feature.place_name;
        item.className = 'px-3 py-2 cursor-pointer hover:bg-mercury-100';

        item.addEventListener('click', () => {
            addressInput.value = feature.place_name;
            suggestionsContainer.classList.add('hidden');

            const [lng, lat] = feature.center;
            circleCenter = [lng, lat];

            map.flyTo({ center: circleCenter, zoom: 11 });

            // Find matching section in Level 3 data to outline if available
            if (microZonesGeoJSON) {
                const matchingMicroZone = microZonesGeoJSON.features.find(f => {
                    return turf.booleanPointInPolygon(
                        turf.point(circleCenter),
                        f
                    );
                });

                if (matchingMicroZone) {
                    map.setLayoutProperty('microzones-outline', 'visibility', 'visible');
                    map.setFilter('microzones-outline', ['==', ['get', 'NAME_4'], matchingMicroZone.properties.NAME_4]);
                } else {
                    map.setLayoutProperty('microzones-outline', 'visibility', 'none');
                }
            }

            updateVisibleMarkers();
        });

        suggestionsContainer.appendChild(item);
    });

    if (suggestions.length > 0) {
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
});

const resetAddressInputBtn = document.getElementById('location-reset-address-input-btn');
resetAddressInputBtn.addEventListener('click', () => {
    addressInput.value = '';
    addressInput.focus();
});

export function searchLocalMicroZone(query) {
    if (!microZonesGeoJSON) return null;

    const normalizedQuery = query.trim().toLowerCase();

    return microZonesGeoJSON.features.find(f => {
        return f.properties.NAME_4.toLowerCase() === normalizedQuery;
    });
}

async function loadBusinessData() {
    const response = await fetch('./src/json/notebook-business.json');
    const data = await response.json();
    allBusinessPoints = data;
    window.allBusinessPoints = data;
}

function updateVisibleMarkers() {
    // Clear previous markers
    markers.forEach(marker => marker.remove());
    markers = [];

    const maxDistance = parseInt(rangeMax.value); // in km
    let matchCount = 0;

    allBusinessPoints.forEach(biz => {
        const bizPoint = turf.point([biz.coordinates.longitude, biz.coordinates.latitude]);
        const centerPoint = turf.point(circleCenter);
        const distance = turf.distance(centerPoint, bizPoint, { units: 'kilometers' });

        if (distance <= maxDistance) {
            matchCount++;

            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = '#3196a9';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';

            const popup = new mapboxgl.Popup({ offset: 15 })
                .setDOMContent(createCustomPopup(biz));

            const marker = new mapboxgl.Marker(el)
                .setLngLat([biz.coordinates.longitude, biz.coordinates.latitude])
                .setPopup(popup)
                .addTo(map);

            markers.push(marker);
        }
    });

    // Update the result count dynamically
    const resultCountElement = document.getElementById('location-panel-result-count');
    if (resultCountElement) {
        resultCountElement.textContent = matchCount;
    }
}

function createCustomPopup(biz) {
    const container = document.createElement('div');
    container.className = 'custom-popup flex flex-col gap-y-4 font-body text-body rounded-md';

    container.innerHTML = `
        <div class="map-popup-preview-container w-full aspect-video rounded-md bg-mercury-100"></div>
        <div class="flex flex-col w-full h-auto gap-y-1">
            <h3 class="font-bold text-[1.15rem]">${biz.name}</h3>
            <p class="text-[0.875rem] text-mercury-400">${biz.address}</p>
        </div>
        <p>${biz.description}</p>
        <button class="popup-action-btn w-full h-12 flex items-center font-semibold justify-center bg-woodsmoke-950 text-woodsmoke-50 cursor-pointer rounded-md" data-biz="${biz.name}">Jwenn Plis Enfòmasyon</button>
    `;

    return container;
}

window.map = map;
