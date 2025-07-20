// export function toggleDomainDropdown() {
//     const domainPanel = document.getElementById('domain-dropdown-panel');

//     if (domainPanel.classList.contains('hidden')) {
//         domainPanel.classList.remove('hidden');
//         domainPanel.classList.add('flex');
//     } else {
//         domainPanel.classList.add('hidden');
//         domainPanel.classList.remove('flex');
//     }
// }

// export function toggleLocationDropdown() {
//     const locationPanel = document.getElementById('location-dropdown-panel');

//     if (locationPanel.classList.contains('hidden')) {
//         locationPanel.classList.remove('hidden');
//         locationPanel.classList.add('flex');
//     } else {
//         locationPanel.classList.add('hidden');
//         locationPanel.classList.remove('flex');
//     }
// }

export function openOnlyThisPanel(panelId) {
    const allPanels = ['domain-dropdown-panel', 'location-dropdown-panel'];
    const allButtons = {
        'domain-dropdown-panel': document.querySelector('#domain-dropdown-btn .quest-form-dropdown-btn-chevron-container'),
        'location-dropdown-panel': document.querySelector('#location-dropdown-btn .quest-form-dropdown-btn-chevron-container'),
    };

    allPanels.forEach(id => {
        const panel = document.getElementById(id);
        const chevron = allButtons[id];
        if (!panel) return;

        if (id === panelId) {
            if (!panel.classList.contains('hidden')) {
                // Do nothing if the clicked panel is already open
                return;
            }

            // Open this panel
            panel.classList.remove('hidden');
            panel.classList.add('flex');

            if (chevron) {
                chevron.classList.add('rotate');
            }
        } else {
            // Close other panels
            panel.classList.add('hidden');
            panel.classList.remove('flex');

            if (allButtons[id]) {
                allButtons[id].classList.remove('rotate');
            }
        }
    });
}


export function setupCustomCheckboxes() {
    const options = document.querySelectorAll('.domain-option, .domain-option-label');

    options.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        if (!checkbox) return; // Skip non-checkbox options

        const checkmark = option.querySelector('svg');
        const checkmarkBox = option.querySelector('.checkmark, .domain-option-checkmark');

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                checkmark.classList.remove('hidden');
                checkmarkBox.classList.add('bg-woodsmoke-950');
            } else {
                checkmark.classList.add('hidden');
                checkmarkBox.classList.remove('bg-woodsmoke-950');
            }
        });
    });
}

export function setupDomainPanelSwitching() {
    const tabs = document.querySelectorAll('.dropdown-panel-tab');
    const panels = document.querySelectorAll('.domain-panel');

    tabs.forEach((tab, index) => {
        const tabCheckbox = tab.querySelector('input[type="checkbox"]');
        const tabCheckmark = tab.querySelector('svg');
        const tabCheckmarkBox = tab.querySelector('.checkmark');

        // Handle checkbox change for "select all"
        tabCheckbox.addEventListener('change', () => {
            const currentPanel = panels[index];
            const subOptions = currentPanel.querySelectorAll('input[type="checkbox"]');

            subOptions.forEach(subCheckbox => {
                subCheckbox.checked = tabCheckbox.checked;
                subCheckbox.dispatchEvent(new Event('change'));

                // Disable/enable the checkbox based on "Select All"
                subCheckbox.disabled = tabCheckbox.checked;

                if (tabCheckbox.checked) {
                    subCheckbox.closest('label').classList.add('opacity-50', 'cursor-not-allowed');
                } else {
                    subCheckbox.closest('label').classList.remove('opacity-50', 'cursor-not-allowed');
                }

                // Find the corresponding SVG checkmark in the option
                const optionLabel = subCheckbox.closest('label');
                if (optionLabel) {
                    const subCheckmark = optionLabel.querySelector('svg');
                    const subCheckmarkBox = optionLabel.querySelector('.domain-option-checkmark');

                    if (subCheckbox.checked) {
                        if (subCheckmark) subCheckmark.classList.remove('hidden');
                        if (subCheckmarkBox) subCheckmarkBox.classList.add('bg-woodsmoke-950');
                    } else {
                        if (subCheckmark) subCheckmark.classList.add('hidden');
                        if (subCheckmarkBox) subCheckmarkBox.classList.remove('bg-woodsmoke-950');
                    }
                }
            });

            // Toggle tab visual state
            if (tabCheckbox.checked) {
                tab.setAttribute('data-selected', 'true');
                tabCheckmark.classList.remove('hidden');
                tabCheckmarkBox.classList.add('bg-woodsmoke-950');
            } else {
                tab.setAttribute('data-selected', 'false');
                tabCheckmark.classList.add('hidden');
                tabCheckmarkBox.classList.remove('bg-woodsmoke-950');
            }

            updateTabCount(index);
        });

        // Handle panel switching when clicking the tab (not the checkbox)
        tab.addEventListener('click', (e) => {
            const isCheckmarkClick = e.target.closest('.checkmark') || e.target.type === 'checkbox';

            if (!isCheckmarkClick) {
                e.preventDefault();

                panels.forEach((panel, idx) => {
                    if (idx === index) {
                        panel.classList.remove('hidden');
                        panel.classList.add('flex');
                    } else {
                        panel.classList.add('hidden');
                        panel.classList.remove('flex');
                    }
                });
            }
        });
    });
}

