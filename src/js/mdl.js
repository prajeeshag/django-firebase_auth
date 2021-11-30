import "../css/style.scss"

import { MDCTextField } from '@material/textfield';
import { MDCSelect } from '@material/select';
import { MDCRipple } from '@material/ripple';

const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));

const textWidgets = document.querySelectorAll('.mdc-text-field');
for (var i = 0, len = textWidgets.length; i < len; i++) {
    const textField = new MDCTextField(textWidgets[i])
}

const selectWidgets = document.querySelectorAll('.mdc-select');
for (var i = 0, len = selectWidgets.length; i < len; i++) {
    const select = new MDCSelect(selectWidgets[i])
}