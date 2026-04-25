/* 
 * card-personalise.js 
 * Handles personalization for the final standalone card page.
 */

'use strict';

(function() {
    function initCard() {
        const params = new URLSearchParams(window.location.search);
        
        const openingPhraseValue = params.get('phrase') || '';
        const customPhrase = params.get('customPhrase') || '';
        const customerName = params.get('name') || '';
        const companyName = params.get('companyName') || '';
        const message = params.get('message') || '';
        const orderParam = params.get('order') || 'phrase,message,company';
        const url = params.get('url') || '';
        const urlCaption = params.get('urlCaption') || '';
        const logoData = params.get('logo') || '';

        const phraseMap = {
            'happy-easter': 'Happy Easter!',
            'wishing-you': 'Wishing you a joyful Easter!',
            'warmest': 'Our warmest Easter greetings to you',
            'hi-name': 'Happy Easter, {customer name}!',
            'dear-name': 'Dear {customer name},',
            'from-company': 'From all of us at {company name},',
            'dear-name-from-company': 'Dear {customer name}, from all of us at {company name}'
        };

        let phraseText = (openingPhraseValue === 'custom') ? customPhrase : (phraseMap[openingPhraseValue] || '');
        phraseText = phraseText.replace(/{customer name}/g, customerName);
        phraseText = phraseText.replace(/{company name}/g, companyName);

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

        const cardLogo = document.getElementById('card-logo');
        if (cardLogo) {
            if (logoData !== '') {
                cardLogo.src = logoData;
                cardLogo.hidden = false;
            } else {
                cardLogo.hidden = true;
            }
        }
        
        if (window.fitScrollText) window.fitScrollText();
    }

    // Wait for card.js to finish injecting the template
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initCard, 100);
        });
    } else {
        setTimeout(initCard, 100);
    }
})();
