// Import from map-ui.js if you're using modules (optional)
// import { allBusinessPoints, map } from './map-ui.js';

// If not using modules, ensure allBusinessPoints & map are global (e.g., window.allBusinessPoints, window.map)

// quest-form.js

export function initQuestForm() {
    const input = document.getElementById('quest-form-input');

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = "quest-suggestions";
    suggestionsContainer.className = "absolute bg-white shadow-md rounded-md z-50 w-full max-h-[200px] overflow-y-auto top-[120%]";
    input.parentNode.appendChild(suggestionsContainer);

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        suggestionsContainer.innerHTML = '';

        if (query.length < 2) {
            suggestionsContainer.classList.add('hidden');
            return;
        }

        const matches = window.allBusinessPoints.filter(biz =>
            biz.name.toLowerCase().includes(query) ||
            biz.type.toLowerCase().includes(query) ||
            biz.description.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            const noResult = document.createElement('div');
            noResult.className = "px-3 py-2 text-woodsmoke-400";
            noResult.textContent = "Pa gen rezilta...";
            suggestionsContainer.appendChild(noResult);
        }

        matches.slice(0, 5).forEach(biz => {
            const item = document.createElement('div');
            item.className = "px-3 py-2 cursor-pointer hover:bg-mercury-100";
            item.textContent = biz.name;

            item.addEventListener('click', () => {
                input.value = biz.name;
                suggestionsContainer.classList.add('hidden');

                window.map.flyTo({
                    center: [biz.coordinates.longitude, biz.coordinates.latitude],
                    zoom: 15
                });

                new mapboxgl.Popup()
                    .setLngLat([biz.coordinates.longitude, biz.coordinates.latitude])
                    .setHTML(`
                        <h3>${biz.name}</h3>
                        <p>${biz.description}</p>
                        <p><strong>Adrès:</strong> ${biz.address}</p>
                        <p><strong>Telefòn:</strong> ${biz.phone}</p>
                    `)
                    .addTo(window.map);
            });

            suggestionsContainer.appendChild(item);
        });

        suggestionsContainer.classList.remove('hidden');
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.classList.add('hidden');
        }
    });
}
