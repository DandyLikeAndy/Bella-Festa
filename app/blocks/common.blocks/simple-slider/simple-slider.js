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

        
        this.slEl = opts.slEl;
        this.slItems = slEl.getElementsByClassName(ClassNameEl.ITEM);
        this.slInfoBlocks = slEl.getElementsByClassName(ClassNameEl.INFO),
        this.buttonPlay = slEl.getElementsByClassName(ClassNameEl.BUTTON_PLAY),
            

        this._currentImgNum = this.slItems.length - 1; //it is number of top element item  in slider
        this._isWork = null;
        this._timerAutoPlayID = null;
        this._timerLoadID = null;


        this._initElms();
        this._initTouchEvent();
        if(opts.isAutoPlay) toggleAutoPlay(); //todo: to fix autoPlay(true)



        /* let currentImgNum = slItems.length - 1, //it is number of top element item  in slider
            dir = null,
            isWork = null,
            isAnimationInfo = null,
            timerAutoPlayID = null,
            timerLoadID = null,
            currentItem = null,
            nextInfoBlock = null; */
    }
}


// ------------------------------------------------------------------------
// Initialization 
// ------------------------------------------------------------------------

});