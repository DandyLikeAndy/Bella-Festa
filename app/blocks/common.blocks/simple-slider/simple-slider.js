// ------------------------------------------------------------------------
// simple-slider.js
// ------------------------------------------------------------------------

//todo:
//01. Stop slider if menu is open
//02. Hide container-info if menu is open and landscape orientation for mobile version
//03. Add will-change property for currentItem in _initSlider()

document.addEventListener('DOMContentLoaded', function () {
// ------------------------------------------------------------------------
// Constants and variables
// ------------------------------------------------------------------------
const CLASS_SL_ELEM = 'simple-slider';

const ClassNameEl = {
    ITEM: `${CLASS_SL_ELEM}__item`,
    IMG: `${CLASS_SL_ELEM}__img`,
    INFO: `${CLASS_SL_ELEM}__container-info`,
    INFO_TITLE: `${CLASS_SL_ELEM}__title-info`,
    INFO_DESCRIPTION: `${CLASS_SL_ELEM}__description-info`,
    BUTTON_PLAY: `${CLASS_SL_ELEM}__button_play-pause`,
    BUTTON_ICO: `${CLASS_SL_ELEM}__icon`,
    BUTTON_NEXT: `${CLASS_SL_ELEM}__button_next`,
    BUTTON_PREV: `${CLASS_SL_ELEM}__button_prev`,
    SCRIM: `${CLASS_SL_ELEM}__scrim`,
    BULLETS: `${CLASS_SL_ELEM}__bullets`,
    BULLETS_ITEM: `${CLASS_SL_ELEM}__bullets-item`
};

const StatusClassName = {
    ICO_PLAY: 'icon-play',
    ICO_PAUSE: 'icon-pause',
    BULLET_ACTIVE:`${ClassNameEl.BULLETS_ITEM}_active`
};

const Attribute = {
    DATA_IMG_SRC: 'data-img-realsrc',
    DATA_INFO_TITLE: 'data-title',
    DATA_INFO_DESCRIPTION: 'data-description',
    DATA_SCRIM_COLOR: 'data-scrim-color'
};

//for info animation
const ClassElModifier = {
    INFO_TITLE_INITANIM: `${ClassNameEl.INFO_TITLE}_initAnim`,
    INFO_DESCRIPTION_INITANIM: `${ClassNameEl.INFO_DESCRIPTION}_initAnim`
};

const DefaultStyleAnim = {
    SLIDE: 'fade',
    INFO: 'shift'
};

const DefaultValues = {
    SCRIM_COLOR: 'hsla(13, 15%, 66%,.45)',
    QT_PRELOAD: 1, //number of preload items
    AUTO_PlAY_DElAY: 3000, //ms
    TRANS_SPEED: 1000, //transition duration
    IS_AUTO_PlAY: true
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

        //SimSlider elements
        this.slEl = slEl;
        this.slItems = slEl.getElementsByClassName(ClassNameEl.ITEM);
        this.slInfoBlock = slEl.getElementsByClassName(ClassNameEl.INFO)[0];
        this.buttonPlayIco = slEl.querySelector('.' + ClassNameEl.BUTTON_PLAY + ' .' + ClassNameEl.BUTTON_ICO);
        this.titleInfoBlock = this.slInfoBlock.getElementsByClassName(ClassNameEl.INFO_TITLE)[0];
        this.descrInfoBlock = this.slInfoBlock.getElementsByClassName(ClassNameEl.INFO_DESCRIPTION)[0];
        this.scrim = slEl.getElementsByClassName(ClassNameEl.SCRIM)[0];
        this.bullets = this.slEl.getElementsByClassName(ClassNameEl.BULLETS)[0];
        
        //Available to the user properties
        this.$slEl = ElU(slEl);
        this.currentItemNum = this.slItems.length - 1; //it is number of top element item  in slider
        this.currentItem = this.slItems[this.currentItemNum];
        this.nextItemNum = null; //define go(dir)
        this.nextItem = null; //define go(dir)
        
        //save instance in element
        this.slEl._sl = this;

        //Protected properties
        this._isWork = null;
        this._isAutoPlayOn = null;
        this._timerAutoPlayID = null;
        this._qtPreload = opts.qtPreload || DefaultValues.QT_PRELOAD;
        this._autoPlayDelay = opts.autoPlayDelay || DefaultValues.AUTO_PlAY_DElAY;
        this._transSpeed = opts.transSpeed || DefaultValues.TRANS_SPEED;
        //this.currentItem._promiseContentLoad = null;//save promise with result of load content

        //initialization
        this._initSlider(opts);
    }

// ***************************************
// Public methods
// ***************************************
    
    startAutoPlay() {
        if (!this._isAutoPlayOn) { 
            this._isAutoPlayOn = true;
            this._setClassButtonPlayIco('pause');
            this.onAutoPlay();
        }
    }

    stopAutoPlay() {
        if (this._isAutoPlayOn) { 
            this._isAutoPlayOn = false;
            this._setClassButtonPlayIco('play');
            clearTimeout(this._timerAutoPlayID);
        }
    }

    toggleAutoPlay() {
        if (!this._isAutoPlayOn) {
            this.startAutoPlay();
        } else {
            this.stopAutoPlay();
        }
    }

    go(dir) {
        if (this._isWork) return;
        if (!this.currentItem.isContentLoaded) return;
        
        dir = dir || 1;
        this._isWork = true;
        this.nextItemNum = this._getNextItemNum(dir);
        this.nextItem = this.slItems[this.nextItemNum];

        //init for current item
        this.currentItem.style.zIndex = 2;
        //init for next item
        this.nextItem.style.zIndex = 1;

        this._animateMove(dir);
    }

    moveTo(itemNumber) {
        if (this._isWork) return;//todo

        const dir = (itemNumber < this.currentItemNum) ? 1 : -1;
        this._isWork = true;

        clearTimeout(this._timerAutoPlayID);

        this.nextItem = this.slItems[itemNumber];
        this.nextItemNum = itemNumber;
        
        if(!this.nextItem.isContentLoaded && (this.nextItem._promiseContentLoad || this._loadContent(this.nextItem) )) { //last expression is just download the content
            this.nextItem._promiseContentLoad.finally( ()=>this.moveTo(itemNumber) );
            this._isWork = false;
            return;
        }

        //init for current item
        this.currentItem.style.zIndex = 2;
        //init for next item
        this.nextItem.style.zIndex = 1;

        this._animateMove(dir);
    }

    onAutoPlay() {
        if(this._isWork) return; //происходит анимация, автовоспроизв будет запущено ф-ией transitionComplete

        const autoPlay = function () {
            const currentItem = this.currentItem;
            let nextItemNum = this._getNextItemNum(),
                nextItem = this.slItems[nextItemNum];

            if(!currentItem.isContentLoaded) {
                clearTimeout(this._timerAutoPlayID);
                if(currentItem._promiseContentLoad || this._loadContent(currentItem)) { //last expression is just download the content
                    currentItem._promiseContentLoad.finally(autoPlay);
                }
                return;
            }

            if(!nextItem.isContentLoaded) {
                clearTimeout(this._timerAutoPlayID);
                if(nextItem._promiseContentLoad || this._loadContent(nextItem)) { //last expression is just download the content
                    nextItem._promiseContentLoad.finally(autoPlay);
                }
                return;
            }
            this.go();

        }.bind(this);

        clearTimeout(this._timerAutoPlayID);//д.б. запущен только один таймер - перед запуском следущего отменяем текущий(если сущ)
        this._timerAutoPlayID = setTimeout(autoPlay, this._autoPlayDelay);
    }

    setActiveBullet() {
        const bulNumber = this.slItems.length - 1 - this.currentItemNum;
        let exActive = this.bullets.getElementsByClassName(StatusClassName.BULLET_ACTIVE)[0],
            newActive = this.bullets.getElementsByClassName(ClassNameEl.BULLETS_ITEM)[bulNumber];

        if(exActive) exActive.classList.remove(StatusClassName.BULLET_ACTIVE);

        if(newActive) newActive.classList.add(StatusClassName.BULLET_ACTIVE);
    }

// ***************************************
// Private methods
// ***************************************

    _initSlider(opts) {

        this._setScrim();
        this._initElems(opts);

        //init click and touch interface
        this.$slEl.on('click', this._onClick, this);
        this._initTouchEvent();

        this._setAnimateFunc(opts.typeAnimation);

    }

    _initElems(opts) {
        const currentItem = this.currentItem,
            initDependentEls = function () {
                currentItem.style.zIndex = 1; 
                this._preLoadContent(this.currentItemNum); //загружаем остальные фотографии (которые должны подгрузиться в данный момент времени)
                this._initBullets(opts);
                this._initInfoBlock(opts);
                if(opts.isAutoPlay || DefaultValues.IS_AUTO_PlAY) this.startAutoPlay();
            }.bind(this),

            errorLoad = function () {
                this._initElems(opts); 
            }.bind(this);

        this._loadContent(currentItem); //load first img
        currentItem._promiseContentLoad.then(initDependentEls , errorLoad);
    };

    _initBullets() {
        if (!this.bullets) return;

        this._createBullets();
        this.setActiveBullet();
    }

    _initInfoBlock(opts) {
        if (!this.slInfoBlock) return;

        this._setInfoAnimateFunc(opts.typeInfoAnimation);
        this._animateInfoBlock();
    }

    //return promise
    _loadContent(item) {
        const img = SimSlider._getImg(item),
            src = img.getAttribute(Attribute.DATA_IMG_SRC),
            imgLoad = document.createElement('img')
            self = this;

        img.style.opacity = 0;

        item._promiseContentLoad = new Promise((resolve, rejected) => {
            if (!src) { //если загружено, просто показываем - уже как фоновое изображение
                img.style.opacity = 1;
                item.isContentLoaded = true;
                resolve({src, img});
                return;
            }

            imgLoad.onload = onLoad;
            imgLoad.onerror = onError;
            imgLoad.src = src;

            function onLoad() {
                img.style.backgroundImage = "url(" + src + ")";
                img.setAttribute(Attribute.DATA_IMG_SRC, '');
                img.style.opacity = '';
                item.isContentLoaded = true;
                resolve({item, src});
            }

            function onError() {
                self._deleteItems(item);
                rejected({item, src});
            }

        });

        return item._promiseContentLoad;
    }

    _preLoadContent(itemNum) {
        let qtPreload = this._qtPreload,
            slItems = this.slItems;//[].slice.call(this.slItems);

        if (qtPreload*2 > slItems.length - 1) qtPreload = Math.floor((slItems.length - 1)/2);

        for (let i = itemNum-1; i >= itemNum - qtPreload; i--) {
            let item;
             if (i < 0) {
                item = slItems[slItems.length + i]
            } else {
                item = slItems[i];
            }
            if (item.isContentLoaded) continue;
            this._loadContent(item).catch( ()=>this._preLoadContent(itemNum) );
        }

        for (let i = itemNum+1; i <= itemNum + qtPreload; i++) {
            let item;
            if (i >= slItems.length) {
                item = slItems[i - slItems.length]
            } else {
                item = slItems[i];
            }
            if (item.isContentLoaded) continue;
            this._loadContent(item);
            //this._loadContent(item).catch( ()=>this._preLoadContent(itemNum) );
        }

    }

    _onClick(e) { 
        if (e.target.closest('.' + ClassNameEl.BUTTON_PLAY)) {
            this.toggleAutoPlay();
            return;
            
        } else if (this._isWork) {
            return;

        } else if (e.target.closest('.' + ClassNameEl.BUTTON_NEXT)) {
            const dir = 1;
            this.go(dir);
            
        } else if (e.target.closest('.' + ClassNameEl.BUTTON_PREV)) {
            const dir = -1;
            this.go(dir);

        } else if (e.target.closest('.' + ClassNameEl.BULLETS_ITEM)) {
            const item = e.target.closest('.' + ClassNameEl.BULLETS_ITEM),
                items = [].slice.call(this.bullets.children),
                itemNumber =items.length - 1 - items.indexOf(item);
            
            this.moveTo(itemNumber);
        } 
    }

    _initTouchEvent() {//todo
    };

    _getNextItemNum(dir) {
        const curNum = this.currentItemNum,
            slItems = this.slItems;

        if (dir === -1) {
            return curNum >= (slItems.length - 1) ? 0 : curNum + 1;
        } else {
            return curNum === 0 ? (slItems.length - 1) : curNum - 1;
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
        const typeAn = typeAnimation || DefaultStyleAnim.SLIDE,
            stSlideAnimation = SimSlider._stSlideAnimate[typeAn];

        this._animateMove = stSlideAnimation instanceof Function ? stSlideAnimation : SimSlider._stSlideAnimate[DefaultStyleAnim.SLIDE];
    }

    _setInfoAnimateFunc(typeInfoAnimation) {
        const typeAn = typeInfoAnimation || DefaultStyleAnim.INFO,
            stInfoAnimation = SimSlider._stInfoAnimate[typeAn];

        this._animateInfoBlock = stInfoAnimation instanceof Function ? stInfoAnimation : SimSlider._stInfoAnimate[DefaultStyleAnim.INFO];
    }

    _createEventAnimate(type, detail) {
        this.$slEl.triggerCustomEvent(type, detail);
    }

    _setTextInfoBlock() {
        const currentItem = this.currentItem,
            textTitle = currentItem.getAttribute(Attribute.DATA_INFO_TITLE),
            textDescr = currentItem.getAttribute(Attribute.DATA_INFO_DESCRIPTION);

        this.titleInfoBlock.innerHTML = textTitle;
        this.descrInfoBlock.innerHTML = textDescr;
    }
    
    _setScrim() {
        const item = this.nextItem || this.currentItem; //this.currentItem - for init slider
        this.scrim.style.backgroundColor = item.getAttribute(Attribute.DATA_SCRIM_COLOR) || DefaultValues.SCRIM_COLOR;
    }

    _createBullets() {
        const bullets = this.bullets;
        let bullsWidth = bullets.clientWidth,
            self = this,
            el = null,
            quantityItems = null,
            bullWidth =null,
            quantity = null;

        window.addEventListener('resize', onResize);

        if (!bullsWidth) { //for mobile
            return;
        } else {
            bullets.isCreated = true;
        }

        el = createBul();

        quantityItems = this.slItems.length;
        bullWidth = getWSpaceEl(el);
        quantity = getQuantity();

        for (let i=1; i<quantity; i++) { //i==1 - because one bullet already exist
            bullets.appendChild(createBul());
        }

        function getWSpaceEl(el) {
            const marginLeft = parseInt(getComputedStyle(el).marginLeft),
                marginRight = parseInt(getComputedStyle(el).marginRight),
                width = el.offsetWidth;
                return marginLeft + width + marginRight;
        }

        function createBul() {
            let el = document.createElement('li');
            el.classList.add(ClassNameEl.BULLETS_ITEM);
            bullets.appendChild(el);
            return el;
        }

        function getQuantity() {
            return bullsWidth > (bullWidth * quantityItems) ? quantityItems : Math.floor(bullsWidth / bullWidth);
        }

        function onResize() {
            if (!bullets.clientWidth) return;
            if (bullets.clientWidth && !bullets.isCreated) {
                self._createBullets();
                self.setActiveBullet();
                return;
            }

            if (el) bullWidth = getWSpaceEl(el); //if the width to change

            let oldQuantity = quantity,
                newQuantity = getQuantity(),
                delta = newQuantity - oldQuantity,
                bulletsCollection = bullets.getElementsByClassName(ClassNameEl.BULLETS_ITEM);
            
            quantity = newQuantity;

            if(delta < 0) {
                for (let j=0; j>delta; j--) {
                    bullets.removeChild(bulletsCollection[bulletsCollection.length+j-1]);
                }
            } else if (delta > 0) {
                for (let j=0; j<delta; j++) {
                    bullets.appendChild(createBul());
                }
            }
        }
    }

    _deleteItems(item) {
        const bullets = this.bullets;
        this.slEl.removeChild(item);

        if (bullets) {
            const bulletsCollection = bullets.getElementsByClassName(ClassNameEl.BULLETS_ITEM);
            if (bulletsCollection.length) bullets.removeChild(bulletsCollection[bulletsCollection.length-1]);
        }

        if (this.currentItem === item) {
            this.currentItemNum = this._getNextItemNum();
            this.currentItem = this.slItems[this.currentItemNum];
        } else {
            let items = [].slice.call(this.slItems),
                itemNumber = items.indexOf(item),
                currentItemNum = this.currentItemNum;
            this.currentItemNum = currentItemNum < itemNumber ? currentItemNum : currentItemNum - 1;
        }

    }

// ***************************************
// Static methods
// ***************************************

//necessary actions:
//call OnAutoPlay();
//set currentItemNum = nextItemNum
//set currentItem = nextAnimEl;
//trigger event start/stopSlideAnimation, 
    static get _stSlideAnimate() {
        return {
            fade: function () {
                const animEl = this.currentItem,
                    nextAnimEl = this.nextItem,
                    $animEl = ElU(this.currentItem);

                //trigger event of start animation for other module
                this._createEventAnimate('startSlideAnimation', {currentItem: animEl, nextItem: nextAnimEl});
                    
                animEl._$el = $animEl;

                $animEl.on('transitionend.fade', transitionComplete, this);
                animEl.style.transition = `opacity ${this._transSpeed/1000}s ease-in`;
                animEl.style.opacity = 0;

                this._setScrim();

                function transitionComplete(e) {
                    const animEl = this.currentItem,
                        $animEl = animEl._$el;

                    if (e.target === animEl && e.propertyName !== 'opacity') return; //todo: audit e.propertyName != 'opacity'

                    $animEl.off('transitionend.fade');
                    //reset style for current item after loading nextItem content if nextItem is loaded
                    nextAnimEl._promiseContentLoad.then( () =>{ //todo: protected???
                        animEl.style.cssText = ''; //Z-index: 0
                    });
                    //preparation transition for next item
                    this.nextItem.style.willChange = "opacity";

                    this.currentItemNum = this.nextItemNum;
                    this.currentItem = nextAnimEl;
                    this._isWork = false; //todo: protected???
                    this.nextItem = null;
                    this.nextItemNum = null;

                    if (this.bullets) this.setActiveBullet();
            
                    //trigger event of stop animation
                    this._createEventAnimate('stopSlideAnimation', {currentItem: animEl, nextItem: nextAnimEl}); //todo: protected???
                
                    if (this._isAutoPlayOn) this.onAutoPlay();

                    //preload next imgs
                    this._preLoadContent(this.currentItemNum); //todo: protected???
                }

            }
        }
    }

    static get _stInfoAnimate() {
        return {
            shift: function () { 
                const titleInfoBlock = this.titleInfoBlock,
                    descrInfoBlock = this.descrInfoBlock;

                this._setTextInfoBlock();

                this.$slEl.on('stopSlideAnimation', shiftOn, this);

                
                function shiftOn(e) {
                    descrInfoBlock.classList.add(ClassElModifier.INFO_DESCRIPTION_INITANIM);
                    titleInfoBlock.classList.add(ClassElModifier.INFO_TITLE_INITANIM);
                    
                    this._setTextInfoBlock();

                    SimSlider.reflow(this.slInfoBlock);

                    descrInfoBlock.classList.remove(ClassElModifier.INFO_DESCRIPTION_INITANIM);
                    titleInfoBlock.classList.remove(ClassElModifier.INFO_TITLE_INITANIM);
                }

            }
        }
    }


static _getImg(el) {
     return el.getElementsByClassName(ClassNameEl.IMG)[0];
}

static reflow(el) {
    return el.offsetHeight;
}

}


// ------------------------------------------------------------------------
// Initialization 
// ------------------------------------------------------------------------

let simSliders = document.getElementsByClassName(CLASS_SL_ELEM);

for (let i=0; i<simSliders.length; i++) {
    let opts = {
        slEl: simSliders[i]
    };
    window.simSlider = new SimSlider(opts);
     
}

});