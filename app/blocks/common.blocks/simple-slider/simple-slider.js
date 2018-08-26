/**
 * Слайдер
 * изображения загружаются по требованию, с использованием параметра qtPreloaded
 * изображения это background-images блоков с классом base-slider__item,
 * src изображений необходимо поместить в атрибут data-img-realsrc,
 * требуется функции: onTransitionend, offTransitionend, verticalAlign,  jQuery
 *
 *
 * @param options {object} параметры:
 *      elem: корневой элемент слайдера,
 *      isAutoPlay: наличие автозапуска при загрузке,
 *      autoPlayDelay: пауза между кадрами,
 *      qtPreloaded: кол-во предзагружаемых эл-тов, перед и после текущего
 *
 * @constructor
 */
function BaseSlider(options) {
    var slider = options.elem,
        $slItems = $('.base-slider__item', slider),
        $slInfoBlocks = $slItems.find('.base-slider__info'),
        currentImgNum = $slItems.length - 1, //it is top element item in slider
        nextImgNum, dir,
        $buttonPlay = $('.base-slider__button_play-pause i', slider),
        isWork, isAnimationInfo, timerAutoPlayID, timerLoadID,
        $currentItem, $nextInfoBlock,
        self = this;

    this.autoPlay = autoPlay;
    this.isAutoPlay = null;

    initElms();
    initTouchEvent();
    if(options.isAutoPlay) autoPlay(true);

    function initElms() {
        loadImg($slItems[currentImgNum]);//"подгружаем" текущее изображение
        $currentItem = $slItems.eq(currentImgNum);
        $currentItem.css({
            'zIndex': 1,
            'will-change': 'transform'
        });
        preLoadImgs(currentImgNum); //загружаем остальные фотографии (которые должны подгрузиться в данный момент времени)
        slider.onclick = onClick;

    }

    function preLoadImgs(imgNum) {
        var qtPreloaded = options.qtPreloaded || 1;
        if ( qtPreloaded > $slItems.length-1 ) qtPreloaded = $slItems.length-1;
        for ( var i = imgNum-qtPreloaded; i <= imgNum+qtPreloaded; i++ ) {
            if (i==imgNum) continue; // т.к.текущ. изобр загружено
            var img = $slItems[i];
            if (!img && i<0) img = $slItems[$slItems.length + i];
            else if (!img && i>0) img = $slItems[i - $slItems.length];
            if (img.isloaded) continue;
            loadImg(img);
        }
    }

    function loadImg(img) {
        var src = img.getAttribute('data-img-realsrc');

        if (!src) { //если загружено, просто показываем //todo: ?? почему уже загружен??
            img.style.opacity = 1;
            img.isloaded = true;
            return;
        }

        var imgLoad = document.createElement('img');
        imgLoad.onload = onLoad;
        imgLoad.src = src;

        function onLoad() {
            img.style.backgroundImage = "url(" + src + ")";
            img.setAttribute('data-img-realsrc', '');
            img.style.opacity = 1;
            img.style.willChange = 'opacity';
            img.isloaded = true;
        }
    }

    function  onClick(e) {
        if ( $(e.target).closest('.base-slider__button_play-pause').length ) autoPlay();
        else if (isWork) return;

        if ( $(e.target).closest('.base-slider__button_dir-next').length ) {
            dir = 1;
            go(dir);
        }
        else if ( $(e.target).closest('.base-slider__button_dir-prev').length ) {
            dir = -1;
            go(dir);
        }

    }

    function go(dir) {
        if (isWork) return;
        isWork = true;
        dir = dir || 1;

        initMove();

        function initMove() {

            if(isAnimationInfo) {
                preLoadImgs(currentImgNum);//???
                isAnimationInfo = false;
            }

            nextImgNum = getNextImgNum(dir);
            if (!$slItems[currentImgNum].isloaded) return;

            $currentItem.css({
                'zIndex': 2,
                'transition': ''
            });

            $slItems[nextImgNum].style.zIndex = 1;

            $nextInfoBlock = $slInfoBlocks.eq(nextImgNum);

            hideInfo( $slInfoBlocks.eq(currentImgNum) );
            hideInfo($nextInfoBlock);

            move(document.documentElement.clientWidth * -dir);
        }
    }

    function move(distance) {
        $currentItem.css('transform','translateX(' + distance + 'px)' );

        onTransitionend({
            $el: $currentItem,
            handler: finish
        });

        /*if( dir==1 && $nextInfoBlock ) startShowInfo( $nextInfoBlock );*/ /*если инфоблок показываем одновременоо с анимацией слайда */
    }


    function finish(e) {

        if (e && e.originalEvent.propertyName != 'transform' && e.originalEvent.propertyName != '-webkit-transform') return; /*-webkit-transform - bug of Edge IE*/

        $currentItem.off('transitionend webkitTransitionEnd mozTransitionEnd oTransitionEnd msTransitionEnd', finish);

        $currentItem.css({
            'zIndex': '',
            'transition': 'none',
            'transform': '',
            'will-change': ''
            });

        $slItems[nextImgNum].style.willChange = 'transform';

        currentImgNum = nextImgNum;
        $currentItem = $slItems.eq(currentImgNum);
        isWork = false;

        if( /*dir == -1 && */$nextInfoBlock ) { //инфоблок показываем после того как следующее изображение будет полностью показано, приторомозив предзагрузку
            startShowInfo( $nextInfoBlock );
        } else if (!isAnimationInfo) {
            preLoadImgs(currentImgNum); //подготавливаем следующие изображения
        }

        if(self.isAutoPlay) autoPlay(true);

    }

    /**
     * запуск автовоспр.
     * @param play {boolean} если false -  запускает/остан. setTimeout в зависимости
     *      от наличия класса icon-pause/icon-play на кнопке .base-slider__button_play-pause -
     *      для остан/воспр. пользователем или внешним кодом,
     *      true - установка setTimeout - для смены следющего изображения
     */
    function autoPlay(play) {

        if (!play) {

            if ( $buttonPlay.hasClass('icon-play') ) {
                autoPlay(true);
                return;
            }
            clearTimeout(timerAutoPlayID);
            clearTimeout(timerLoadID);

            $buttonPlay.removeClass('icon-pause').addClass('icon-play');
            self.isAutoPlay = false;

        } else if (play)  {

            self.isAutoPlay = true;

            if( $buttonPlay.hasClass('icon-play') ) $buttonPlay.removeClass('icon-play').addClass('icon-pause');
            if( isWork ) return; //происходит анимация, автовоспроизв будет запущено ф-ией finish
            if( !$slItems[getNextImgNum()].isloaded ) {
                clearTimeout(timerAutoPlayID);
                /*; /!*!!!!*!/
                clearTimeout(timerLoadID);*/
                timerLoadID = setTimeout( function(){ autoPlay(true); }, 1000);//если след. изображ не загружено делаем паузу и пробуем снова
                return;

            }

            clearTimeout(timerAutoPlayID);//д.б. запущен только один таймер - перед запуском следущего отменяем текущий(если сущ)
            timerAutoPlayID = setTimeout(go, options.autoPlayDelay);

        }
    }

    function startShowInfo($infoBlock) {
        onTransitionend({
            $el: $infoBlock,
            handler: onTransitionEndInfo
        });
        $infoBlock.removeClass('base-slider__info_hidden');
        isAnimationInfo = true;
    }

    function onTransitionEndInfo() {
        isAnimationInfo = false;
        if (!isWork) {
            preLoadImgs(currentImgNum);
        }

        offTransitionend({$el: $currentItem, handler: onTransitionEndInfo})
    }

    function getNextImgNum(dir){
        if(dir == -1) {
            return nextImgNum = currentImgNum >= $slItems.length - 1 ? 0 : currentImgNum + 1;
        } else {
            return nextImgNum = currentImgNum === 0 ? $slItems.length - 1 : currentImgNum - 1;
        }
    }


    function showInfo($elem) {
        $elem.removeClass('base-slider__info_hidden');
    }

    function hideInfo($elem) {
        $elem.addClass('base-slider__info_hidden');
    }


    /*touchEvent*/

    function initTouchEvent() {

        var startTouchX = null;
        var startTouchY = null;

        slider.addEventListener('touchstart', startTouchMove);
        slider.addEventListener('touchmove', touchMove);
        slider.addEventListener('touchend', cancelTouchMove);


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
            var deltaX = startTouchX - e.targetTouches[0].clientX;
            var deltaY = startTouchY - e.targetTouches[0].clientY;
            if (Math.abs(deltaX) < 30 || Math.abs(deltaY) > 25) return;
            go(deltaX > 0 ? 1 : -1);
        }
    }
}
