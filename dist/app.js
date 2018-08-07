/**
 * Adding an event to complete the animation
 * @param options.$el {jQuery} the element that will have event handler
 * @param options.el {Object} the element that will have event handler
 * @param [options.selector] {string} filter (if(options.$el))
 * @param options.handler {function} handler
 */
function onTransitionend(options) {
    if (document.body.style.transition === undefined &&
        document.body.style.WebkitTransition === undefined &&
        document.body.style.OTransition === undefined &&
        document.body.style.MozTransition === undefined) {
        options.handler();
        return;
    }

    if(options.$el) {
        options.$el.on(
        'transitionend ' +
        'webkitTransitionEnd ' +
        'mozTransitionEnd ' +
        'oTransitionEnd ' +
        'msTransitionEnd',
            options.selector,
            options.handler);

    } else if (options.el) {
        options.el.addEventListener('transitionend', options.handler, false);
        options.el.addEventListener('webkitTransitionEnd', options.handler, false);
        options.el.addEventListener('mozTransitionEnd', options.handler, false);
        options.el.addEventListener('oTransitionEnd', options.handler, false);
        options.el.addEventListener('msTransitionEnd', options.handler, false);
    }

}

/**
 * Removing an event Handler for animation
 * @param options.$el {jQuery} the element that have event handler
 * @param options.el {Object} the element that have event handler
 * @param [options.selector] {string} filter (if(options.$el))
 * @param options.handler {function} handler
 */

function offTransitionend(options) {
    if (options.$el) {
        options.$el.off('transitionend webkitTransitionEnd mozTransitionEnd oTransitionEnd msTransitionEnd',options.selector, options.handler);
    } else if (options.el) {
        options.el.removeEventListener('transitionend', options.handler, false);
        options.el.removeEventListener('webkitTransitionEnd', options.handler, false);
        options.el.removeEventListener('mozTransitionEnd', options.handler, false);
        options.el.removeEventListener('oTransitionEnd', options.handler, false);
        options.el.removeEventListener('msTransitionEnd', options.handler, false);
    }

}


/**
 * add class/remove class/class existence check
 * @param el
 * @param cls
 */

function addClass(el, cls) {

    var classList = (el.className) ?  el.className.split(' ') : [];
    for(var i=0; i<classList.length; i++) {
        if (classList[i] == cls) return;
    }
    classList.push(cls);
    el.className = classList.join(' ');
}

function removeClass(el, cls) {
    var classList = el.className.split(' ');
    for(var i=0; i<classList.length; i++) {
        if (classList[i] == cls) classList.splice(i--, 1);
    }
    el.className = classList.join(' ');
}

function hasClass(el, cls) {
    var classList = el.className.split(' ');
    for(var i=0; i<classList.length; i++) {
        if (classList[i] == cls) return true;
    }
    return false;
}


/**
 * function getElementsByAttribute
 * @param attribute for search
 * @param value {String} the elements will be found only with the this value
 * @param context {Element} search context, default == document
 * @returns {Array}
 */
function getElementsByAttribute(attribute, value, context) {
    var allElements = ( context || document ).getElementsByTagName('*'),
        el,
        found = [];

    for (var i = 0; i < allElements.length; i++) {

        el = allElements[i];
        var attrValue = el.getAttribute(attribute);

        if (el.getAttribute(attribute)) {
            if (!value || attrValue === value) {
                found.push(el);
            }
        }
    }
    return found;
}


/** function of animation, with support function requestAnimationFrame
 *@param {object} opts
 *        opts.duration {number} общее время анимации, ms
 *	      opts.delta(progress) {function} определяет состояние анимации в зависимости от progress
 *        opts.step(delta) {function} занимается отрисовкой состояния анимации в зависимости от значения возвращаемого функцией delta
 *	      opts.complete {function} ф-ия выполняемая при завершении анимации
 * @returns {number} AnimationFrame identifier
 */