// export function setupLocationPanelSwitching() {
//     const tabs = document.querySelectorAll('.location-dropdown-tab');
//     const panels = document.querySelectorAll('.location-panel');

//     tabs.forEach((tab, index) => {
//         const tabCheckbox = tab.querySelector('input[type="checkbox"]');
//         const tabCheckmark = tab.querySelector('svg');
//         const tabCheckmarkBox = tab.querySelector('.checkmark');

//         tabCheckbox.addEventListener('change', () => {
//             const currentPanel = panels[index];
//             const subOptions = currentPanel.querySelectorAll('input[type="checkbox"]');

//             subOptions.forEach(subCheckbox => {
//                 subCheckbox.checked = tabCheckbox.checked;
//                 subCheckbox.dispatchEvent(new Event('change'));
//                 subCheckbox.disabled = tabCheckbox.checked;

//                 if (tabCheckbox.checked) {
//                     subCheckbox.closest('label').classList.add('opacity-50', 'cursor-not-allowed');
//                 } else {
//                     subCheckbox.closest('label').classList.remove('opacity-50', 'cursor-not-allowed');
//                 }

//                 const optionLabel = subCheckbox.closest('label');
//                 const subCheckmark = optionLabel.querySelector('svg');
//                 const subCheckmarkBox = optionLabel.querySelector('.location-option-checkmark');

//                 if (subCheckbox.checked) {
//                     subCheckmark.classList.remove('hidden');
//                     subCheckmarkBox.classList.add('bg-woodsmoke-950');
//                 } else {
//                     subCheckmark.classList.add('hidden');
//                     subCheckmarkBox.classList.remove('bg-woodsmoke-950');
//                 }
//             });

//             if (tabCheckbox.checked) {
//                 tab.setAttribute('data-selected', 'true');
//                 tabCheckmark.classList.remove('hidden');
//                 tabCheckmarkBox.classList.add('bg-woodsmoke-950');
//             } else {
//                 tab.setAttribute('data-selected', 'false');
//                 tabCheckmark.classList.add('hidden');
//                 tabCheckmarkBox.classList.remove('bg-woodsmoke-950');
//             }

//             updateLocationTabCount(index);
//         });

//         tab.addEventListener('click', (e) => {
//             const isCheckmarkClick = e.target.closest('.checkmark') || e.target.type === 'checkbox';

//             if (!isCheckmarkClick) {
//                 e.preventDefault();

//                 panels.forEach((panel, idx) => {
//                     if (idx === index) {
//                         panel.classList.remove('hidden');
//                         panel.classList.add('flex');
//                     } else {
//                         panel.classList.add('hidden');
//                         panel.classList.remove('flex');
//                     }
//                 });
//             }
//         });
//     });
// }

function updateTabCount(panelIndex) {
    const panels = document.querySelectorAll('.domain-panel');
    const tabs = document.querySelectorAll('.dropdown-panel-tab');

    const currentPanel = panels[panelIndex];
    const selectedCount = currentPanel.querySelectorAll('input[type="checkbox"]:checked').length;

    const countElement = tabs[panelIndex].querySelector('.tab-selected-count');
    if (countElement) {
        if (selectedCount > 0) {
            countElement.classList.remove('hidden');
            countElement.classList.add('flex');
            countElement.textContent = selectedCount;
        } else {
            countElement.textContent = '';
            countElement.classList.add('hidden');
            countElement.classList.remove('flex');
        }
    }
}

export function setupSingleSelectionInPanels() {
    const panels = document.querySelectorAll('.domain-panel');
    const tabs = document.querySelectorAll('.dropdown-panel-tab');

    panels.forEach((panel, panelIndex) => {
        const options = panel.querySelectorAll('.domain-option-label');

        options.forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            const checkmark = option.querySelector('svg');
            const checkmarkBox = option.querySelector('.domain-option-checkmark');

            checkbox.addEventListener('change', () => {
                // Visual update
                if (checkbox.checked) {
                    checkmark.classList.remove('hidden');
                    checkmarkBox.classList.add('bg-woodsmoke-950');
                } else {
                    checkmark.classList.add('hidden');
                    checkmarkBox.classList.remove('bg-woodsmoke-950');
                }

                // Count update
                const selectedCount = panel.querySelectorAll('input[type="checkbox"]:checked').length;
                const countElement = tabs[panelIndex].querySelector('.tab-selected-count');

                if (countElement) {
                    if (selectedCount > 0) {
                        countElement.classList.remove('hidden');
                        countElement.textContent = `${selectedCount}`;
                    } else {
                        countElement.classList.add('hidden');
                        countElement.textContent = '';
                    }
                }
            });
        });
    });
}

export function toggleDepartmentDropdown() {
    const departmentPanel = document.getElementById('department-dropdown-panel');

    if (departmentPanel.classList.contains('hidden')) {
        departmentPanel.classList.remove('hidden');
        departmentPanel.classList.add('flex');
    } else {
        departmentPanel.classList.add('hidden');
        departmentPanel.classList.remove('flex');
    }
}
