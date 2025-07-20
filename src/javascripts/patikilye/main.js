import { 
    openOnlyThisPanel, 
    toggleDepartmentDropdown,
    
    setupDomainPanelSwitching,
    setupCustomCheckboxes, 
    setupSingleSelectionInPanels } from '../patikilye/frontend/quest-form-dropdown-toggler.js';

import { updateRangeUI, initializeMap } from '../patikilye/frontend/map-ui.js';

import { initQuestForm } from '../patikilye/frontend/quest-form.js';

const domainDropdownBtn = document.getElementById('domain-dropdown-btn');
const locationDropdownBtn = document.getElementById('location-dropdown-btn');

domainDropdownBtn.addEventListener('click', () => {
    openOnlyThisPanel('domain-dropdown-panel');
});
locationDropdownBtn.addEventListener('click', () => {
    openOnlyThisPanel('location-dropdown-panel');
});

document.addEventListener('DOMContentLoaded', () => {
    setupCustomCheckboxes();

    setupDomainPanelSwitching();
    // setupLocationPanelSwitching();

    setupSingleSelectionInPanels();

    updateRangeUI();
    initializeMap();

    initQuestForm();
});