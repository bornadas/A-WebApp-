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
  document.querySelector(".add-stock-button").style.display = "block";
  // Now get all products again from the db
  await getStock();
});

// STOCK INFORMATION
document.body.addEventListener('click', event => {
  let addStockButton = event.target.closest('.add-stock-button');
  if (!addStockButton) { return; }
  document.querySelector('.add-stock-form').style.display = 'block';
  addStockButton.style.display = 'none';
  window.scrollTo(0, 10000000);
});

// Fetch 
async function getStock() {
  let rawData = await fetch('/api/productsXstores');
  let productsXstores = await rawData.json();
  let html = '';
  for (let { id, productId, storesId, quantity } of productsXstores) {
    html += `
      <div class="stock">
       <p><b>ID:</b> ${id} </p>
       <p><b>Store ID: </b><a href ="stores.html" style="color: red">${storesId}</a> </p>
      <p><b>Product ID:</b> ${productId} </p>  
        <p><b> Product Quantity :</b> ${quantity}</p>
       
        <p><button class="delete-button" id="delete-${id}">Delete</button></p>
        <p><button class="change-button" id="change-${id}">Change</button></p>
        <hr>
      </div>
    `;
  }
  let stockList = document.querySelector('.list-of-stocks')
  stockList.innerHTML = html;
  // when we have fetched a list  scroll to the top of th screen
  window.scrollTo(0, 0,);
}

getStock();

// React on click on delete button
document.body.addEventListener('click', async event => {
  let deleteButton = event.target.closest('.delete-button');
  if (!deleteButton) { return; }
  let idToDelete = deleteButton.id.slice(7);
  await fetch('/api/productsXstores/' + idToDelete, {
    method: 'DELETE'
  });
  getStock();
});

document.body.addEventListener('click', async event => {
  let changeButton = event.target.closest('.change-button');
  if (!changeButton) { return; }
  let idToChange = changeButton.id.slice(7);

  let rawResult = await fetch('/api/productsXstores/' + idToChange);
  let result = await rawResult.json();

  let changeForm = document.querySelector('.change-stock-form');

  changeForm.setAttribute('action', '/api/productsXstores/' + result.id);

  for (let element of changeForm.elements) {
    if (!element.name) { continue; }
    element.value = result[element.name];
  }
  changeForm.style.display = "block";
  // scroll to the bottom of the page where the form is
  window.scrollTo(0, 10000000);
});