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

