/*
 * Scene scaler and Dynamic Theme Renderer.
 */
(function () {
    var DESIGN_W = 900;
    var DESIGN_H = 506.25;

    function renderScene() {
        var stage = document.getElementById('card-stage');
        var scene = stage && stage.querySelector('.scene');
        if (!stage || !scene) return;

        var params = new URLSearchParams(window.location.search);
        var theme = params.get('anim') || sessionStorage.getItem('animTheme') || 'bunny';
        
        // Load correct stylesheet
        if (!document.getElementById('theme-styles')) {
            var link = document.createElement('link');
            link.id = 'theme-styles';
            link.rel = 'stylesheet';
            link.href = 'css/card-' + theme + '.css';
            document.head.appendChild(link);
        }

        if (theme === 'garden') {
            scene.innerHTML = getGardenTemplate();
        } else {
            scene.innerHTML = getBunnyTemplate();
        }
    }

    function getBunnyTemplate() {
        return '<div class="sky"></div><div class="sun"></div>' +
            '<div class="cloud cloud--1"></div><div class="cloud cloud--2"></div>' +
            '<div class="bunny"><div class="bunny__ears"><div class="bunny__ear bunny__ear--left"></div><div class="bunny__ear bunny__ear--right"></div></div>' +
            '<div class="bunny__head"><div class="bunny__eye bunny__eye--left"></div><div class="bunny__eye bunny__eye--right"></div><div class="bunny__nose"></div><div class="bunny__mouth"></div></div>' +
            '<div class="bunny__body"><div class="bunny__arm bunny__arm--left"></div><div class="bunny__arm bunny__arm--right"></div><div class="bunny__tail"></div></div></div>' +
            '<div class="ground"></div>' +
            Array.from({length:20}, (_, i) => '<div class="grass grass--' + (i+1) + '"><span></span><span></span><span></span></div>').join('') +
            '<div class="egg-scene"><div class="egg__lying"></div><div class="egg"></div><div class="egg__top-half"><div class="egg__stripe"></div>' +
            '<div class="egg__dot egg__dot--1"></div><div class="egg__dot egg__dot--2"></div><div class="egg__dot egg__dot--3"></div>' +
            Array.from({length:8}, (_, i) => '<div class="egg__crack egg__crack--' + (i+1) + '"></div>').join('') +
            '</div><div class="egg-flash"></div></div>' +
            Array.from({length:20}, (_, i) => '<div class="confetti confetti--' + (i+1) + '"></div>').join('') +
            '<div class="item item--basket"><div class="basket"><div class="basket__handle"></div><div class="basket__body"></div></div></div>' +
            '<div class="item item--flowers"><div class="flowers">' +
            [1,2].map(() => '<div class="flower"><div class="flower__stem"></div>' + [1,2,3,4,5,6].map(j => '<div class="flower__petal flower__petal--' + j + '"></div>').join('') + '<div class="flower__center"></div></div>').join('') +
            '</div></div><div class="item item--eggs"><div class="small-egg small-egg--1"></div><div class="small-egg small-egg--2"></div><div class="small-egg small-egg--3"></div></div>' +
            '<div class="scroll-container"><div class="scroll"><div class="scroll__roll"></div>' +
            '<div class="scroll__paper"><p class="scroll__message" id="card-message"></p><a class="scroll__link" id="card-link" href="#"></a></div>' +
            '<div class="scroll__roll"></div></div></div>';
    }

    function getGardenTemplate() {
        return '<div class="sky"></div><div class="sun"></div>' +
            '<div class="cloud cloud--1"></div><div class="cloud cloud--2"></div><div class="ground"></div>' +
            Array.from({length:20}, (_, i) => '<div class="grass grass--' + (i+1) + '"><span></span><span></span><span></span></div>').join('') +
            
            // Seeds for all 7 flowers
            Array.from({length:7}, (_, i) => '<div class="seed seed--' + (i+1) + '"></div>').join('') +

            // Main 3 foreground flowers
            '<div class="garden-flower garden-flower--1"><div class="stem"></div><div class="leaf leaf--left"></div><div class="leaf leaf--right"></div><div class="bloom">' + Array.from({length:8}, () => '<div class="petal"></div>').join('') + '</div></div>' +
            '<div class="garden-flower garden-flower--3"><div class="stem"></div><div class="leaf leaf--left"></div><div class="leaf leaf--right"></div><div class="bloom">' + Array.from({length:8}, () => '<div class="petal"></div>').join('') + '</div></div>' +
            '<div class="garden-flower garden-flower--2"><div class="stem"></div><div class="leaf leaf--left"></div><div class="leaf leaf--right"></div><div class="bloom">' + Array.from({length:8}, () => '<div class="petal"></div>').join('') + '</div>' +
            '<div class="scroll-container"><div class="scroll"><div class="scroll__roll"></div>' +
            '<div class="scroll__paper"><p class="scroll__message" id="card-message"></p><a class="scroll__link" id="card-link" href="#"></a></div>' +
            '<div class="scroll__roll"></div></div></div></div>' +

            // 4 background flowers
            '<div class="garden-flower garden-flower--4"><div class="stem"></div><div class="leaf leaf--left"></div><div class="leaf leaf--right"></div><div class="bloom">' + Array.from({length:8}, () => '<div class="petal"></div>').join('') + '</div></div>' +
            '<div class="garden-flower garden-flower--5"><div class="stem"></div><div class="leaf leaf--left"></div><div class="leaf leaf--right"></div><div class="bloom">' + Array.from({length:8}, () => '<div class="petal"></div>').join('') + '</div></div>' +
            '<div class="garden-flower garden-flower--6"><div class="stem"></div><div class="leaf leaf--left"></div><div class="leaf leaf--right"></div><div class="bloom">' + Array.from({length:8}, () => '<div class="petal"></div>').join('') + '</div></div>' +
            '<div class="garden-flower garden-flower--7"><div class="stem"></div><div class="leaf leaf--left"></div><div class="leaf leaf--right"></div><div class="bloom">' + Array.from({length:8}, () => '<div class="petal"></div>').join('') + '</div></div>';
    }

    function scaleScene() {
        var stage = document.getElementById('card-stage');
        var scene = stage && stage.querySelector('.scene');
        if (!stage || !scene) return;

        var mainEl = document.querySelector('main');
        var cs     = mainEl ? window.getComputedStyle(mainEl) : null;
        var availW = mainEl ? mainEl.clientWidth  - parseFloat(cs.paddingLeft)  - parseFloat(cs.paddingRight) : window.innerWidth;
        var availH = mainEl ? mainEl.clientHeight - parseFloat(cs.paddingTop)   - parseFloat(cs.paddingBottom) : window.innerHeight;

        var scale = Math.min(availW / DESIGN_W, availH / DESIGN_H);
        stage.style.width  = (scale * DESIGN_W) + 'px';
        stage.style.height = (scale * DESIGN_H) + 'px';
        scene.style.width           = DESIGN_W + 'px';
        scene.style.height          = DESIGN_H + 'px';
        scene.style.transformOrigin = '0 0';
        scene.style.transform       = 'scale(' + scale + ')';
    }

    function init() {
        renderScene();
        scaleScene();
        window.addEventListener('resize', scaleScene);
        // Call fitScrollText after a short delay to ensure DOM is ready
        setTimeout(function() {
            if (window.fitScrollText) window.fitScrollText();
        }, 50);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

/*
 * Scroll text font scaler.
 */
window.fitScrollText = function() {
    var paper  = document.querySelector('.scroll__paper');
    var msg    = document.getElementById('card-message');
    var link   = document.getElementById('card-link');
    if (!paper || !msg) return;

    paper.style.width   = '240px';
    paper.style.padding = '6px 14px';

    var size = 12;
    msg.style.fontSize = size + 'px';

    while (size > 6 && paper.scrollHeight > paper.clientHeight) {
        size -= 0.5;
        msg.style.fontSize  = size + 'px';
        if (link) link.style.fontSize = Math.max(size - 1.5, 5) + 'px';
    }

    paper.style.width   = '';
    paper.style.padding = '';
};
