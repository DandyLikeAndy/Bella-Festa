'use strict';
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

'use strict';
(function() {

/**
 * ElU - Element Utilities
 *
 * @constructor
 * @param {Node} el - element
 * @param {String[] | String} [modules] - modules for use, '', '*' or undefined for all modules
 * @return {object} wrapper for HTMLElement $el = ElU(el);
 */
function ElU(el, modules) {

    //if call without new
    if (!(this instanceof ElU)) {
        return new ElU(el, modules);
    }

    try {
        if (!(el instanceof Node)) throw new Error(el + ' element does not instanceof Node') ;
    } catch (err) {
        console.error(err.message);
    }
    this._el = el;

    //if call without modules - add all modules
    if (!modules || modules === '*' || !(modules instanceof Array)) {
        modules = [];
        for (let key in ElU.modules) {
            if (ElU.modules.hasOwnProperty(key)) {
                modules.push(key);
            }
        }

        //init modules
        for (let i = 0; i < modules.length; i++) {
            ElU.modules[modules[i]](this);
        }
    }
}
/**
 * modules for ElU Element Utilities
 */
ElU.modules = {};
ElU.modules.event = function (el) {
    /**
     * add event handler for $el
     * @param {string} type - Event type, can set namespaces: 'click.name[.name.....]',
     *          if only 'click', namespaces does not set
     * @param {function} handler - Handler, 'this' support (this == context)
     * @param {object} [context]  - optional Context
     * @this {HTMLElement || Object}
     */
    el.on = function (type, handler, context) {

        if (context) {
            let oldHandler = handler;
            handler = function (e) {
                return oldHandler.call(context, e);
            }
        }
        
        if (type.search(/\./)) {
           
            this.eventSpaces = this.eventSpaces || {};

            let nameSpaces = type.split('.'),
                eventSpaces = this.eventSpaces;

            type = nameSpaces[0];

            for (let i = 0; i < nameSpaces.length; i++) {
                const name = nameSpaces[i];
                eventSpaces[name] = eventSpaces[name] || {};

                if (i === nameSpaces.length - 1) {
                    eventSpaces[name].handlers = eventSpaces[name].handlers || [];
                    eventSpaces[name].handlers.push(handler);
                }
                eventSpaces = eventSpaces[name];
            }
        }
        
        if (type === 'transitionend') {

            this.onTransitionend(handler);
            
            return;
            
        }
        
        this._el.addEventListener(type, handler, false);
    };

    /**
     * remove event handler for $el
     * @param {string} type - Event type, can has namespaces 
     * @param {*} [handler] optional
     */
    el.off = function (type, handler) {
        
        if (type.search(/\./)) {
            let handlers = getHandlers(this),
                nameSpaces = type.split('.');
                
            if (!handlers) {
                console.error('spaceEvents is undefined: ' + type);
                return;
            }
            

            type = nameSpaces[0];

            for (let i = 0; i < handlers.length; i++) {

                if (type === 'transitionend') {
                    this.offTransitionend(handlers[i]);
                    continue;
                }

                this._el.removeEventListener(type, handlers[i]);
            }

            deleteNonUsedEventSpaces(this.eventSpaces, type);

            return;
        }
        
        if (type === 'transitionend') {
            this.offTransitionend(handler);
            return;
        }

        this._el.removeEventListener(type, handler);

        //----------------------------
        //function for internal use
        //----------------------------

        /**
         * get handlers and delete its eventsSpaces (for increase the speed)
         * @param {*} $el 
         */
        function getHandlers($el) {

            let nameSpaces = type.split('.'),
                eventSpaces = $el.eventSpaces,
                handlers = [];

            if (!eventSpaces) return;

            for (let i = 0; i < nameSpaces.length; i++) {
                const name = nameSpaces[i],
                    evSubSpaces = eventSpaces[name];
                
                if (!evSubSpaces) return;

                if (i === nameSpaces.length-1) {

                    handlers = handlers.concat(getIntHandlers(evSubSpaces));
                    
                    delete eventSpaces[name];
                }
                eventSpaces = evSubSpaces;
            }

            return handlers;
        }
        /**
         * get all handlers into the eventSpaces
         * @param {Object} eventSpaces 
         */
        function getIntHandlers(eventSpaces) {

            let handlers = [];

            for (let key in eventSpaces) {

                if (eventSpaces.hasOwnProperty(key)) {
                    if (key === 'handlers' && (eventSpaces[key] instanceof Array)) {
                        handlers = handlers.concat(eventSpaces[key]);

                        continue;
                    }
                    //check subElements (recursion)
                    handlers = handlers.concat(getIntHandlers(eventSpaces[key]));
                }
            }
            return handlers;
        }

        /**
         * Delete all (use recursion) non used event spaces into $el.eventSpaces for type - type
         * @param {Object} eventSpaces for check ($el.eventSpaces without type)
         * @param {string} type - key in eventSpaces[key] for delete, if not used
         */
        function deleteNonUsedEventSpaces(eventSpaces, type) {
            let evSubSpaces = eventSpaces[type];

            for (let key in evSubSpaces) {

                if (evSubSpaces.hasOwnProperty(key)) {
                    if (evSubSpaces.handlers && (evSubSpaces.handlers instanceof Array)) continue;
                    if (isEmpty(evSubSpaces[key])) {
                        delete evSubSpaces[key];
                    } else {
                        deleteNonUsedEventSpaces(evSubSpaces, key);
                    }
                }
            }
            if (isEmpty(evSubSpaces)) delete eventSpaces[type];
        }

        /**
         * check object for emptiness
         * @param {Object} obj test object;
         */
        function isEmpty(obj) {
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        }
    };

    /**
     * Trigger custom event
     * @param {string} type - event type
     * @param {object} [detail] - detail
     * @param {object} [params] - {bubbles=true, cancelable=true [,detail]}
     */
    el.triggerCustomEvent = function (type, detail, params) {

        let evProp = {},
            event;

        params = params || {};
        params.bubbles = params.bubbles || true;
        params.cancelable = params.cancelable ||true;
        
        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                evProp[key] = params[key];
            }
        }

        if (detail) {
            evProp.detail = detail;
        }

        event = new CustomEvent(type, evProp);

        this._el.dispatchEvent(event);

    };

    el.onTransitionend = function(handler) {

        const el = this._el;

        if (el.style.transition === undefined &&
            el.style.WebkitTransition === undefined &&
            el.style.OTransition === undefined &&
            el.style.MozTransition === undefined) {
                handler();
                return;
        }
        
        el.addEventListener('transitionend', handler, false);
        el.addEventListener('webkitTransitionEnd', handler, false);
        el.addEventListener('oTransitionEnd', handler, false);
    };
  
    el.offTransitionend = function(handler) {

        const el = this._el;

            el.removeEventListener('transitionend', handler, false);
            el.removeEventListener('webkitTransitionEnd', handler, false);
            el.removeEventListener('oTransitionEnd', handler, false);
    }
};

