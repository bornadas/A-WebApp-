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
  document.querySelector(".add-store-button").style.display = "block";
  // Now get all products again from the db
  await getStores();
});

// STORES
document.body.addEventListener("click", (event) => {
  let addStoreButton = event.target.closest(".add-store-button");
  if (!addStoreButton) {
    return;
  }
  document.querySelector(".add-store-form").style.display = "block";
  addStoreButton.style.display = "none";
  window.scrollTo(0, 10000000);
});

async function getStores() {
  let rawData = await fetch('/api/stores');
  let stores = await rawData.json();
  let html = '';
  for (let { id, storeName, isWareHouse, addressId } of stores) {
    html += `
      <div class="store">
        <h3>${storeName}</h3>
        <p><b>Store ID: </b> ${id}</p>
        <p><b>Is it the Warehouse?: </b> ${isWareHouse}</p>
        <p><b>Location ID: </b><a href = "address.html" style="color: red">${addressId}</a></p>
        <p><b>Check Product Stock: </b><a href = "stockInformation.html" style="color: red"> HERE </a></p>
   
        <p><button class="delete-button" id="delete-${id}">Delete</button></p>
        <p><button class="change-button" id="change-${id}">Change</button></p>
        <hr>
      </div>
    `;
  }
  let storeList = document.querySelector('.list-of-stores')
  storeList.innerHTML = html;
  // when we have fetched a list  scroll to the top of th screen
  window.scrollTo(0, 0,);
}

// Load stores from database and display
getStores();

// React on click on delete button
document.body.addEventListener('click', async event => {
  let deleteButton = event.target.closest('.delete-button');
  if (!deleteButton) { return; }
  let idToDelete = deleteButton.id.slice(7);
  await fetch('/api/stores/' + idToDelete, {
    method: 'DELETE'
  });
  getStores();
});
// React on click on change button
// populate the change form with the correct item
document.body.addEventListener('click', async event => {
  let changeButton = event.target.closest('.change-button');
  if (!changeButton) { return; }
  let idToChange = changeButton.id.slice(7);
  // get the data to change
  let rawResult = await fetch('/api/stores/' + idToChange);
  let result = await rawResult.json();
  // fill and show the change forms base on the result/data
  let changeForm = document.querySelector('.change-store-form');
  // add the correct route / action to the form
  changeForm.setAttribute('action', '/api/stores/' + result.id);
  // Fill the form with the data from the database
  for (let element of changeForm.elements) {
    if (!element.name) { continue; }
    element.value = result[element.name];
  }
  changeForm.style.display = "block";
  // scroll to the bottom of the page where the form is
  window.scrollTo(0, 10000000);
});