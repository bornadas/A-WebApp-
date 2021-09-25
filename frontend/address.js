// Handle forms
document.body.addEventListener("submit", async (event) => {
  // Prevent default behavior (page reload)
  event.preventDefault();
  // Get info about the form
  let form = event.target;
  let route = form.getAttribute("action");
  let method = form.getAttribute("method");

  let requestBody = {};
  for (let { name, value } of form.elements) {
    if (!name) {
      continue;
    }
    requestBody[name] = value;
  }
  // Send the data via our REST api
  let rawResult = await fetch(route, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  let result = await rawResult.json();
  console.log(result);
  // Empty the fields
  for (let element of form.elements) {
    if (!element.name) {
      continue;
    }
    element.value = "";
  }

  form.style.display = "none";
  document.querySelector(".add-storeAddress-button").style.display = "block";
  // Now get all products again from the db
  await getStoreAddress();
});
// STORE ADDRESS
document.body.addEventListener('click', event => {
  let addStoreAddressButton = event.target.closest('.add-storeAddress-button');
  if (!addStoreAddressButton) { return; }
  document.querySelector('.add-storeAddress-form').style.display = 'block';
  addStoreAddressButton.style.display = 'none';
  window.scrollTo(0, 10000000);
});

// Fetch a list of all persons
async function getStoreAddress() {
  let rawData = await fetch('/api/address');
  let address = await rawData.json();
  let html = '';
  for (let { id, street, streetNo, zipCode, city, country } of address) {
    html += `
      <div class="storeAddress">
      <p><b>Location ID:</b> ${id} </p>
        <p><b>Address:</b> ${street}, ${streetNo}</p>
        <p><b> Pin Code :</b> ${zipCode}</p>
        <p>${city}, ${country}</p>

        <p><button class="delete-button" id="delete-${id}">Delete</button></p>
        <p><button class="change-button" id="change-${id}">Change</button></p>
        <hr>
      </div>
    `;
  }
  let storeAddressList = document.querySelector('.list-of-storeAddresses')
  storeAddressList.innerHTML = html;
  // when we have fetched a list  scroll to the top of th screen
  window.scrollTo(0, 0,);
}

// Load persons from database and display
getStoreAddress();

// React on click on delete button
document.body.addEventListener('click', async event => {
  let deleteButton = event.target.closest('.delete-button');
  if (!deleteButton) { return; }
  let idToDelete = deleteButton.id.slice(7);
  await fetch('/api/address/' + idToDelete, {
    method: 'DELETE'
  });
  getstoreAddress();
});

document.body.addEventListener('click', async event => {
  let changeButton = event.target.closest('.change-button');
  if (!changeButton) { return; }
  let idToChange = changeButton.id.slice(7);
  // get the data to change
  let rawResult = await fetch('/api/address/' + idToChange);
  let result = await rawResult.json();
  // fill and show the change forms base on the result/data
  let changeForm = document.querySelector('.change-storeAddress-form');
  // add the correct route / action to the form
  changeForm.setAttribute('action', '/api/address/' + result.id);
  // Fill the form with the data from the database
  for (let element of changeForm.elements) {
    if (!element.name) { continue; }
    element.value = result[element.name];
  }
  changeForm.style.display = "block";
  // scroll to the bottom of the page where the form is
  window.scrollTo(0, 10000000);
});