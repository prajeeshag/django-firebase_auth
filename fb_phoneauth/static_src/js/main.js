/* global grecaptcha */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPhoneNumber, signOut, RecaptchaVerifier } from 'firebase/auth';

// Initialize Firebase

const firebaseApp = initializeApp(firebaseConfig);
var auth

try {
    auth = getAuth(firebaseApp);
} catch (err) {
    window.alert(err.message);
}

/**
 * Set up UI event listeners and registering Firebase auth listeners.
 */
window.onload = function () {

    const phoneInputField = document.getElementById('id_phone_number');
    window.phoneInput = window.intlTelInput(phoneInputField, {
        initialCountry: "in",
        nationalMode: true,
        // geoIpLookup: getIp,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    }
    );
    signOut(auth)
    window.confirmationResult = null;
    updateSignInButtonUI();
    updateSignInFormUI();
    updateVerificationCodeFormUI();

    // Event bindings.
    document.getElementById('id_phone_number').addEventListener('keyup', updateSignInButtonUI);
    document.getElementById('id_phone_number').addEventListener('change', updateSignInButtonUI);
    document.getElementById('verification-code').addEventListener('keyup', updateVerifyCodeButtonUI);
    document.getElementById('verification-code').addEventListener('change', updateVerifyCodeButtonUI);
    document.getElementById('verify-code-button').addEventListener('click', onVerifyCodeSubmit);
    document.getElementById('cancel-verify-code-button').addEventListener('click', cancelVerification);

    auth.settings.appVerificationDisabledForTesting = TestingMode; // TODO: Delete this 
    window.recaptchaVerifier = new RecaptchaVerifier('sign-in-button', {
        'size': 'invisible',
        'callback': function (response) {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
            onSignInSubmit();
        }
    }, auth);

    window.recaptchaVerifier.render().then(function (widgetId) {
        window.recaptchaWidgetId = widgetId;
        updateSignInButtonUI();
    });

};

// function getIp(callback) {
//     fetch('https://ipinfo.io/json?token=<your token>', { headers: { 'Accept': 'application/json' } })
//         .then((resp) => resp.json())
//         .catch(() => {
//             return {
//                 country: 'us',
//             };
//         })
//         .then((resp) => callback(resp.country));
//     return {
//         country: 'ind',
//     };
// }
/**
 * Function called when clicking the Login/Logout button.
 */
function onSignInSubmit() {
    hideErrorMsg();
    if (isPhoneNumberValid()) {
        window.signingIn = true;
        updateSignInButtonUI();
        var phoneNumber = getPhoneNumberFromUserInput();
        var appVerifier = window.recaptchaVerifier;
        signInWithPhoneNumber(auth, phoneNumber, appVerifier)
            .then(function (confirmationResult) {
                // SMS sent. Prompt user to type the code from the message, then sign the
                // user in with confirmationResult.confirm(code).
                window.confirmationResult = confirmationResult;
                window.signingIn = false;
                updateSignInButtonUI();
                updateVerificationCodeFormUI();
                updateVerifyCodeButtonUI();
                updateSignInFormUI();
            }).catch(function (error) {
                // Error; SMS not sent
                showErrorMsg('Please enter valid number');
                // window.alert('Error during signInWithPhoneNumber:\n\n'
                //     + error.code + '\n\n' + error.message);

                window.signingIn = false;
                updateSignInFormUI();
                updateSignInButtonUI();
            });
    }
}

function hideErrorMsg() {
    var error = document.getElementById('id_error_fb_login');
    error.innerHTML = ""
}

function showErrorMsg(msg) {
    var error = document.getElementById('id_error_fb_login');
    error.innerHTML = `<span style='color: red;'>${msg}</span>`
}

/**
 * Function called when clicking the "Verify Code" button.
 */
function onVerifyCodeSubmit(e) {
    hideErrorMsg();
    e.preventDefault();
    if (!!getCodeFromUserInput()) {
        window.verifyingCode = true;
        updateVerifyCodeButtonUI();
        var code = getCodeFromUserInput();
        confirmationResult.confirm(code).then(function (result) {
            // User signed in successfully.
            var user = result.user;
            window.verifyingCode = false;
            window.confirmationResult = null;
            updateVerificationCodeFormUI();
            auth.currentUser.getIdToken(true).then(function (id_Token) {
                document.getElementById("id_phone_number").value = getPhoneNumberFromUserInput()
                document.getElementById("id_token").value = id_Token
                document.getElementById("sign-in-form").submit();
            }).catch(function (error) {
                console.error(error)
            });
        }).catch(function (error) {
            // User couldn't sign in (bad verification code?)
            // window.alert('Error while checking the verification code:\n\n'
            //     + error.code + '\n\n' + error.message);
            showErrorMsg('Invalid verification code!!!')
            window.verifyingCode = false;
            updateSignInButtonUI();
            updateVerifyCodeButtonUI();
        });
    }
}

/**
 * Cancels the verification code input.
 */
function cancelVerification(e) {
    e.preventDefault();
    window.confirmationResult = null;
    updateVerificationCodeFormUI();
    updateSignInFormUI();
}

/**
 * Signs out the user when the sign-out button is clicked.
 */
function onSignOutClick() {
    signOut(auth);
}

/**
 * Reads the verification code from the user input.
 */
function getCodeFromUserInput() {
    return document.getElementById('verification-code').value;
}

function validateCode() {
    var code = getCodeFromUserInput();
    var reg = new RegExp("\\d{6}");
    return code.search(reg) !== -1
}
/**
 * Reads the phone number from the user input.
 */
function getPhoneNumberFromUserInput() {
    // return document.getElementById('id_phone_number_0').value
    //     + document.getElementById('id_phone_number_1').value;
    return window.phoneInput.getNumber();
}
/**
 * Reads only the national number entered
 */
function getPhoneNumberNational() {
    return document.getElementById('id_phone_number').value;
}

/**
 * Returns true if the phone number is valid.
 */
function isPhoneNumberValid() {
    var pattern = /^\+[0-9\s\-\(\)]+$/;
    var phoneNumber = getPhoneNumberFromUserInput();
    var valid = phoneNumber.search(pattern) !== -1;

    var reg = /^\d+$/;
    phoneNumber = getPhoneNumberNational();
    valid = valid && phoneNumber.search(reg) !== -1;
    return valid;
}

/**
 * Re-initializes the ReCaptacha widget.
 */
function resetReCaptcha() {
    if (typeof grecaptcha !== 'undefined'
        && typeof window.recaptchaWidgetId !== 'undefined') {
        grecaptcha.reset(window.recaptchaWidgetId);
    }
}

/**
 * Updates the Sign-in button state depending on ReCAptcha and form values state.
 */
function updateSignInButtonUI() {
    document.getElementById('sign-in-button').disabled =
        !isPhoneNumberValid()
        || !!window.signingIn;
}

/**
 * Updates the Verify-code button state depending on form values state.
 */
function updateVerifyCodeButtonUI() {
    document.getElementById('verify-code-button').disabled =
        !!window.verifyingCode
        || !validateCode();
}

/**
 * Updates the state of the Sign-in form.
 */
function updateSignInFormUI() {
    if (auth.currentUser || window.confirmationResult) {
        document.getElementById('sign-in-form-container').style.display = 'none';
    } else {
        resetReCaptcha();
        document.getElementById('sign-in-form-container').style.display = 'block';
    }
}

/**
 * Updates the state of the Verify code form.
 */
function updateVerificationCodeFormUI() {
    if (!auth.currentUser && window.confirmationResult) {
        document.getElementById('verification-code-form').style.display = 'block';
    } else {
        document.getElementById('verification-code-form').style.display = 'none';
    }
}

/**
 * Updates the Signed in user status panel.
 */
function updateSignedInUserStatusUI() {
    var user = auth.currentUser;
    if (user) {
        document.getElementById('sign-in-status').textContent = 'Signed in';
        document.getElementById('account-details').textContent = JSON.stringify(user, null, '  ');
    } else {
        document.getElementById('sign-in-status').textContent = 'Signed out';
        document.getElementById('account-details').textContent = 'null';
    }
}