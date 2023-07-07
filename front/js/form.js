// cart.html // Summary: handle user inputs and form submission

'use strict';

// Creating a new Cart instance
import Cart from './classCart.js';
const productsToOrder = new Cart();

// Importing custom alert for better user experience
import showAlert from './customAlert.js';

// Function to check the validity of input fields
const validateFormField = (inputId, regex, errorMsg, minLength = null, maxLength = null) => {
	const input = document.querySelector(inputId);
	const error = document.getElementById(`${input.id}ErrorMsg`);

	// Function to validate input on input event
	const validateInput = () => {
		const value = input.value.trim();

		// Check if input value matches the regex pattern
		if (!regex.test(value)) {
			error.textContent = errorMsg;
			return Promise.reject(errorMsg);
		}

		// Check if the input value meets the minimum and maximum length requirements
		if (minLength && value.length < minLength) {
			error.textContent = `La longueur minimale est de ${minLength} caractères`;
			return Promise.reject(`La longueur minimale est de ${minLength} caractères`);
		}
		if (maxLength && value.length > maxLength) {
			error.textContent = `La longueur maximale est de ${maxLength} caractères`;
			return Promise.reject(`La longueur maximale est de ${maxLength} caractères`);
		}

		// If the input value is valid, clear the error message and return a resolved Promise
		error.textContent = '';
		return Promise.resolve();
	};

	// Add the 'required' attribute to the input field
	input.setAttribute('required', true);

	// Add an event listener to the input field to validate the input on input event
	input.addEventListener('input', validateInput);

	// Return the function that validates the input
	return validateInput;
};

// Define a validation function for each form field, passing the corresponding parameters to the validateFormField function
const validateFirstName = validateFormField('#firstName', /^[a-z éàè,.'-]+$/i, 'Prénom au format non supporté', 2, 50);
const validateLastName = validateFormField('#lastName', /^[a-z éàè,.'-]+$/i, 'Nom au format non supporté', 2, 50);
const validateAddress = validateFormField('#address', /^[#.0-9a-zA-Z\s,-]+$/i, 'Adresse au format non supporté', 5, 100);
const validateCity = validateFormField('#city', /^([a-zA-Z\u0080-\u024F]+(?:. |-| |'))*[a-zA-Z\u0080-\u024F]*$/i, 'Ville au format non supporté', 2, 50);
const validateEmail = validateFormField('#email', /^[\w-/.]+@([\w-]+\.)+[\w-]{2,4}$/i, 'Email au format non supporté', null, 100);

// Handle submission main function
const form = document.querySelector('form');
const handleSubmit = async (e) => {
	// Prevent the 'onclick submit' reloading of the page
	e.preventDefault();

	// Waits for all five promises to resolve
	try {
		await Promise.all([validateFirstName(), validateLastName(), validateAddress(), validateCity(), validateEmail()]);

		// Defining expected API request entries which are a formData 'contact' type: object and each id of 'products' type: array
		const formData = new FormData(form);
		const contact = Object.fromEntries(formData); // object of contact
		const products = productsToOrder.cart.map((item) => item._id); // array of ids

		// fetching Method Post, passing expected entries
		const response = await fetch('http://localhost:3000/api/products/order', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contact,
				products,
			}),
		});

		// Checking for unexpected API response, displaying error to the user
		if (!response.ok) {
			showAlert('Erreur lors de la commande. Réessayez plus tard.');
			throw new Error(`Unexpected response : ${data.message}`);
		}

		// Retrieve data orderId from API
		const data = await response.json();

		// Checking for unexpected orderId, displaying error to the user
		if (!data.orderId) {
			showAlert('Erreur lors de la commande. Réessayez plus tard.');
			console.error(`Unexpected or missing orderId: ${data.orderId}`);
			return;
		}

		// Redirect the user to the confirmation page passing the orderId
		localStorage.setItem('orderId', data.orderId);
		window.open(`./confirmation.html?orderId=${data.orderId}`);
		window.location.reload();
	} catch (error) {
		showAlert('Erreur lors de la validation de la commande. Veuillez vérifier vos informations.');
		console.error(error);
	}
};

// Listning to submission, calling main function
form.addEventListener('submit', handleSubmit);
