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
// Dependences
// ------------------------------------------------------------------------
   const ElU = window.ElU;

// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

    class Dropdown {

// ------------------------------------------------------------------------
// Constructor
// ------------------------------------------------------------------------

        constructor(opts) {
            let triggerEl = opts.triggerEl,
                idTarget = triggerEl && triggerEl.getAttribute(Attribute.DATA_TARGET),
                targetEl = opts.targetEl || idTarget && document.getElementById(idTarget);
                
            this.customAnimate = opts.customAnimate //save customAnimate = {show: f, hide: f [, transitionComplete: f]}
            
            this._triggerEl = triggerEl;
            this._targetEl = targetEl;
            this._isAnimation = opts.isAnimation || true;
            
            this._$triggerEl = opts.$triggerEl || triggerEl && ElU(triggerEl);
            this._$targetEl = opts.$targetEl || ElU(targetEl);

            //todo хранить экземпляр в dom-эл-те
            targetEl._dropdown = this;

            if (opts.isToggle) this.toggle();

            //onclick for triggerEl
            this._$triggerEl && this._$triggerEl.on('click.toggle', this.toggle, this);
            
        };

        // Public methods

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


        // Private methods

        _isHidden() {
            let el = this._targetEl;
            return !el.offsetWidth && !el.offsetHeight;
        }

        // Static methods

        static init($elem, trigInitEl) {
            let triggerEls = $elem.getElementsByAttribute('data-toggle', 'drop-down'),
                dropdowns = [];

            for (let i = 0; i<triggerEls.length; i++) {
                let triggerEl= triggerEls[i];
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

        static get _defaultAnimate() {
            return {
                
                show: function(inst) {
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
    $document.on('click.initDropDown', initDropdown);

    function initDropdown (e) {

        //todo: add polyfill closest
        const trigInitEl = e.target.closest(`[${Attribute.DATA_TOGGLE}="${AttrValue.DATA_TOGGLE}"]`);

        if (!trigInitEl) return;

        if (trigInitEl.tagName === 'A') {
            event.preventDefault();
        }
        
        $document.off('click.initDropDown');
        
        return Dropdown.init($document, trigInitEl);
    }

ElU.fn.dropdown = function (params) { 

    let opts = {
        targetEl: this._el,
        $targetEl: this,
        ...params
    };

    new Dropdown(opts);

    return this;

 };

});

