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
 * ElU - Element Utilites
 * @constructor
 * @param {Node} el
 * @param {[String] || String || undefined} [modules], '' or undefined, '*' for all
 * @return wrapper for HTMLElement
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
     *
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
     * 
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
         * Delete all (use recurcion) non used event spaces into $el.eventSpaces for type - type
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
         * @param {Object} obj 
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
    }
  
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
 * space for plugin
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

// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

    class Dropdown {

        // ***************************************
        // Constructor
        // ***************************************
        
        /**
         *
         * @param {object}      opts                optional
         * @param {HTMLElement} opts.targetEl       optional
         * @param {HTMLElement} opts.triggerEl      optional
         * @param {object}      opts.customAnimate  optional    {show: f, hide: f [, transitionComplete: f]}
         * @param {boolean}     opts.isAnimation    optional
         * @param {boolean}     opts.isToggle       optional
         * @param {object}      opts.$triggerEl     optional    instance of class ElU
         * @param {object}      opts.$targetEl      optional    instance of class ElU
         *
         */
        constructor(opts) {
            let triggerEl = opts.triggerEl,
                idTarget = triggerEl && triggerEl.getAttribute(Attribute.DATA_TARGET),
                targetEl = opts.targetEl || idTarget && document.getElementById(idTarget);
                
            this.customAnimate = opts.customAnimate; //save customAnimate = {show: f, hide: f [, transitionComplete: f]}
            
            this._triggerEl = triggerEl;
            this._targetEl = targetEl;
            this._isAnimation = opts.isAnimation || true;
            
            this._$triggerEl = opts.$triggerEl || triggerEl && ElU(triggerEl);
            this._$targetEl = opts.$targetEl || targetEl && ElU(targetEl);

            //todo хранить экземпляр в dom-эл-те
            targetEl._dropdown = this;

            if (opts.isToggle) this.toggle();

            //onclick for triggerEl
            this._$triggerEl && this._$triggerEl.on('click.toggle', this.toggle, this);
            
        };
        
        
        // ***************************************
        // Public methods
        // ***************************************

        toggle() {
            
            if (this._targetEl.classList.contains(ClassNameEl.SHOW)) {
                this.hide();
            } else {
                this.show();
            }
        }

        show() {
            
            const el = this._targetEl,
                trEl =  this._triggerEl;

            if (el.classList.contains(ClassNameEl.SHOW) || el.classList.contains(ClassNameEl.TRANSITIONING)) return;

            el.classList.add(ClassNameEl.SHOW);
            trEl && trEl.classList.add(ClassNameTr.SHOW);
            
            if(this._isAnimation && !this.customAnimate) {
                Dropdown._defaultAnimate.show(this);
            } else if (this.customAnimate) {
                this.customAnimate.show(this);
            }

        }

        hide() {
                const el = this._targetEl,
                    trEl = this._triggerEl;

            if (!el.classList.contains(ClassNameEl.SHOW) || el.classList.contains(ClassNameEl.TRANSITIONING)) return;

            trEl && trEl.classList.remove(ClassNameTr.SHOW);

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
        

        _isHidden() {
            let el = this._targetEl;
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

        //defaultAnimate return {show: f, hide: f, transitionComplete: f
        static get _defaultAnimate() {
            return {

                show: function (inst) {
                    const el = inst._targetEl,
                        $el = inst._$targetEl;

                    el.classList.add(ClassNameEl.TRANSITIONING);

                    el.style.height = 0;

                    $el.on('transitionend.complete', this.transitionComplete, $el);

                    el.style.height = el.scrollHeight + 'px';

                },

                hide: function (inst) {

                    const el = inst._targetEl,
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
                }
            }
        }
    }

    
    
// ------------------------------------------------------------------------
// Initialization - for all dropdown elements when it click
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

    ElU.fn.dropdown = function (params) {

        let opts = {
            targetEl: this._el,
            $targetEl: this,
            ...params
        };

        new Dropdown(opts);

        return this;

    };


// ------------------------------------------------------------------------
// ElU static method:
// ------------------------------------------------------------------------

    ElU.dropdown = Dropdown;

});

