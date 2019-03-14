// ------------------------------------------------------------------------
// simple-slider.js
// ------------------------------------------------------------------------
// The essence of the slider:
// There is a deck of elements, the current item at the top (currentItem.style.zIndex = 2), 
// the next item below it (nextItem.style.zIndex = 1). 
// Next, the upper (current) item moves(animation) and returns to its native position (zIndex = 0).
// Then the next item will turn into the current item and everything will repeat again

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
        BULLET_ACTIVE: `${ClassNameEl.BULLETS_ITEM}_active`
    };

    const Attribute = {
        DATA_IMG_SRC: 'data-img-realsrc',
        DATA_INFO_TITLE: 'data-title',
        DATA_INFO_DESCRIPTION: 'data-description',
        DATA_SCRIM_COLOR: 'data-scrim-color'
    };

//for infoBlock animation
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
    if (!ElU) {
        console.error('for create SimSlider instance need ElU library');
        return;
    }


// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

    class SimSlider {
        /**
         * Creation SimpleSlider instance
         * @param {Object} opts - options
         * @param {HTMLElement} opts.slEl - slider element
         * @param {Number} opts.qtPreload - quantity preload items
         * @param {Number} opts.autoPlayDelay - Delay for auto play (sec)
         * @param {Number} opts.transSpeed - duration of animation item (sec)
         * @param {String} opts.typeAnimation - type(name) of animation
         * @param {Boolean} opts.isAutoPlay - start animation after loading slider
         * @param {String} opts.typeInfoAnimation - type(name) of animation infoBlock
         */
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
            this.transSpeed = opts.transSpeed || DefaultValues.TRANS_SPEED;
            this.nextItemNum = null; //define go(dir)
            this.nextItem = null; //define go(dir)
            this.isWork = null;
            //this.currentItem.promiseContentLoad = null;//save promise with result of load content

            //save instance in element
            this.slEl.sl = this;

            //Protected properties
            this._isAutoPlayOn = null;
            this._timerAutoPlayID = null;
            this._qtPreload = opts.qtPreload || DefaultValues.QT_PRELOAD;
            this._autoPlayDelay = opts.autoPlayDelay || DefaultValues.AUTO_PlAY_DElAY;

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

        /**
         * slider movement to the left/right
         * @param {number} [dir] direction of movement: 1 -> right, -1 -> left, default - right
         */
        go(dir) {
            if (this.isWork) return;
            if (!this.currentItem.isContentLoaded) return;

            dir = dir || 1;
            this.isWork = true;
            this.nextItemNum = this._getNextItemNum(dir);
            this.nextItem = this.slItems[this.nextItemNum];

            //init for current item
            this.currentItem.style.zIndex = 2;
            //init for next item
            this.nextItem.style.zIndex = 1;

            this._animateMove(dir);
        }

        /**
         * slider movement to the item
         * @param {number} itemNumber - number of item
         */
        moveTo(itemNumber) {
            if (this.isWork) return;
            if (itemNumber === this.currentItemNum) return;

            const dir = (itemNumber < this.currentItemNum) ? 1 : -1;

            this.isWork = true;

            clearTimeout(this._timerAutoPlayID);


            this.nextItem = this.slItems[itemNumber];
            this.nextItemNum = itemNumber;

            if (!this.nextItem.isContentLoaded && (this.nextItem.promiseContentLoad || this._loadContent(this.nextItem))) { //last expression is just download the content
                this.nextItem.promiseContentLoad.finally(() => this.moveTo(itemNumber));
                this.isWork = false;
                return;
            }

            //init for current item
            this.currentItem.style.zIndex = 2;
            //init for next item
            this.nextItem.style.zIndex = 1;

            this._animateMove(dir);
        }

        /**
         * auto play launch
         */
        onAutoPlay() {
            if (this.isWork) return; //происходит анимация, автовоспроизв будет запущено ф-ией transitionComplete

            const autoPlay = function () {
                const currentItem = this.currentItem;
                let nextItemNum = this._getNextItemNum(),
                    nextItem = this.slItems[nextItemNum];

                if (!currentItem.isContentLoaded) {
                    clearTimeout(this._timerAutoPlayID);
                    if (currentItem.promiseContentLoad || this._loadContent(currentItem)) { //last expression is just download the content
                        currentItem.promiseContentLoad.finally(autoPlay);
                    }
                    return;
                }

                if (!nextItem.isContentLoaded) {
                    clearTimeout(this._timerAutoPlayID);
                    if (nextItem.promiseContentLoad || this._loadContent(nextItem)) { //last expression is just download the content
                        nextItem.promiseContentLoad.finally(autoPlay);
                    }
                    return;
                }
                this.go();

            }.bind(this);

            clearTimeout(this._timerAutoPlayID);//д.б. запущен только один таймер - перед запуском следущего отменяем текущий(если сущ)
            this._timerAutoPlayID = setTimeout(autoPlay, this._autoPlayDelay);
        }

        /**
         * sets the bullet active
         */
        setActiveBullet() {
            const bulNumber = this.slItems.length - 1 - this.currentItemNum;
            let exActive = this.bullets.getElementsByClassName(StatusClassName.BULLET_ACTIVE)[0],
                newActive = this.bullets.getElementsByClassName(ClassNameEl.BULLETS_ITEM)[bulNumber];

            if (exActive) exActive.classList.remove(StatusClassName.BULLET_ACTIVE);

            if (newActive) newActive.classList.add(StatusClassName.BULLET_ACTIVE);
        }

        /**
         * Preload content of item
         * @param {Number} itemNum - central item number
         */
        preLoadContent(itemNum) {
            let qtPreload = this._qtPreload,
                slItems = this.slItems;//[].slice.call(this.slItems);

            if (qtPreload * 2 > slItems.length - 1) qtPreload = Math.floor((slItems.length - 1) / 2);

            for (let i = itemNum - 1; i >= itemNum - qtPreload; i--) {
                let item;
                if (i < 0) {
                    item = slItems[slItems.length + i]
                } else {
                    item = slItems[i];
                }
                if (item.isContentLoaded) continue;
                this._loadContent(item).catch(() => this.preLoadContent(itemNum));
            }

            for (let i = itemNum + 1; i <= itemNum + qtPreload; i++) {
                let item;
                if (i >= slItems.length) {
                    item = slItems[i - slItems.length]
                } else {
                    item = slItems[i];
                }
                if (item.isContentLoaded) continue;
                this._loadContent(item);
                //this._loadContent(item).catch( ()=>this.preLoadContent(itemNum) );
            }

        }

        /**
         * Create Event of Animate
         * @param {String} type
         * @param {Object} detail - details of Event
         */
        createEventAnimate(type, detail) {
            this.$slEl.triggerCustomEvent(type, detail);
        }

        /**
         * Set scrim for Slider
         */
        setScrim() {
            const item = this.nextItem || this.currentItem; //this.currentItem - for init slider
            this.scrim.style.backgroundColor = item.getAttribute(Attribute.DATA_SCRIM_COLOR) || DefaultValues.SCRIM_COLOR;
        }

        /**
         * Hide infoBlock
         */
        hideInfo() {
            this.slInfoBlock.style.display = 'none';
        }

        /**
         * Show infoBlock
         */
        showInfo() {
            this.slInfoBlock.style.display = '';
        }



// ***************************************
// Private methods
// ***************************************

        /**
         * slider initialization
         * @param {Object} opts options for slider
         * @private
         */
        _initSlider(opts) {

            this.setScrim();
            this._initElems(opts);

            //init click and touch interface
            this.$slEl.on('click', this._onClick, this);
            this._initTouchEvent();

            this._setAnimateFunc(opts.typeAnimation);

        }

        /**
         * slider elements initialization
         * @param {Object} opts options for slider
         * @private
         */
        _initElems(opts) {
            const currentItem = this.currentItem,
                initDependentEls = function () {
                    currentItem.style.zIndex = 1;
                    this.preLoadContent(this.currentItemNum); //загружаем остальные фотографии (которые должны подгрузиться в данный момент времени)
                    this._initBullets(opts);
                    this._initInfoBlock(opts);
                    if (opts.isAutoPlay || DefaultValues.IS_AUTO_PlAY) this.startAutoPlay();
                }.bind(this),

                errorLoad = function () {
                    this._initElems(opts);
                }.bind(this);

            this._loadContent(currentItem); //load first img
            currentItem.promiseContentLoad.then(initDependentEls, errorLoad);
        };

        /**
         * Bullets initialization
         * @private
         */
        _initBullets() {
            if (!this.bullets) return;

            this._createBullets();
            this.setActiveBullet();
        }

        /**
         * InfoBlock initialization
         * @private
         */
        _initInfoBlock(opts) {
            if (!this.slInfoBlock) return;

            this._setInfoAnimateFunc(opts.typeInfoAnimation);
            this._animateInfoBlock();
        }

        /**
         * Load content of item
         * @param {HTMLElement} item
         * @returns {Promise} Promise of load content
         * @private
         */
        _loadContent(item) {
            const img = SimSlider._getImg(item),
                src = img.getAttribute(Attribute.DATA_IMG_SRC),
                imgLoad = document.createElement('img'),
                self = this;

            img.style.opacity = 0;

            item.promiseContentLoad = new Promise((resolve, rejected) => {
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

            return item.promiseContentLoad;
        }

        _onClick(e) {
            if (e.target.closest('.' + ClassNameEl.BUTTON_PLAY)) {
                this.toggleAutoPlay();
                return;

            } else if (this.isWork) {
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
                    itemNumber = items.length - 1 - items.indexOf(item);

                if (itemNumber === this.currentItemNum) return;

                this.moveTo(itemNumber);
            }
        }

        _initTouchEvent() {
            let startTouchX = null,
                startTouchY = null;

            this.$slEl.on('touchstart', startTouchMove);
            this.$slEl.on('touchmove', touchMove, this);
            this.$slEl.on('touchend', cancelTouchMove);


            function startTouchMove(e) {
                startTouchX = e.targetTouches[0].clientX;
                startTouchY = e.targetTouches[0].clientY;
            }

            function cancelTouchMove(e) {
                startTouchX = null;
                startTouchY = null;
            }

            function touchMove(e) {
                if (e.targetTouches.length != 1) return;
                let deltaX = startTouchX - e.targetTouches[0].clientX,
                    deltaY = startTouchY - e.targetTouches[0].clientY;
                if (Math.abs(deltaX) < 30 || Math.abs(deltaY) > 25) return;
                this.go(deltaX > 0 ? 1 : -1);
            }
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

            } else if (button.classList.contains(StatusClassName.ICO_PLAY) && action === 'pause') {
                button.classList.remove(StatusClassName.ICO_PLAY);
                button.classList.add(StatusClassName.ICO_PAUSE);
            }
        }

        /**
         * Set animation function for item
         * @param {String} typeAnimation
         * @private
         */
        _setAnimateFunc(typeAnimation) {
            const typeAn = typeAnimation || DefaultStyleAnim.SLIDE,
                stSlideAnimation = SimSlider._stSlideAnimate[typeAn];

            this._animateMove = stSlideAnimation instanceof Function ? stSlideAnimation : SimSlider._stSlideAnimate[DefaultStyleAnim.SLIDE];
        }

        /**
         * Set animation function for infoBlock
         * @param typeInfoAnimation
         * @private
         */

        _setInfoAnimateFunc(typeInfoAnimation) {
            const typeAn = typeInfoAnimation || DefaultStyleAnim.INFO,
                stInfoAnimation = SimSlider._stInfoAnimate[typeAn];

            this._animateInfoBlock = stInfoAnimation instanceof Function ? stInfoAnimation : SimSlider._stInfoAnimate[DefaultStyleAnim.INFO];
        }

        /**
         * Set text in InfoBlock
         * @private
         */
        _setTextInfoBlock() {
            const currentItem = this.currentItem;

            this.titleInfoBlock.innerHTML = currentItem.getAttribute(Attribute.DATA_INFO_TITLE);
            this.descrInfoBlock.innerHTML = currentItem.getAttribute(Attribute.DATA_INFO_DESCRIPTION);
        }

        /**
         * create bullets and set handler bullets for window.resize
         * @private
         */
        _createBullets() {
            const bullets = this.bullets;
            let bullsWidth = bullets.clientWidth,
                self = this,
                el = null,
                quantityItems = null,
                bullWidth = null,
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

            for (let i = 1; i < quantity; i++) { //i==1 - because one bullet already exist
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

                if (delta < 0) {
                    for (let j = 0; j > delta; j--) {
                        bullets.removeChild(bulletsCollection[bulletsCollection.length + j - 1]);
                    }
                } else if (delta > 0) {
                    for (let j = 0; j < delta; j++) {
                        bullets.appendChild(createBul());
                    }
                }
            }
        }

        /**
         * Delete items from slider
         * @param item
         * @private
         */
        _deleteItems(item) {
            const bullets = this.bullets;
            this.slEl.removeChild(item);

            if (bullets) {
                const bulletsCollection = bullets.getElementsByClassName(ClassNameEl.BULLETS_ITEM);
                if (bulletsCollection.length) bullets.removeChild(bulletsCollection[bulletsCollection.length - 1]);
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

        /**
         * collection of function animation for item
         * Each function must:
         * call:
         * OnAutoPlay(),
         * setScrim(),
         * preLoadContent(itemNum),
         * setActiveBullet()
         * set:
         * currentItemNum = this.nextItemNum,
         * currentItem = nextAnimEl,
         * isWork = false,
         * nextItem = null,
         * nextItemNum = null;
         * trigger event start/stopSlideAnimation
         *
         * @returns {Object} {typeAnimation: function}
         * @private
         */
        static get _stSlideAnimate() {
            return {
                fade: function () {
                    const animEl = this.currentItem,
                        nextAnimEl = this.nextItem,
                        $animEl = ElU(this.currentItem);

                    //trigger event of start animation for other module
                    this.createEventAnimate('startSlideAnimation', {currentItem: animEl, nextItem: nextAnimEl});

                    animEl.$el = $animEl;

                    $animEl.on('transitionend.fade', transitionComplete, this);
                    animEl.style.transition = `opacity ${this.transSpeed / 1000}s ease-in`;
                    animEl.style.opacity = 0;

                    this.setScrim();

                    function transitionComplete(e) {
                        const animEl = this.currentItem,
                            $animEl = animEl.$el;

                        if (e.target === animEl && e.propertyName !== 'opacity') return;

                        $animEl.off('transitionend.fade');
                        //reset style for current item after loading nextItem content if nextItem is loaded
                        nextAnimEl.promiseContentLoad.then(() => {
                            animEl.style.cssText = ''; //Z-index: 0
                        });
                        //preparation transition for next item
                        this.nextItem.style.willChange = "opacity";

                        this.currentItemNum = this.nextItemNum;
                        this.currentItem = nextAnimEl;
                        this.isWork = false;
                        this.nextItem = null;
                        this.nextItemNum = null;

                        if (this.bullets) this.setActiveBullet();

                        //trigger event of stop animation
                        this.createEventAnimate('stopSlideAnimation', {currentItem: animEl, nextItem: nextAnimEl});

                        if (this._isAutoPlayOn) this.onAutoPlay();

                        //preload next content of item
                        this.preLoadContent(this.currentItemNum);
                    }

                }
            }
        }

        /**
         * function animation and initialization for infoBlock
         * @returns {Object} {typeInfoAnimation: function}
         * @private
         */
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

        /**
         * get content(img) from item
         * @param {HTMLElement} el - item
         * @returns {Node | Element}
         * @private
         */
        static _getImg(el) {
            return el.getElementsByClassName(ClassNameEl.IMG)[0];
        }

        /**
         * reflow
         * @param el
         * @returns {number}
         */
        static reflow(el) {
            return el.offsetHeight;
        }

    }


// ------------------------------------------------------------------------
// Initialization 
// ------------------------------------------------------------------------

    let simSliders = document.getElementsByClassName(CLASS_SL_ELEM);

    for (let i = 0; i < simSliders.length; i++) {
        let opts = {
            slEl: simSliders[i]
        };
        window.simSlider = new SimSlider(opts);

    }

});