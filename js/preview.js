/* 
 * preview.js 
 * Handles personalization logic specifically for the Preview step.
 */

'use strict';

(function() {
    function initPreview() {
        const params = new URLSearchParams(window.location.search);
        const openingPhraseValue = params.get('openingPhrase') || sessionStorage.getItem('openingPhrase') || 'happy-easter';
        const customPhrase = params.get('customPhrase') || sessionStorage.getItem('customPhrase') || '';
        const nameColumn = params.get('nameColumn') || sessionStorage.getItem('nameColumn');
        const orderParam = params.get('order') || sessionStorage.getItem('messageOrder') || 'phrase,message,company';

        const companyName = sessionStorage.getItem('companyName') || '';
        const message = sessionStorage.getItem('message') || '';
        const url = sessionStorage.getItem('url') || '';
        const urlCaption = sessionStorage.getItem('urlCaption') || '';
        const logoDataUrl = sessionStorage.getItem('companyLogo') || '';

        const phraseMap = {
            'happy-easter': 'Happy Easter!',
            'wishing-you': 'Wishing you a joyful Easter!',
            'warmest': 'Our warmest Easter greetings to you',
            'hi-name': 'Happy Easter, {customer name}!',
            'dear-name': 'Dear {customer name},',
            'from-company': 'From all of us at {company name},',
            'dear-name-from-company': 'Dear {customer name}, from all of us at {company name}'
        };

        function getExampleName() {
            const fileContent = sessionStorage.getItem('uploadedFile');
            const fileName = sessionStorage.getItem('uploadedFileName');

            if (!fileContent || !nameColumn || nameColumn === '') return '';

            const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l !== '');
            const startRow = (fileName === 'manual') ? 0 : 1;

            for (let i = startRow; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts[nameColumn]) return parts[nameColumn].trim();
            }
            return '';
        }

        let phraseText = (openingPhraseValue === 'custom') ? customPhrase : (phraseMap[openingPhraseValue] || '');
        phraseText = phraseText.replace(/{company name}/g, companyName);
        phraseText = phraseText.replace(/{customer name}/g, getExampleName() || 'Customer');

        const lines = [];
        const order = orderParam.split(',');

        order.forEach(id => {
            if (id === 'phrase' && phraseText !== '') lines.push(phraseText);
            else if (id === 'message' && message !== '') lines.push(message);
            else if (id === 'company' && companyName !== '') lines.push(companyName);
        });

        const cardMsg = document.getElementById('card-message');
        if (cardMsg) {
            cardMsg.textContent = lines.join('\n');
        }

        const cardLink = document.getElementById('card-link');
        if (cardLink) {
            if (url !== '') {
                cardLink.href = url;
                cardLink.textContent = urlCaption !== '' ? urlCaption : url;
                cardLink.hidden = false;
            } else {
                cardLink.hidden = true;
            }
        }

        const logoImg = document.getElementById('card-logo');
        if (logoImg) {
            if (logoDataUrl !== '') {
                logoImg.src = logoDataUrl;
                logoImg.hidden = false;
            } else {
                logoImg.hidden = true;
            }
        }

        const skipBtn = document.getElementById('btn-skip-anim');
        if (skipBtn) {
            skipBtn.addEventListener('click', function() {
                document.getElementById('card-stage').classList.add('skip-animations');
                skipBtn.hidden = true;
            });
        }
        
        // Trigger font scaling
        if (window.fitScrollText) window.fitScrollText();
    }

    // Wait for card.js to finish injecting the template
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPreview, 100); // Small delay to ensure card.js template is in DOM
        });
    } else {
        setTimeout(initPreview, 100);
    }
})();
