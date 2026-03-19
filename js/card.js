/*
 * Scene scaler.
 * The scene is drawn at a fixed 900 × 506.25 px "design" size so that all
 * pixel-based sizes and positions in card.css are always correct.
 * A CSS scale() transform shrinks (or grows) the scene to match whatever
 * width the stage currently occupies, keeping everything proportional.
 * ResizeObserver re-runs the calculation whenever the stage changes size.
 */
(function () {
    var DESIGN_W = 900;
    var DESIGN_H = 506.25; /* 900 × 9/16 */

    function scaleScene() {
        var stage = document.getElementById('card-stage');
        var scene = stage && stage.querySelector('.scene');
        if (!stage || !scene) return;

        /* Measure the inner content area of main (excludes its padding),
           which is exactly the space available for the stage. */
        var mainEl = document.querySelector('main');
        var cs     = mainEl ? window.getComputedStyle(mainEl) : null;
        var availW = mainEl
            ? mainEl.clientWidth  - parseFloat(cs.paddingLeft)  - parseFloat(cs.paddingRight)
            : window.innerWidth;
        var availH = mainEl
            ? mainEl.clientHeight - parseFloat(cs.paddingTop)   - parseFloat(cs.paddingBottom)
            : window.innerHeight;

        /* Pick the scale that fits in both dimensions */
        var scale = Math.min(availW / DESIGN_W, availH / DESIGN_H);

        /* Explicitly size the stage so it fills available space */
        stage.style.width  = (scale * DESIGN_W) + 'px';
        stage.style.height = (scale * DESIGN_H) + 'px';

        /* Scale the scene content to match */
        scene.style.width           = DESIGN_W + 'px';
        scene.style.height          = DESIGN_H + 'px';
        scene.style.right           = 'auto';
        scene.style.bottom          = 'auto';
        scene.style.transformOrigin = '0 0';
        scene.style.transform       = 'scale(' + scale + ')';
    }

    function init() {
        scaleScene();
        window.addEventListener('resize', scaleScene);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

/*
 * Scroll text font scaler.
 * The scroll paper has a fixed height (56px). If the injected message is
 * long enough to overflow, this script reduces the font size in 0.5px steps
 * until the content fits, stopping at a minimum of 6px.
 * It temporarily expands the paper to its final unrolled width (200px) to
 * get an accurate measurement, then resets it so the CSS animation works.
 */
(function () {
    function fitScrollText() {
        var paper  = document.querySelector('.scroll__paper');
        var msg    = document.getElementById('card-message');
        var link   = document.getElementById('card-link');
        if (!paper || !msg) return;

        /* Expand to final unrolled dimensions for measurement */
        paper.style.width   = '240px';
        paper.style.padding = '6px 14px';

        var size = 12;
        msg.style.fontSize = size + 'px';

        /* Shrink until all content fits inside the fixed height */
        while (size > 6 && paper.scrollHeight > paper.clientHeight) {
            size -= 0.5;
            msg.style.fontSize  = size + 'px';
            if (link) link.style.fontSize = Math.max(size - 1.5, 5) + 'px';
        }

        /* Reset — the CSS animation handles the actual width/padding */
        paper.style.width   = '';
        paper.style.padding = '';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fitScrollText);
    } else {
        fitScrollText();
    }
}());
