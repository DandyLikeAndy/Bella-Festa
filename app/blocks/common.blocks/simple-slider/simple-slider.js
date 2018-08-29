document.addEventListener('DOMContentLoaded', function () {
// ------------------------------------------------------------------------
// Constants and variables
// ------------------------------------------------------------------------
const CLASS_SL_ELEM = 'simpleSlider';

const ClassNameEl = {
    ITEM: `${CLASS_SL_ELEM}__item`,
    INFO: `${CLASS_SL_ELEM}__info`,
    BUTTON_PLAY: `${CLASS_SL_ELEM}__button_play-pause`
};




// ------------------------------------------------------------------------
// Dependencies
// ------------------------------------------------------------------------



// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

class SimpleSlider {

    constructor(opts) {
        const slEl = opts.triggerEl,
            slItems = slEl.getElementsByClassName(ClassNameEl.ITEM),
            slInfoBlocks = slEl.getElementsByClassName(ClassNameEl.INFO);
            buttonPlay = slEl.getElementsByClassName(ClassNameEl.BUTTON_PLAY);


            //todo move in this or closure
        let currentImgNum = slItems.length - 1, //it is number of top element item  in slider
            dir = null,
            isWork = null,
            isAnimationInfo = null,
            timerAutoPlayID = null,
            timerLoadID = null,
            currentItem = null,
            nextInfoBlock = null;

        this.slEl = opts.triggerEl;
    }
}


// ------------------------------------------------------------------------
// Initialization 
// ------------------------------------------------------------------------

});