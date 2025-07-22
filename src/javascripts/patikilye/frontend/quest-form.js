import { circleCenter } from "./map-ui.js"

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
            noResult.textContent = "0 korespondans";
            suggestionsContainer.appendChild(noResult);
        }

        matches.slice(0, 5).forEach(biz => {
            const item = document.createElement('div');
            item.className = "px-3 py-2 cursor-pointer hover:bg-mercury-100";
            item.textContent = biz.name;

            item.addEventListener('click', () => {
                input.value = biz.name;
                suggestionsContainer.classList.add('hidden');

                if (!biz.coordinates || biz.coordinates.longitude === undefined || biz.coordinates.latitude === undefined) {
                    alert(`Biznis "${biz.name}" pa gen lokalizasyon pou kat la.`);
                    return; // Prevent crashing
                }

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

export function populateHeaderCards() {
    const container = document.getElementById('header-cards-container');
    container.innerHTML = '';

    if (!window.allBusinessPoints || window.allBusinessPoints.length === 0) {
        console.warn('No business data to populate header cards.');
        return;
    }

    const promotedBusinesses = window.allBusinessPoints.filter(biz => {
        return biz.promoted && biz.promoted.value === true;
    });

    const distanceFiltered = promotedBusinesses.filter(biz => {
        if (!biz.coordinates || biz.coordinates.longitude === undefined || biz.coordinates.latitude === undefined) {
            return false;
        }

        const bizPoint = turf.point([biz.coordinates.longitude, biz.coordinates.latitude]);
        const centerPoint = turf.point(circleCenter);
        const distance = turf.distance(centerPoint, bizPoint, { units: 'kilometers' });

        return distance <= 10;
    });

    const dataToUse = distanceFiltered.length > 0 ? distanceFiltered : window.allBusinessPoints;

    const shuffled = [...dataToUse].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    selected.forEach(biz => {
        const card = document.createElement('div');
        card.className = 'header-card h-auto w-auto rounded-md flex flex-col gap-y-2';

        card.innerHTML = `
            <div class="header-card-about-user-container w-full h-auto flex flex-col gap-y-2">
                <div class="card-user-datas-container w-full h-auto flex flex-row flex-1">
                    <a href="#" class="user-datas-link-wrapper flex flex-row w-full h-full gap-x-4">
                        <div class="card-user-profile-container w-[3.5rem] h-[3.5rem] rounded-full bg-green-200 border-4 border-white"></div>
                        <div class="user-datas-infos-container flex flex-col justify-between h-full w-auto flex-1">
                            <div class="user-datas-display-name-role-container flex flex-col">
                                <h4 class="user-display-name text-xl font-bold max-w-[8rem] truncate">${biz.name}</h4>
                                <h5 class="user-role max-w-[8rem] truncate">${biz.type}</h5>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

