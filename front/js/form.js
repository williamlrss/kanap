// cart.html // Summary: handle user inputs and form submission

'use strict';

// Creating a new Cart instance
import Cart from "./classCart.js";
const productsToOrder = new Cart();

// Custom alert for better user experience
import showAlert from "./customAlert.js";

// Listening for changes in inputs, creating checking function with parameters returning Promise for each instance
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

// Defining promises instances, passing related parameters through checking function
const validateFirstName = checkFormInputs('#firstName', /^[a-z éàè,.'-]+$/i, 'Prénom au format non supporté');
const validateLastName = checkFormInputs('#lastName', /^[a-z éàè,.'-]+$/i, 'Nom au format non supporté');
const validateAddress = checkFormInputs('#address', /^[#.0-9a-zA-Z\s,-]+$/i, 'Adresse au format non supporté');
const validateCity = checkFormInputs('#city', /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/i, 'Ville au format non supporté');
const validateEmail = checkFormInputs('#email', /^[\w-/.]+@([\w-]+\.)+[\w-]{2,4}$/i, 'Email au format non supporté');


// Handle submission
const form = document.querySelector('form');
const handleSubmit = async (e) => {
    e.preventDefault();

    // Wait all promises validation or return error
    try {
        await Promise.all([
            validateFirstName(),
            validateLastName(),
            validateAddress(),
            validateCity(),
            validateEmail(),
        ]);

        // Defining expected API request entries --> form contact object & product ids array
        const formData = new FormData(form);
        const contact = Object.fromEntries(formData);
        const products = productsToOrder.cart.map(item => item._id);

        // fetching Method Post, passing entries
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

        // Retrieve data orderId from API
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

// Listning to submission, calling main function
form.addEventListener('submit', handleSubmit);