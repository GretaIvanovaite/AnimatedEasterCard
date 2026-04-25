/* 
 * selections.js 
 * Handles data confirmation, content reordering, and live preview.
 */

'use strict';

(function() {
    const params = new URLSearchParams(window.location.search);
    
    // Elements
    const emailSelect = document.getElementById('emailColumn');
    const nameSelect = document.getElementById('nameColumn');
    const phraseSelect = document.getElementById('openingPhrase');
    const customContainer = document.getElementById('customPhraseContainer');
    const customTextarea = document.getElementById('customPhrase');
    const livePreview = document.getElementById('livePreviewScroll');
    const orderList = document.getElementById('messageOrder');
    const form = document.querySelector('form');

    // Data fallbacks (Session vs URL)
    const fileContent = sessionStorage.getItem('uploadedFile') || params.get('manualData') || '';
    const fileName = sessionStorage.getItem('uploadedFileName') || (params.has('manualData') ? 'manual' : '');
    const companyName = sessionStorage.getItem('companyName') || params.get('companyName') || '{company name}';
    const storedMessage = sessionStorage.getItem('message') || params.get('message') || '';

    /**
     * Parse the uploaded file or manual data to find columns.
     */
    function getColumns() {
        const columns = [];
        if (!fileContent || !fileName) return columns;

        let extension = '';
        if (fileName !== 'manual') {
            const nameParts = fileName.split('.');
            extension = nameParts[nameParts.length - 1].toLowerCase();
        }

        if (extension === 'json') {
            try {
                const data = JSON.parse(fileContent);
                if (data.length > 0) {
                    Object.keys(data[0]).forEach(key => {
                        columns.push({ label: key + ' (' + data[0][key] + ')', value: key });
                    });
                }
            } catch (e) { console.error('JSON Parse Error', e); }
        } else {
            const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length === 0) return columns;

            const cells = lines[0].split(',');
            cells.forEach((cell, i) => {
                const val = cell.trim();
                if (val) columns.push({ label: (fileName === 'manual' ? 'Column ' + (i+1) : 'Header: ' + val) + ' (' + val + ')', value: i });
            });
            // Fallback for single cell
            if (columns.length === 0 && cells[0]) columns.push({ label: 'Column 1 (' + cells[0] + ')', value: 0 });
        }
        return columns;
    }

    /**
     * Populate the Email and Name dropdowns.
     */
    function populateDropdowns() {
        const columns = getColumns();
        columns.forEach(col => {
            const opt1 = new Option(col.label, col.value);
            const opt2 = new Option(col.label, col.value);
            emailSelect.add(opt1);
            nameSelect.add(opt2);
        });
    }

    /**
     * Extracts an example name based on the selected column.
     */
    function getExampleName() {
        const colIdx = nameSelect.value;
        if (colIdx === '' || !fileContent) return '';

        const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l !== '');
        const startRow = fileName === 'manual' ? 0 : 1;
        
        for (let i = startRow; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts[colIdx]) return parts[colIdx].trim();
        }
        return '';
    }

    /**
     * Updates the text box on the page to show what the card will look like.
     */
    function updateLivePreview() {
        let phraseText = '';
        if (phraseSelect.value === 'custom') {
            phraseText = customTextarea.value || 'Your custom phrase...';
        } else {
            phraseText = phraseSelect.options[phraseSelect.selectedIndex].textContent;
        }

        // Placeholders
        phraseText = phraseText.replace(/{company name}/g, companyName);
        phraseText = phraseText.replace(/{customer name}/g, getExampleName() || 'Customer');

        // Ordering
        const order = Array.from(orderList.children).map(li => li.dataset.id);
        const lines = [];
        order.forEach(id => {
            if (id === 'phrase' && phraseText) lines.push(phraseText);
            if (id === 'message' && storedMessage) lines.push(storedMessage);
            if (id === 'company' && companyName && companyName !== '{company name}') lines.push(companyName);
        });

        if (livePreview) livePreview.textContent = lines.join('\n');
    }

    /**
     * Shows/hides phrase options that require a customer name.
     */
    function toggleNameOptions() {
        const hasName = nameSelect.value !== '';
        Array.from(phraseSelect.options).forEach(opt => {
            if (opt.textContent.includes('{customer name}')) {
                opt.hidden = !hasName;
                opt.disabled = !hasName;
                // If a hidden option was selected, reset to default
                if (!hasName && phraseSelect.value === opt.value) {
                    phraseSelect.value = 'happy-easter';
                }
            }
        });
    }

    // --- EVENT LISTENERS ---

    phraseSelect.addEventListener('change', function() {
        customContainer.hidden = (this.value !== 'custom');
        updateLivePreview();
    });

    customTextarea.addEventListener('input', updateLivePreview);
    
    nameSelect.addEventListener('change', function() {
        toggleNameOptions();
        updateLivePreview();
    });

    orderList.addEventListener('click', (e) => {
        const btn = e.target;
        if (!btn.matches('.btn-up, .btn-down')) return;
        const li = btn.closest('li');
        if (btn.classList.contains('btn-up')) {
            if (li.previousElementSibling) orderList.insertBefore(li, li.previousElementSibling);
        } else {
            if (li.nextElementSibling) orderList.insertBefore(li.nextElementSibling, li);
        }
        updateLivePreview();
    });

    // --- INITIALIZATION ---

    // Clean up phrase options (replaces placeholders in dropdown text)
    Array.from(phraseSelect.options).forEach(opt => {
        opt.textContent = opt.textContent.replace('{company name}', companyName);
    });

    populateDropdowns();
    toggleNameOptions();
    updateLivePreview();

    // --- FORM SUBMISSION ---

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Basic validation for email column
        if (emailSelect.value === '') {
            const err = document.getElementById('emailColumn-error');
            err.hidden = false;
            return;
        }

        // Save state
        const orderString = Array.from(orderList.children).map(li => li.dataset.id).join(',');
        sessionStorage.setItem('openingPhrase', phraseSelect.value);
        sessionStorage.setItem('customPhrase', customTextarea.value);
        sessionStorage.setItem('emailColumn', emailSelect.value);
        sessionStorage.setItem('nameColumn', nameSelect.value);
        sessionStorage.setItem('messageOrder', orderString);

        // Redirect with full parameters
        const nextParams = new URLSearchParams();
        nextParams.append('openingPhrase', phraseSelect.value);
        nextParams.append('customPhrase', customTextarea.value);
        nextParams.append('emailColumn', emailSelect.value);
        nextParams.append('nameColumn', nameSelect.value);
        nextParams.append('order', orderString);
        if (params.has('companyName')) nextParams.append('companyName', companyName);

        window.location.href = 'preview.html?' + nextParams.toString();
    });

})();