ElU.modules.dom = function (el) {
    /**
     * Find el by Attribute
     * @param {string} attribute 
     * @param {string} value 
     */
    el.getElementsByAttribute = function(attribute, value) {
        let allElements = this._el.getElementsByTagName('*'),
            elem,
            found = [];
    
    for (let i = 0; i < allElements.length; i++) {

        elem = allElements[i];

        const attrValue = elem.getAttribute(attribute);

        if (elem.getAttribute(attribute)) {
            if (!value || attrValue === value) {
                found.push(elem);
            }
        }
    }

    return found;
    }
};



/**
 * space for plugins
 */

ElU.fn = ElU.prototype = {};


/**
 * expose the library
 * define ElU as a global ElU variable, saving the original ElU to restore later if needed
 */

if (typeof window !== 'undefined') {
    expose();
}

function expose() {
    let oldElU = window.oldElU;
    ElU.noConflict = function () {
        window.ElU = oldElU;
        return this;
    };
    window.ElU = ElU;
}


})();

document.addEventListener('DOMContentLoaded', function () {
    let $target = ElU(document.getElementById('nav-menu__drop-down'));
    $target.on('dropdownShow', function(e) {
        console.log('dropdownShowEvent', e);
    })
    $target.on('dropdownHide', function(e) {
        console.log('dropdownHideEvent', e);
    })
    $target.on('dropdownShown', function(e) {
        console.log('dropdownShownEvent', e);
    })
    $target.on('dropdownHidden', function(e) {
        console.log('dropdownHiddenEvent', e);
    })
}, false);
// ------------------------------------------------------------------------
// dropdown.js
// ------------------------------------------------------------------------


