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
        SHOW: `${Class.TARGET_ELEM}_open`
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
                targetEl = document.getElementById(idTarget);
                

            this._triggerEl = triggerEl;
            this._targetEl = targetEl;
            this._isTransitioning = null;

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

            //for standard animation (first value)
            el.style.height = 0;

            $el.on('transitionend.show', this._showComplete, this);

            //for standard animation (end value)
            el.style.height = el.scrollHeight + 'px';

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
    

             //for standard animation (end value)
            //el.style.height = el.scrollHeight + 'px';
            el.style.height = el.getBoundingClientRect().height + 'px';

            $el.on('transitionend.show', this._showComplete, this);
            
            //for standard animation (end value)

            el.style.height = 0;
            el.style.display = 'block';

            el.classList.remove(ClassNameEl.SHOW);
        }


        // Private methods

        _showComplete(e) {
            
            if (!e || (e.target !== e.currentTarget)) return;//todo: доп проверка эл

            const el = this._targetEl,
                  $el = this._$targetEl;

            //for transition
            this._reflow();

            $el.off('transitionend.show');

            el.style = '';


        }

        _reflow() {
            return this._el.offsetHeight;
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
    }


// ------------------------------------------------------------------------
// Initialization - for all dropdown elements when it click
// ------------------------------------------------------------------------
    let $document = ElU(document);
    $document.on('click.initDropDown', initHandler);

    function initHandler (e) {

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

