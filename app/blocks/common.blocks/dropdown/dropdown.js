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
   //todo проверка существования завиимостей: ElU, onTransitionEnd

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
                targetEl = opts.targetEl || document.getElementById(idTarget);
                

            this._triggerEl = triggerEl;
            this._targetEl = targetEl;
            this._isTransitioning = null;
            this._isAnimation = opts.isAnimation;

            this._$triggerEl = ElU(triggerEl);
            this._$targetEl = ElU(targetEl);

            //todo хранить экземпляр в dom-эл-те
            targetEl._dropdown = this;

            if (opts.isToggle) this.toggle();

            //onclick for triggerEl
            this._$triggerEl.on('click.toggle', this.toggle, this);
            
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
                trEl =  this._triggerEl,
                $el = this._$targetEl;

            if (el.classList.contains(ClassNameEl.SHOW) || el._isTransitioning) return;

            el.classList.add(ClassNameEl.SHOW);
            trEl.classList.add(ClassNameTr.SHOW);
            
            if(this._isAnimation) {
                Dropdown._defaultAnimate.show(this);
            }

           /* //for standard animation (first value)
            el.style.height = 0;

            $el.on('transitionend.show', this._transitionComplete, this);

            //for standard animation (end value)
            el.style.height = el.scrollHeight + 'px';*/

        }

        hide() {
                const el = this._targetEl,
                    trEl = this._triggerEl,
                    $el = this._$targetEl;

            if (!el.classList.contains(ClassNameEl.SHOW) || el._isTransitioning) return;

            trEl.classList.remove(ClassNameTr.SHOW);

            //todo: write function standardAnimation() {}
            //todo: isTransition
            //todo: custom animation
            //todo:  _reflow(), el.style.display = 'block';
    

            /* //for standard animation (end value)
            //el.style.height = el.scrollHeight + 'px';
            el.style.height = el.getBoundingClientRect().height + 'px';

            $el.on('transitionend.show', this._transitionComplete, this);
            
            //for standard animation (end value)

            el.style.height = 0;
            el.style.display = 'block';*/

            if(this._isAnimation) {
                Dropdown._defaultAnimate.hide(this);
            }

            el.classList.remove(ClassNameEl.SHOW);
        }


        // Private methods

        _transitionComplete(e) {
            
            if (!e || (e.target !== e.currentTarget)) return;//todo: доп проверка эл

            const el = this._targetEl,
                  $el = this._$targetEl;

            //for transition
            this._reflow();

            $el.off('transitionend.show');

            el.style = '';


        }



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

        static _reflow(el) {
            return el.offsetHeight;
        }

        static get _defaultAnimate() {
            return {
                
                show: function(inst) {
                    const el = inst._targetEl,
                        $el = inst._$targetEl;


                    el.classList.add(ClassNameEl.TRANSITIONING);

                    //for standard animation (first value)
                    el.style.height = 0;
                    //console.log(Dropdown._reflow(el));
                    $el.on('transitionend.complete', this.transitionComplete, $el);
                    //debugger;
                    //for standard animation (end value)
                    el.style.height = el.scrollHeight + 'px';

                },
                
                hide: function (inst) {
                    const el = inst._targetEl,
                        $el = inst._$targetEl;


                    el.classList.add(ClassNameEl.TRANSITIONING);


                    //for standard animation (end value)
                    //el.style.height = el.scrollHeight + 'px';
                    el.style.height = el.getBoundingClientRect().height + 'px';
                    console.log(Dropdown._reflow(el));
                    $el.on('transitionend.complete', this.transitionComplete, $el);

                    //for standard animation (end value)

                    el.style.height = 0;
                    //el.style.display = 'block';
                    
                },

                transitionComplete: function (e) {
                    if (!e || (e.target !== e.currentTarget)) return;//todo: доп проверка эл

                    const el = this._el,
                        $el = this;

                    //console.log(Dropdown._reflow(el));
                    el.classList.remove(ClassNameEl.TRANSITIONING);
                    //for transition
                    $el.off('transitionend.complete');
                    console.log(Dropdown._reflow(el));
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

});

