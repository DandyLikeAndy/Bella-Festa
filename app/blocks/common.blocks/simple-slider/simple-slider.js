document.addEventListener('DOMContentLoaded', function () {
// ------------------------------------------------------------------------
// Constants and variables
// ------------------------------------------------------------------------
const CLASS_SL_ELEM = 'simpleSlider';

const ClassNameEl = {
    ITEM: `${CLASS_SL_ELEM}__item`,
    IMG: `${CLASS_SL_ELEM}__img`,
    INFO: `${CLASS_SL_ELEM}__info`,
    BUTTON_PLAY: `${CLASS_SL_ELEM}__button_play-pause`,
    BUTTON_NEXT: `${CLASS_SL_ELEM}__button_next`,
    BUTTON_PREV: `${CLASS_SL_ELEM}__button_prev`
};

const Attribute = {
    DATA_IMG_SRC: 'data-img-realsrc'
};




// ------------------------------------------------------------------------
// Dependencies
// ------------------------------------------------------------------------



// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

class SimSlider {

    constructor(opts) {

        this.slEl = opts.slEl;
        this.slItems = slEl.getElementsByClassName(ClassNameEl.ITEM);
        this.slInfoBlocks = slEl.getElementsByClassName(ClassNameEl.INFO);
        this.buttonPlay = slEl.getElementsByClassName(ClassNameEl.BUTTON_PLAY);

        //save instanse in element
        this.slEl._simSlider = this;

        this._currentItemNum = this.slItems.length - 1; //*** !!! it is number of top element item  in slider
        this._currentItem = slItems[this._currentItemNum]; //*** !!!
        this._isWork = null;
        this._isAutoPlayOn = null;
        this._timerAutoPlayID = null;
        this._timerLoadID = null;
        this._qtPreloaded = opts.qtPreloaded || 1;

        this._initElms();
        this._initTouchEvent();
        if(opts.isAutoPlay) this.toggleAutoPlay(); //todo: to fix autoPlay(true)

    }

// ***************************************
// Public methods
// ***************************************

toggleAutoPlay() {}

go(dir) {
    
}

// ***************************************
// Private methods
// ***************************************

_initElms() {
    const currentItem = this._currentItem,
        firstImg = SimSlider._getImg(currentItem);

    this._loadImg(firstImg); //load first img
    currentItem.cssText = "'zIndex': 1; 'will-change': 'transform'"; //todo: для изображения или + transform??
    this._preLoadImgs(currentImgNum); //загружаем остальные фотографии (которые должны подгрузиться в данный момент времени)

    this.slEl.onclick = this._onClick;
}


_loadImg(img) {

    const src = img.getAttribute(Attribute.DATA_IMG_SRC),
        imgLoad = document.createElement('img');

    if (!src) { //если загружено, просто показываем - уже как фоновое изображение
        img.style.opacity = 1;
        img.isloaded = true;
        return;
    }

    imgLoad.onload = onLoad;
    imgLoad.src = src;

    function onLoad() {
        img.style.backgroundImage = "url(" + src + ")";
        img.setAttribute(Attribute.DATA_IMG_SRC, '');
        img.style.willChange = 'opacity'; //*** !!!
        img.style.opacity = 1;
        img.isloaded = true;
    }
}


_preLoadImgs(itemNum) {
    const qtPreloaded = this._qtPreloaded,
        slItems = this.slItems;

        if ( qtPreloaded > slItems.length-1 ) qtPreloaded = slItems.length-1;
        for ( let i = itemNum-qtPreloaded; i <= itemNum+qtPreloaded; i++ ) {
            if (i===itemNum) continue; // т.к.текущ. изобр загружено

            let item = slItems[i],
                img = item && SimSlider._getImg(slItems[i]);

            if (!item && i<0) {
                img = SimSlider._getImg(slItems[slItems.length + i]);
            } else if (!item && i>0) {
                img = SimSlider._getImg(slItems[i - slItems.length]);
            }

            if (img.isloaded) continue;
            loadImg(img);
        }
}
_onClick(e) {
    if (e.target.closest(ClassNameEl.BUTTON_PLAY)) {
        toggleAutoPlay();
        return;

    } else if (this._isWork) {
        return;

    } else if ($(e.target).closest(ClassNameEl.BUTTON_NEXT)) {
        dir = 1;
        go(dir);

    } else if ($(e.target).closest(ClassNameEl.BUTTON_PREV)) {
        dir = -1;
        go(dir);
    }
}

_initTouchEvent();


// ***************************************
// Static methods
// ***************************************
static _getImg(el) {
    el.getElementsByClassName(ClassNameEl.IMG)[0];
}


}


// ------------------------------------------------------------------------
// Initialization 
// ------------------------------------------------------------------------




});