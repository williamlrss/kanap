// index.html // summary : render products from API into webpage

'use strict';

// fetching and store data into cache avoiding unnecessary calls
const fetchData = async () => {
	if (cache) {
		return cache;
	}

	try {
		const response = await fetch(`http://localhost:3000/api/products`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const contentType = response.headers.get('Content-Type');
		if (contentType && contentType.includes('application/json')) {
			const data = await response.json();
			cache = data; // store data in cache
			return data;
		} else {
			throw new Error('Response was not JSON');
		}
	} catch (error) {
		const sectionOfError = document.getElementsByClassName('titles');
		sectionOfError[0].children[0].textContent = 'Oops!';
		sectionOfError[0].children[1].textContent = 'Petit soucis de notre côté, veuillez réessayer plus tard.';

		if (error instanceof TypeError || error instanceof DOMException) {
			// Network or CORS error
			throw new Error('There was a problem fetching the data. Please try again later.');
		} else if (error instanceof SyntaxError) {
			// JSON parse error
			throw new Error('There was a problem parsing the data. Please try again later.');
		} else {
			throw new Error(error.message);
		}
	}
};

// rendering product into webpage
const renderProductDetails = (data) => {
	const mainFragment = new DocumentFragment(); // create a document fragment to render all at once
	const sectionOfItems = document.getElementById('items');

	// Loop through each array of items & Render HTML | main function
	const itemsFragments = data.map(({ _id, imageUrl, altTxt, name, description }) => {
		// render product link, parent element appended to fragemnt
		const itemLink = document.createElement('a');
		itemLink.href = `http://127.0.0.1:5500/front/html/product.html?id=${_id}`;

		// render product section
		const itemArticle = document.createElement('article');
		itemLink.append(itemArticle);

		// render product image
		const itemImage = document.createElement('img');
		itemImage.src = imageUrl;
		itemImage.alt = altTxt;
		itemImage.loading = 'lazy';
		itemArticle.append(itemImage);

		// render product name
		const itemHeading = document.createElement('h3');
		itemHeading.classList.add('itemName');
		itemHeading.textContent = name;
		itemArticle.append(itemHeading);

		// render product description
		const itemDescription = document.createElement('p');
		itemDescription.classList.add('itemDescription');
		itemDescription.textContent = description;
		itemArticle.append(itemDescription);

		return itemLink;
	});

	// Applying all items to the main Fragment
	mainFragment.append(...itemsFragments);
	sectionOfItems.append(mainFragment);
};

// Call the rendering function after successful fetching & data retrieving
const fetchDataAndRender = async () => {
	try {
		const data = await fetchData();
		renderProductDetails(data);
	} catch (error) {
		console.log('FetchDataAndRender() Error, rendering products details failure:', error.message);
	}
};

// Define cache variable
const cacheTime = 3600000; // 1 hour
let cache = null;

setInterval(() => {
	cache = null;
}, cacheTime);

// Call main function
fetchDataAndRender();
