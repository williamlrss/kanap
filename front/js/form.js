// // Processing the form within cart.html // //

'use strict';
import Cart from "./classCart.js";
import showAlert from "./customAlert.js";

const productsToOrder = new Cart();

const checkFormInputs = (inputId, regex, errorMsg) => {
    const input = document.querySelector(inputId);
    const error = document.getElementById(`${input.id}ErrorMsg`);
    input.addEventListener('change', () => {
        if (!regex.test(input.value)) {
            error.textContent = errorMsg;
        } else {
            error.textContent = '';
        }
    });

    return () => {
        if (!regex.test(input.value)) {
            return Promise.reject(errorMsg);
        }
        return Promise.resolve();
    };
};

const validateFirstName = checkFormInputs('#firstName', /^[a-z éàè,.'-]+$/i, 'Prénom au format non supporté');
const validateLastName = checkFormInputs('#lastName', /^[a-z éàè,.'-]+$/i, 'Nom au format non supporté');
const validateAddress = checkFormInputs('#address', /^[#.0-9a-zA-Z\s,-]+$/i, 'Adresse au format non supporté');
const validateCity = checkFormInputs('#city', /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/i, 'Ville au format non supporté');
const validateEmail = checkFormInputs('#email', /^[\w-/.]+@([\w-]+\.)+[\w-]{2,4}$/i, 'Email au format non supporté');

const form = document.querySelector('form');

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        await Promise.all([
            validateFirstName(),
            validateLastName(),
            validateAddress(),
            validateCity(),
            validateEmail(),
        ]);

        // Defining expected request entries --> form contact object & product ids array
        const formData = new FormData(form);
        const contact = Object.fromEntries(formData);
        const products = productsToOrder.cart.map(item => item._id);

        const response = await fetch('http://localhost:3000/api/products/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contact, products
            })
        });

        if (!response.ok) {
            showAlert('Problème lors de la commande, réessayez plus tard.');
            throw new Error('Unable to place order.Please try again later.');
            
        }
        const data = await response.json();
        console.log(data);
        console.log(typeof(data.orderId));

        // Redirect to order confirmation page
        localStorage.setItem("orderId", data.orderId);
        window.open(`./confirmation.html?orderId=${data.orderId}`);
        window.location.reload();

    } catch (error) {
        showAlert('Erreur lors de la validation de la commande. Veuillez vérifier vos informations.', 'error');
        console.error(error);
    }
};

form.addEventListener('submit', handleSubmit);