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