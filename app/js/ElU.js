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
    //todo: function triggerEvent
    el.triggerEvent = function (type, detail) {};

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
