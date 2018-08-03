{
// ------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------

    const CLASS_DROP_ElEM = 'dropdown';

    const Attribute = {
        DATA_TOGGLE : 'data-toggle',
        DATA_TARGET : 'data-target'
      }
    
    const AttrValue = {
        DATA_TOGGLE : 'drop-down'
    }

    const ClassName = {
        SHOW: `${ClASS_DROP_ELEM}_open`
    }

    
// ------------------------------------------------------------------------
// Class Definition
// ------------------------------------------------------------------------

class Dropdown {

// ------------------------------------------------------------------------
// Constructor
// ------------------------------------------------------------------------

    constructor(butEl) {
        let idTarget = butEl.getAttribute(Attribute.DATA_TOGGLE),
            dropDown = document.getElementById(idTarget);
        this.elem = butEl;


    };
};
};
