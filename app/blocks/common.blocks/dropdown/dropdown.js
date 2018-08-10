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
                targetEl = document.getElementById(idTarget),
                $triggerEl = ElU(triggerEl);

            console.log(Attribute.DATA_TARGET);
            console.log(triggerEl.getAttribute(Attribute.DATA_TARGET));
            console.log(targetEl);

            this._triggerEl = triggerEl;
            this._dropDownEl = targetEl;
            this._isTransitioning = null;

            //todo хранить экземпляр в dom-эл-те
            targetEl._dropdown = this;

            //onclick for triggerEl
            $triggerEl.on('click.toggle', this.toggle, this);
            
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
        console.log('triggerEl', triggerEl);
        //todo: проверка инициализации об-та
        return Dropdown.init(opts);
    });
});

