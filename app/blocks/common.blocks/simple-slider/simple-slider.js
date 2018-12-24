// ------------------------------------------------------------------------
// simple-slider.js
// ------------------------------------------------------------------------

//todo:
//01. Stop slider if menu is open
//02. Hide container-info if menu is open and landscape orientation for mobile version
//03. Add will-change property for currentItem in _initElms()

document.addEventListener('DOMContentLoaded', function () {
// ------------------------------------------------------------------------
// Constants and variables
// ------------------------------------------------------------------------
const CLASS_SL_ELEM = 'simple-slider';

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
const ElU = window.ElU; //$elem
   if(!ElU) {
        console.error('for create SimSlider instance need ElU library');
        return;
   }


// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

class SimSlider {

    constructor(opts) {
        const slEl = opts.slEl;

        this.slEl = slEl;
        this.slItems = slEl.getElementsByClassName(ClassNameEl.ITEM);
        this.slInfoBlocks = slEl.getElementsByClassName(ClassNameEl.INFO);
        this.buttonPlayIco = slEl.querySelector('.' + ClassNameEl.BUTTON_PLAY + ' .' + ClassNameEl.BUTTON_ICO);
        
        //save instance in element
        this.slEl._sl = this;

        this._$slEl = ElU(slEl);
        this._currentItemNum = this.slItems.length - 1; //*** !!! it is number of top element item  in slider
        this._nextItemNum = null;
        this._currentItem = this.slItems[this._currentItemNum]; //*** !!!
        //this._currentItem._promiseContentLoad = null;//save promise with result of load content
        this._isWork = null;
        this._isAutoPlayOn = null;
        this._timerAutoPlayID = null;
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
            this._setClassButtonPlayIco('pause');//todo: do not change icon - to fix
            this.onAutoPlay();
        } else {
            this._isAutoPlayOn = false;
            this._setClassButtonPlayIco('play');
            clearTimeout(this._timerAutoPlayID);
        }
     }

    go(dir) {
        const nextItem = this.slItems[this._getNextItemNum()]
        if (this._isWork) return;
        if (!SimSlider._getImg(this._currentItem).isLoaded) return;
        
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
        if( this._isWork ) return; //происходит анимация, автовоспроизв будет запущено ф-ией transitionComplete
        
        const currentItem = this._currentItem,
            nextItem = this.slItems[this._getNextItemNum()],
            currentImg = SimSlider._getImg(currentItem),
            nextImg = SimSlider._getImg(nextItem),
            self = this;

        clearTimeout(this._timerAutoPlayID);//д.б. запущен только один таймер - перед запуском следущего отменяем текущий(если сущ)
        this._timerAutoPlayID = setTimeout(autoPlay, this._autoPlayDelay);

        function autoPlay() {
            if(!currentImg.isLoaded) {
                clearTimeout(self._timerAutoPlayID);
                currentItem._promiseContentLoad.then(autoPlay);
                return;
            }
            if(!nextImg.isLoaded) {
                clearTimeout(self._timerAutoPlayID);
                nextItem._promiseContentLoad.then(autoPlay);
                return;
            }

            self.go();
        }
    }

// ***************************************
// Private methods
// ***************************************

    _initElms() {
        const currentItem = this._currentItem,
            firstImg = SimSlider._getImg(currentItem),
            $slEl = this._$slEl;

        currentItem._promiseContentLoad = this._loadImg(firstImg); //load first img
        currentItem.cssText = "zIndex: 1;"; //todo:will-change
        this._preLoadImgs(this._currentItemNum); //загружаем остальные фотографии (которые должны подгрузиться в данный момент времени)

        $slEl.on('click', this._onClick, this);
    }

    //return promise
    _loadImg(img) {
        const src = img.getAttribute(Attribute.DATA_IMG_SRC),
            imgLoad = document.createElement('img');

        img.style.opacity = 0;

        return new Promise((resolve, rejected) => {

            if (!src) { //если загружено, просто показываем - уже как фоновое изображение
                img.style.opacity = 1;
                img.isLoaded = true;
                resolve({src, img});
                return;
            }

            imgLoad.onload = onLoad;
            imgLoad.onerror = onError;
            imgLoad.src = src;

            function onLoad() {
                img.style.backgroundImage = "url(" + src + ")";
                img.setAttribute(Attribute.DATA_IMG_SRC, '');
                img.style.willChange = 'opacity'; //*** !!!
                img.style.opacity = 1;
                img.isLoaded = true;
                resolve({src, img});
            }

            function onError() {
                rejected({src, img});
            }

        });
        
    }


    _preLoadImgs(itemNum) {
        let qtPreloaded = this._qtPreloaded;
        const slItems = this.slItems;

        if (qtPreloaded > slItems.length - 1) qtPreloaded = slItems.length - 1;

        this._currentItem._promiseContentLoad.then( () => {

            for (let i = itemNum - qtPreloaded; i <= itemNum + qtPreloaded; i++) {
            if (i === itemNum) continue; // т.к.текущ. изобр загружено

            let item = slItems[i],
                img = item && SimSlider._getImg(slItems[i]);

            if (!item && i < 0) {
                item = slItems[slItems.length + i];
                img = SimSlider._getImg(item);
            } else if (!item && i > 0) {
                item = slItems[i - slItems.length];
                img = SimSlider._getImg(item);
            }

            if (img.isLoaded) continue;
            item._promiseContentLoad = this._loadImg(img);
            }
        });

    }


    _onClick(e) { 
        if (e.target.closest('.' + ClassNameEl.BUTTON_PLAY)) {
            this.toggleAutoPlay();
            return;
            
        } else if (this._isWork) {
            return;

        } else if (e.target.closest('.' + ClassNameEl.BUTTON_NEXT)) {
            let dir = 1;
            this.go(dir);
            
        } else if (e.target.closest('.' + ClassNameEl.BUTTON_PREV)) {
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

        if (button.classList.contains(StatusClassName.ICO_PAUSE) && action === 'play') {
            button.classList.remove(StatusClassName.ICO_PAUSE);
            button.classList.add(StatusClassName.ICO_PLAY);

        } else if (button.classList.contains(StatusClassName.ICO_PLAY) &&  action === 'pause') {
            button.classList.remove(StatusClassName.ICO_PLAY);
            button.classList.add(StatusClassName.ICO_PAUSE);
        }
    }

    _setAnimateFunc(typeAnimation) {
        let typeAn = typeAnimation || 'fade',
            stSlideAnimation = SimSlider._stSlideAnimate[typeAn];

        this._animateMove = stSlideAnimation instanceof Function ? stSlideAnimation : SimSlider._stSlideAnimate.fade;
    }

    _createEventAnimate(type, detail) {
        this._$slEl.triggerCustomEvent(type, detail);
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

                this._createEventAnimate('startAnimation', {currentItem: animEl, nextItem: nextAnimEl});
                    
                animEl._$el = $animEl;

                $animEl.on('transitionend.fade', transitionComplete, this);
                
                animEl.style.opacity = 0;

                function transitionComplete(e) {
                    const animEl = this._currentItem,
                        $animEl = animEl._$el;

                    if (e.target === animEl && e.propertyName != 'opacity') return;
                    $animEl.off('transitionend.fade');
                    
                    //reset style for current item after loading nextItem content
                    nextAnimEl._promiseContentLoad.then( () =>{
                        animEl.style.cssText = 'Z-index: 0; will-change: ""'
                    });
                    //preparation transition for next item
                    this.slItems[this._nextItemNum].style.willChange = "opacity";

                    this._createEventAnimate('stopAnimation', {currentItem: animEl, nextItem: nextAnimEl});

                    this._currentItemNum = this._nextItemNum;
                    this._currentItem = nextAnimEl;
                    this._isWork = false;
            
                    
                    if (this._isAutoPlayOn) this.onAutoPlay();
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

let simSladers = document.getElementsByClassName(CLASS_SL_ELEM);

for (let i=0; i<simSladers.length; i++) {
    let opts = {
        slEl: simSladers[i]
    }
    window.simSlider = new SimSlider(opts);
     
}

});