document.addEventListener('DOMContentLoaded', function () {

// ------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------

    const Class = {
        TARGET_ELEM: 'dropdown',
        TRIGGER_ELEM: 'button-menu'
    };

    const Attribute = {
        DATA_TOGGLE: 'data-toggle',
        DATA_TARGET: 'data-target',
        DATA_IS_ANIMATION: 'data-is-animation'
    };

    const AttrValue = {
        DATA_TOGGLE: 'drop-down'
    };

    const ClassNameEl = {
        SHOW: `${Class.TARGET_ELEM}_open`,
        TRANSITIONING: `${Class.TARGET_ELEM}_transitioning`
    };

    const ClassNameTr = {
        SHOW: `${Class.TRIGGER_ELEM}_open`
    };


// ------------------------------------------------------------------------
// Dependencies
// ------------------------------------------------------------------------
   const ElU = window.ElU; //$elem
   if(!ElU) {
        console.error('for create Dropdown instance need ElU library');
        return;
   }

// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

    class Dropdown {

        // ***************************************
        // Constructor
        // ***************************************
        
        /**
         *
         * @param {object}      opts                    Object with parameters
         * 
         * @param {HTMLElement} [opts.targetEl]         Target element, 
         *                                              if it is not specified, 
         *                                              it is taken from the trigger element attribute (Attribute.DATA_TARGET)
         *                                              
         * @param {HTMLElement} [opts.triggerEl]        Trigger element
         * 
         * @param {object}      [opts.customAnimate]    Custom animation {show: f, hide: f [, transitionComplete: f]}
         * @param {boolean}     [opts.isAnimation=true] Use animation?
         * 
         * @param {boolean}     [opts.isToggle=false]   Call dropdown.toggle()?
         * 
         * @param {ElU}         [opts.$triggerEl]       Instance of class ElU, for call event handlers
         * @param {ElU}         [opts.$targetEl]        Instance of class ElU, for call event handlers
         *
         */
        constructor(opts) {

            const triggerEl = opts.triggerEl,
                idTarget = triggerEl && triggerEl.getAttribute(Attribute.DATA_TARGET),
                targetEl = opts.targetEl || idTarget && document.getElementById(idTarget);
                
            this.customAnimate = opts.customAnimate; //save customAnimate = {show: f, hide: f [, transitionComplete: f]}
            
            this.triggerEl = triggerEl;
            this.targetEl = targetEl;
            this._isAnimation = opts.isAnimation || true;
            
            this._$triggerEl = opts.$triggerEl || triggerEl && ElU(triggerEl);
            this._$targetEl = opts.$targetEl || targetEl && ElU(targetEl);

            targetEl._dropdown = this;

            if (opts.isToggle) this.toggle();

            //onclick for triggerEl
            this._$triggerEl && this._$triggerEl.on('click.toggle', this.toggle, this);
            
        };
        
        
        // ***************************************
        // Public methods
        // ***************************************

        toggle() {
            
            if (this.targetEl.classList.contains(ClassNameEl.SHOW)) {
                this.hide();
            } else {
                this.show();
            }
        }

        show() {
            
            const el = this.targetEl,
                trEl =  this.triggerEl,
                $el = this._$targetEl;

            if (el.classList.contains(ClassNameEl.SHOW) || el.classList.contains(ClassNameEl.TRANSITIONING)) return;

            el.classList.add(ClassNameEl.SHOW);
            trEl && trEl.classList.add(ClassNameTr.SHOW);

            $el.triggerCustomEvent('dropdownShow');
            
            if(this._isAnimation && !this.customAnimate) {
                Dropdown._defaultAnimate.show(this);
            } else if (this.customAnimate) {
                this.customAnimate.show(this);
            } 

        }

        hide() {
                const el = this.targetEl,
                    trEl = this.triggerEl,
                    $el = this._$targetEl;

            if (!el.classList.contains(ClassNameEl.SHOW) || el.classList.contains(ClassNameEl.TRANSITIONING)) return;

            trEl && trEl.classList.remove(ClassNameTr.SHOW);

            $el.triggerCustomEvent('dropdownHide');

            if (this._isAnimation && !this.customAnimate) {
                Dropdown._defaultAnimate.hide(this);

            } else if (this.customAnimate) {
                this.customAnimate.hide(this);
            } 

            el.classList.remove(ClassNameEl.SHOW);

        }

        
        // ***************************************
        // Private methods
        // ***************************************
        

        _isHidden() { //not use yet
            let el = this.targetEl;
            return !el.offsetWidth && !el.offsetHeight;
        }
        
        
        
        // ***************************************
        // Static methods
        // ***************************************


        static init($elem, trigInitEl) {
            let triggerEls = $elem.getElementsByAttribute('data-toggle', 'drop-down'),
                dropdowns = [];

            for (let i = 0; i < triggerEls.length; i++) {
                let triggerEl = triggerEls[i];
                dropdowns.push(new Dropdown({
                    triggerEl,
                    isAnimation: triggerEl.getAttribute(Attribute.DATA_IS_ANIMATION) || true,
                    isToggle: triggerEl === trigInitEl
                }))
            }
            return dropdowns;
        }

        static reflow(el) {
            return el.offsetHeight;
        }

        //_defaultAnimate return {show: f, hide: f, transitionComplete: f
        static get _defaultAnimate() {
            return {

                show: function (inst) {
                    const el = inst.targetEl,
                        $el = inst._$targetEl;
                    
                    el.classList.add(ClassNameEl.TRANSITIONING);

                    el.style.height = 0;

                    $el.on('transitionend.complete', this.transitionComplete, $el);

                    el.style.height = el.scrollHeight + 'px';

                },

                hide: function (inst) {

                    const el = inst.targetEl,
                        $el = inst._$targetEl;

                    //el.style.height = el.scrollHeight + 'px';
                    el.style.height = el.getBoundingClientRect().height + 'px';

                    $el.on('transitionend.complete', this.transitionComplete, $el);

                    Dropdown.reflow(el);
                    
                    el.classList.add(ClassNameEl.TRANSITIONING);
                    
                    el.style.height = 0;

                },

                transitionComplete: function (e) {

                    if (!(e && e.target === e.currentTarget && e.propertyName === 'height')) return;

                    const el = this._el,
                        $el = this;

                    el.classList.remove(ClassNameEl.TRANSITIONING);

                    $el.off('transitionend.complete');

                    el.style.height = '';
                    
                    //trigger event
                    if (el.classList.contains(ClassNameEl.SHOW)) {
                        $el.triggerCustomEvent('dropdownHidden');
                    } else {
                        $el.triggerCustomEvent('dropdownShown');
                    }
                }
            }
        }
    }

    
    
// ------------------------------------------------------------------------
// Initialization - for all dropdown elements when one of the elements is clicked
// ------------------------------------------------------------------------

    let $document = ElU(document);

    $document.on('click.initDropdown', initDropdown);

    function initDropdown(e) {

        //todo: add polyfill closest
        const trigInitEl = e.target.closest(`[${Attribute.DATA_TOGGLE}="${AttrValue.DATA_TOGGLE}"]`);

        if (!trigInitEl) return;

        if (trigInitEl.tagName === 'A') {
            event.preventDefault();
        }

        $document.off('click.initDropdown');

        return Dropdown.init($document, trigInitEl);
    }


// ------------------------------------------------------------------------
// ElU module:
// ------------------------------------------------------------------------
    ElU.fn = ElU.prototype;


    ElU.fn.dropdown = function (params) {

        let opts = {
            targetEl: this._el,
            $targetEl: this,
        };

        for (let key in params) {
            if (params.hasOwnProperty(key)) {
                opts[key] = params[key];
            }
        }

        new Dropdown(opts);

        return this;

    };


// ------------------------------------------------------------------------
// ElU static method:
// ------------------------------------------------------------------------

    ElU.dropdown = Dropdown;

});


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
    INFO: `${CLASS_SL_ELEM}__container-info`,
    INFO_TITLE: `${CLASS_SL_ELEM}__title-info`,
    INFO_DESCRIPTION: `${CLASS_SL_ELEM}__description-info`,
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
    DATA_IMG_SRC: 'data-img-realsrc',
    DATA_INFO_TITLE: 'data-title',
    DATA_INFO_DESCRIPTION: 'data-description',
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
        this.slInfoBlock = slEl.getElementsByClassName(ClassNameEl.INFO)[0];
        this.buttonPlayIco = slEl.querySelector('.' + ClassNameEl.BUTTON_PLAY + ' .' + ClassNameEl.BUTTON_ICO);
        
        //save instance in element
        this.slEl._sl = this;

        this._$slEl = ElU(slEl);
        this._currentItemNum = this.slItems.length - 1; //*** !!! it is number of top element item  in slider
        this._nextItemNum = null;
        this._currentItem = this.slItems[this._currentItemNum]; //*** !!!
        this._isWork = null;
        this._isAutoPlayOn = null;
        this._timerAutoPlayID = null;
        this._qtPreloaded = opts.qtPreloaded || 1;
        this._autoPlayDelay = opts.autoPlayDelay || 3000;
        this._transSpeed = opts.transSpeed || 1000;
        //this._currentItem._promiseContentLoad = null;//save promise with result of load content

        //initialization
        this._initElms();
        this._initTouchEvent();
        this._setAnimateFunc(opts.typeAnimation);
        this._setInfoAnimateFunc(opts.typeInfoAnimation);
        this._animateInfoBlock();

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
        if(this._isWork) return; //происходит анимация, автовоспроизв будет запущено ф-ией transitionComplete
        
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
        currentItem.style.zIndex = 1; //todo:will-change
        this._preLoadImgs(this._currentItemNum); //загружаем остальные фотографии (которые должны подгрузиться в данный момент времени)

        $slEl.on('click', this._onClick, this);
    }

    //return promise
    _loadImg(img) { //todo rejected
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
                img.style.opacity = '';
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

    _initTouchEvent() {//todo
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

    _setInfoAnimateFunc(typeInfoAnimation) {
        let typeAn = typeInfoAnimation || 'shift',
            stInfoAnimation = SimSlider._stInfoAnimate[typeAn];

        this._animateInfoBlock = stInfoAnimation instanceof Function ? stInfoAnimation : SimSlider._stInfoAnimate.move;
    }

    _createEventAnimate(type, detail) {
        this._$slEl.triggerCustomEvent(type, detail);
    }

    _setTextInfoBlock() {
        let currentItem = this._currentItem,
            infoBlock = this.slInfoBlock,
            textTitle = currentItem.getAttribute(Attribute.DATA_INFO_TITLE),
            textDescription = currentItem.getAttribute(Attribute.DATA_INFO_DESCRIPTION),
            titleBlock = infoBlock.getElementsByClassName(ClassNameEl.INFO_TITLE)[0],
            descriptionBlock = infoBlock.getElementsByClassName(ClassNameEl.INFO_DESCRIPTION)[0];

        titleBlock.innerHTML = textTitle;
        descriptionBlock.innerHTML = textDescription;
    }


// ***************************************
// Static methods
// ***************************************

//necessary actions:
//call OnAutoPlay();
//set currentItemNum = nextItemNum
//set currentItem = nextAnimEl;
//trigger event start/stopAnimation, 
    static get _stSlideAnimate() {
        return {
            fade: function () { //?????
                const animEl = this._currentItem,
                    nextAnimEl = this.slItems[this._nextItemNum],
                    $animEl = ElU(this._currentItem);

                //triger event of start animation for other module
                this._createEventAnimate('startAnimation', {currentItem: animEl, nextItem: nextAnimEl});
                    
                animEl._$el = $animEl;

                $animEl.on('transitionend.fade', transitionComplete, this);
                animEl.style.transition = `opacity ${this._transSpeed/1000}s ease-in`;
                animEl.style.opacity = 0;

                function transitionComplete(e) {
                    const animEl = this._currentItem,
                        $animEl = animEl._$el;

                    if (e.target === animEl && e.propertyName != 'opacity') return;
                    $animEl.off('transitionend.fade');
                    
                    //reset style for current item after loading nextItem content
                    nextAnimEl._promiseContentLoad.then( () =>{
                        animEl.style.cssText = 'Z-index: 0';
                    });
                    //preparation transition for next item
                    this.slItems[this._nextItemNum].style.willChange = "opacity";

                    //triger event of stop animation 
                    this._createEventAnimate('stopAnimation', {currentItem: animEl, nextItem: nextAnimEl});

                    this._currentItemNum = this._nextItemNum;
                    this._currentItem = nextAnimEl;
                    this._isWork = false;
            
                
                    if (this._isAutoPlayOn) this.onAutoPlay();
                }

            }
        }
    }

    static get _stInfoAnimate() {
        return {
            shift: function () { 

                this._setTextInfoBlock();


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
        currentImgNum = $slItems.length - 1, //it is number of top element item  in slider
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

            if(isAnimationInfo) { //для плавной анимации???
                preLoadImgs(currentImgNum);
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