if (window.requestAnimationFrame) {

    /** function of animation with requestAnimationFrame
     *
     */
    var animate = function(opts) {
        var start = performance.now();
        var delta = opts.delta || linear;

        function frame(time) {
            var progress = (time - start) / opts.duration;
            if (progress > 1) progress = 1;
            opts.step(delta(progress));
            if (progress == 1) {
                opts.complete && opts.complete();
                return;
            }
            requestAnimationFrame(frame);
        }

        return requestAnimationFrame( frame );
    }
} else {
    /** function of animation without requestAnimationFrame
     *
     */
     animate = function(opts) {
        var start = new Date; //фиксируем время начала анимации
        var delta = opts.delta || linear;
        var timer = setInterval(frame, opts.delay || 13);

        function frame() {
            var progress = (new Date - start) / opts.duration; //значение выполнения анимации
            if (progress > 1) progress = 1; //Так как вычисления с дробными числами не всегда точны, может быть > 1
            opts.step( delta(progress) );
            if (progress == 1) {
                clearInterval(timer);
                opts.complete && opts.complete();//если есть ф-ия по завершению анимации - выполняем
            }
        }
        return timer;
    }
}

//********Различные значения delta


function linear(progress) {
    return progress;
}

function pow2(progress) {
    return Math.pow(progress, 2);
}

function pow5(progress) {
    return Math.pow(progress, 5);
}

function arc(progress) {
    return 1 - Math.sin(Math.acos(progress))
}

var backX = 1.5;
function back(progress, x) {
    if (x === undefined) x = backX;
    return Math.pow(progress, 2) * ((x + 1) * progress - x)
}

function bounce(progress) {
    for (var a = 0, b = 1, result; 1; a += b, b /= 2) {
        if (progress >= (7 - 4 * a) / 11) {
            return -Math.pow((11 - 6 * a - 11 * progress) / 4, 2) + Math.pow(b, 2)
        }
    }
}

var elasticX = 1.5;
function elastic(progress, x) {
    if (x === undefined) x = elasticX;
    return Math.pow(2, 10 * (progress-1)) * Math.cos(20*Math.PI*x/x*2*progress)
}

//********EaseOut

function makeEaseOut(delta) {
    return function(progress) {
        return ( 1 - delta(1 - progress) );
    }
}
var bounceEaseOut = makeEaseOut(bounce)

//********EaseInOut

function makeEaseInOut(delta) {
    return function(progress) {
        if (progress < .5)
            return delta(2*progress) / 2;
        else
            return (2 - delta(2*(1-progress))) / 2;
    }
}

var bounceEaseInOut = makeEaseInOut(bounce);


/**
 * Анимация CSS-свойства opts.prop у элемента opts.elem
 * от opts.start до opts.end
 *
 * @param {object} opts
 *        {string} opts.prop анимируемое св-во (например: transform)
 *        {string} opts.subProp анимируемое подсвойство (например: translateY, для transform: translateY(х);
 *        {number} opts.start начальное значение
 *        {number} opts.end конечное значение
 *        {object} opts.elem анимируемый эл-нт
 *        {string} opts.units единицы измерения
 *
 * Остальные параметры указаны и передаются в animate(opts)
 * @returns {number} timer identifier ( from animate(opts) )
 */
function animateProp(opts) {
    var start = opts.start,
        end = opts.end,
        prop = opts.prop,
        units = opts.units || 0,
        subProp = opts.subProp;

    if (opts.prop == 'transform') {
        opts.step = function (delta) {
            var valSubProp = Math.round(start + (end - start) * delta);
            opts.elem.style[prop] = subProp + '(' + valSubProp + units + ')';
        };
    } else {
        if (opts.units == 'px') {
            opts.step = function (delta) {
                opts.elem.style[prop] = Math.round(start + (end - start) * delta) + units;
            };
        } else {
            opts.step = function (delta) {
                opts.elem.style[prop] = start + (end - start) * delta + units;
            };
        }

    }
    return animate(opts);
}

