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
    BUTTON_ICO: `${CLASS_SL_ELEM}__icon`,
    BUTTON_NEXT: `${CLASS_SL_ELEM}__button_next`,
    BUTTON_PREV: `${CLASS_SL_ELEM}__button_prev`
};

const StatusClassName = {
    ICO_PLAY: 'icon-play',
    ICO_PAUSE: 'icon-pause'
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
        this.buttonPlayIco = slEl.querySelector(ClassNameEl.BUTTON_PLAY + ' ' + ClassNameEl.BUTTON_ICO);

        //save instance in element
        this.slEl._simSlider = this;

        this._currentItemNum = this.slItems.length - 1; //*** !!! it is number of top element item  in slider
        this._nextItemNum = null;
        this._currentItem = this.slItems[this._currentItemNum]; //*** !!!
        this._isWork = null;
        this._isAutoPlayOn = null;
        this._timerAutoPlayID = null;
        this._timerLoadID = null;
        this._qtPreloaded = opts.qtPreloaded || 1;
        this._autoPlayDelay = opts.autoPlayDelay || 3000;

        this._initElms();
        this._initTouchEvent();
        this._setAnimateFunc(opts.typeAnimation);

        if(opts.isAutoPlay) this.toggleAutoPlay(); //todo: to fix autoPlay(true)
    }

// ***************************************
// Public methods
// ***************************************

    toggleAutoPlay() {
        if (!this._isAutoPlayOn) {
            this._isAutoPlayOn = true;
            this._setClassButtonPlayIco('pause');
            this.onAutoPlay();
        } else {
            this._isAutoPlayOn = false;
            this._setClassButtonPlayIco('play');
        }
     }

    go(dir) {
        if (this._isWork) return;
        if (!SimSlider._getImg(this._currentItem).isloaded) return;

        dir = dir || 1;
        this._isWork = true;
        this._nextItemNum = this._getNextItemNum(dir);

        //init for current item
        this._currentItem.style.zIndex = 2;
        //init for next item
        this.slItems[this._nextItemNum].style.zIndex = 1;

        this._animateMove(dir);
    }

    onAutoPlay() {
        this.isAutoPlay = true;

        if( this.isWork ) return; //происходит анимация, автовоспроизв будет запущено ф-ией transitionComplete

        const nextItem = this.slItems[this_getNextItemNum()],
            nextImg = SimSlider._getImg(nextItem);

        if(!nextImg.isloaded) {
            clearTimeout(this._timerAutoPlayID);
            /*; /!*!!!!*!/
            clearTimeout(timerLoadID);*/
            this._timerLoadID = setTimeout(function(){ this.onAutoPlay(); }, 1000);//если след. изображ не загружено делаем паузу и пробуем снова todo: сделать параметр
            return;
        }
        
        clearTimeout(this._timerAutoPlayID);//д.б. запущен только один таймер - перед запуском следущего отменяем текущий(если сущ)
        this._timerAutoPlayID = setTimeout(function(){ this.go(); }, this._autoPlayDelay);
    }

// ***************************************
// Private methods
// ***************************************

    _initElms() {
        const currentItem = this._currentItem,
            firstImg = SimSlider._getImg(currentItem),
            $slEl = ElU(slEl);


        this._loadImg(firstImg); //load first img
        currentItem.cssText = "zIndex: 1; will-change: transform"; //todo: для изображения или + transform??
        this._preLoadImgs(this._currentItemNum); //загружаем остальные фотографии (которые должны подгрузиться в данный момент времени)

        $slEl.on('click', this._onClick(), this);
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
        let qtPreloaded = this._qtPreloaded;
        const slItems = this.slItems;

        if (qtPreloaded > slItems.length - 1) qtPreloaded = slItems.length - 1;
        for (let i = itemNum - qtPreloaded; i <= itemNum + qtPreloaded; i++) {
            if (i === itemNum) continue; // т.к.текущ. изобр загружено

            let item = slItems[i],
                img = item && SimSlider._getImg(slItems[i]);

            if (!item && i < 0) {
                img = SimSlider._getImg(slItems[slItems.length + i]);
            } else if (!item && i > 0) {
                img = SimSlider._getImg(slItems[i - slItems.length]);
            }

            if (img.isloaded) continue;
            loadImg(img);
        }
    }


    _onClick(e) {
        if (e.target.closest(ClassNameEl.BUTTON_PLAY)) {
            this.toggleAutoPlay();
            return;

        } else if (this._isWork) {
            return;

        } else if (e.target.closest(ClassNameEl.BUTTON_NEXT)) {
            let dir = 1;
            this.go(dir);

        } else if (e.target.closest(ClassNameEl.BUTTON_PREV)) {
            let dir = -1;
            this.go(dir);
        }
    }

    _initTouchEvent() {
    };

    _getNextItemNum(dir) {
        const curNum = this._currentItemNum,
            slItems = this.slItems;

        let nextItemNum = null;

        if (dir === -1) {
            return nextItemNum = curNum >= slItems.length - 1 ? 0 : curNum + 1;
        } else {
            return nextItemNum = curNum === 0 ? slItems.length - 1 : curNum - 1;
        }
    }

    _setClassButtonPlayIco(action) {
        const button = this.buttonPlayIco;

        if (button && action === 'pause') {
            button.classList.remove(StatusClassName.ICO_PLAY);
            button.classList.add(StatusClassName.ICO_PAUSE);
        } else if (button && action === 'play') {
            button.classList.remove(StatusClassName.ICO_PAUSE);
            button.classList.add(StatusClassName.ICO_PLAY);
        }
    }

    _setAnimateFunc(typeAnimation) {
        let typeAn = typeAnimation || 'fade',
            stSlideAnimation = SimSlider._stSlideAnimate[typeAn];

        this._animateMove = stSlideAnimation instanceof Function ? stSlideAnimation : SimSlider._stSlideAnimate.fade;
    }


// ***************************************
// Static methods
// ***************************************

//necessary actions:
//call OnAutoPlay();
//set currentItemNum = nextItemNum
//set currentItem = nextAnimEl;
    static get _stSlideAnimate() {
        return {
            fade: function () { //?????
                const animEl = this._currentItem,
                    nextAnimEl = this.slItems[this._nextItemNum],
                    $animEl = ElU(this._currentItem);

                item._$el = ElU(animEl);

                $animEl.on('transitionend.fade', transitionComplete, this);
                item.style.opacity = 0;

                function transitionComplete(e) {
                    const animEl = this._currentItem,
                        $animEl = animEl._$el;

                    if (e.target === animEl && e.propertyName != 'opacity') return;
                    $animEl.off('transitionend.fade');

                    //reset style for current item
                    animEl.cssText('Z-index: 0; opacity: 0; will-change: ""');
                    //preparation transition for next item
                    this.slItems[this._nextItemNum].style.willChange = "opacity";

                    this._currentItemNum = this._nextItemNum;
                    this._currentItem = nextAnimEl;
                    this.isWork = false;

                    if (this.isAutoPlay) this.onAutoPlay();
                }

            }
        }
    }



static _getImg(el) {
     return el.getElementsByClassName(ClassNameEl.IMG)[0];
}




}


// ------------------------------------------------------------------------
// Initialization 
// ------------------------------------------------------------------------




});