/**
 *
 * @param elem
 * @param parent
 * @returns {*}
 */
function closestEl(elem, parent) {

    while ( elem !== null && elem != parent ) {
        elem = elem.parentNode;
    }

    return elem;
}

/**
 *
 * @param el
 */

function verticalAlign(el) {
    var height = el.clientHeight,
        vPortHeight = document.documentElement.clientHeight,
        top = vPortHeight/2 - height/2 + 'px';
    if (height > vPortHeight) top = 0;
    el.style.top = top;
}

document.addEventListener('DOMContentLoaded', function () {

// ------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------

    const CLASS_DROP_ElEM = 'dropdown';

    const Attribute = {
        DATA_TOGGLE: 'data-toggle',
        DATA_TARGET: 'data-target',
        DATA_IS_ANIMATION: 'data-is-animation'
    };

    const AttrValue = {
        DATA_TOGGLE: 'drop-down'
    };

    const ClassName = {
        SHOW: `${CLASS_DROP_ElEM}_open`
    };


// ------------------------------------------------------------------------
// Dependences
// ------------------------------------------------------------------------
    const onTrEnd = onTransitionend;


    function on(el, type, handler, context) {
        if (context) {
            handler = function () {
                handler.call(context);
            }
        }
        el.addEventListener(type, handler, false);
    }

// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

    class Dropdown {

// ------------------------------------------------------------------------
// Constructor
// ------------------------------------------------------------------------

        constructor(opts) {
            let triggerEl = opts.triggerEl,
                idTarget = triggerEl.getAttribute(Attribute.DATA_TARGET),
                targetEl = document.getElementById(idTarget);

            console.log(Attribute.DATA_TARGET);
            console.log(triggerEl.getAttribute(Attribute.DATA_TARGET));
            console.log(targetEl);

            this._triggerEl = triggerEl;
            this._dropDownEl = targetEl;
            this._isTransitioning = null;

            //todo хранить экземпляр в dom-эл-те
            targetEl._dropdown = this;

            //handlers todo создать свою обертку для элемента, реализующую полезности let $targetEl = Utils(targetEl);
            on(targetEl, 'click', this.toggle, this);
        };

        // Public methods



        toggle() {
            console.log('on');
            if (this._dropDownEl.classList.contains(ClassName.SHOW)) {
                this.show();
            } else {
                this.hide();
            }
        }

        show() {

            const el = this._dropDownEl;

            if (el.classList.contains(ClassName.SHOW) || el._isTransitioning) return;

            el.style.height = 0;
            el.classList.add(ClassName.SHOW);

            onTrEnd({
                el: el,
                handler: function () {
                    el._dropdown._showComplete();
                }
            });

            el.style.height = el.scrollHeight;

        }

        hide() {

        }


        // Private methods


        _showComplete() {

            const el = this._dropDownEl;
            //todo check element

            el.style.height = '';
            offTransitionend({el, handler: this._showComplete});
        }

        _getHeightEl(el) {

        }

        _isHidden() {
            let el = this._dropDownEl;
            return !el.offsetWidth && !el.offsetHeight;
        }

        // Static methods

        static init(opts) {
            return new Dropdown(opts);
        }


    }


// ------------------------------------------------------------------------
// Initialization
// ------------------------------------------------------------------------
    document.addEventListener('click', function (e) {

        //todo: add polyfill closest
        const triggerEl = e.target.closest(`[${Attribute.DATA_TOGGLE}="${AttrValue.DATA_TOGGLE}"]`);

        if (!triggerEl) return;

        if (triggerEl.tagName === 'A') {
            event.preventDefault();
        }

        let opts = {
            triggerEl,
            isAnimation: triggerEl.getAttribute(Attribute.DATA_IS_ANIMATION) || true
        };
        //todo: проверка инициализации об-та
        return Dropdown.init(opts);
    });
});

