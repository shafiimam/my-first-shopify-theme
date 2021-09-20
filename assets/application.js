// Put your application javascript here
if (document.getElementById('sort_by') != null) {
  document.querySelector('#sort_by').addEventListener('change', function (e) {
    let url = new URL(window.location.href);
    url.searchParams.set('sort_by', e.currentTarget.value);
    window.location.href = url.href;
  });
}

if (document.getElementById('AddressCountryNew') != null) {
  document
    .getElementById('AddressCountryNew')
    .addEventListener('change', function (e) {
      let provinces =
        this.options[this.selectedIndex].getAttribute('data-provinces');
      let provinceSelector = document.getElementById('AddressProvinceNew');
      let provinceArray = JSON.parse(provinces);
      console.log(provinceArray);
      if (provinceArray.length < 1) {
        provinceSelector.setAttribute('disabled', 'disabled');
      } else {
        provinceSelector.removeAttribute('disabled');
      }
      provinceSelector.innerHTML = ``;
      var options = ``;
      for (let i = 0; i < provinceArray.length; i++) {
        options += `<option value="${provinceArray[i][0]}">${provinceArray[i][0]}</option>`;
      }
      provinceSelector.innerHTML = options;
    });
}

if (document.getElementById('forgetPassword') != null) {
  document
    .getElementById('forgetPassword')
    .addEventListener('click', function (e) {
      document.getElementById('forgetPasswordForm').classList.remove('d-none');
      document.getElementById('forgetPasswordForm').classList.add('d-block');
      console.log('clicked');
    });
}

let localeItems = document.querySelectorAll('#localeItem');
if(localeItems.length > 0) {
  localeItems.forEach(item => {
    item.addEventListener('click', function (e) {
      document.getElementById('localeCode').value = item.getAttribute("lang");
      document.getElementById("localization_form_tag").submit();
    })
  })
}

let productInfoAnchors = document.querySelectorAll('#productInfoAnchor');
if(productInfoAnchors != null) {
  
if(productInfoAnchors.length > 0) {
  let productModal = new bootstrap.Modal(document.getElementById('productInfoModal'), {});
  let alert = document.querySelector('.alert');
  let modalFooter = document.querySelector('.modal-footer');
  if(alert != null) {
    modalFooter.removeChild(modalFooter.childNodes[1]);
    console.log(modalFooter)
  }
  productInfoAnchors.forEach(item => {
    item.addEventListener('click', function (e) {
      let productHandle = item.getAttribute('product-handle');
      let url = `/products/${productHandle}.js`;
      fetch(url)
      .then(res => res.json())
      .then(data=> {
        console.log(data);
        document.getElementById('product-info-image').src = data.images[0];
        document.getElementById('product-info-title').innerHTML = data.title;
        document.getElementById('product-info-price').innerHTML =item.getAttribute('product-price');
        document.getElementById('product-info-description').innerHTML = data.description;

        let variants = data.variants;
        let variantSelect = document.getElementById('modalItemId');
        variantSelect.innerHTML = '';
        variants.forEach(function(variant, index) {
          console.log(variant);
          if(variant.available = true){
            variantSelect.options[variantSelect.options.length] = new Option(variant.option1, variant.id);
          }
          
        })
        productModal.show();
      })
     
    });
  })
}
}


let modalAddToCartForm = document.querySelector('#addToCartForm');

if(modalAddToCartForm != null){
  modalAddToCartForm.addEventListener('submit', e=>{
    e.preventDefault();
  
    let formData = {
      'items': [{
      'id': document.getElementById('modalItemId').value,
      'quantity' : document.getElementById('modalProductQuantity').value
      }]
    };
  
    fetch('/cart/add.js',{
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(formData)
    })
    .then(res=> res.json())
    .then(data => {
      console.log('data',data)
      updateCartBadge();
      if(data.items && data.items.length > 0){
        let modalForm = document.getElementById('addToCartForm');
        let modalFooter = document.querySelector('.modal-footer');
        let errorElem = document.createElement('p');
        errorElem.classList.add('alert-success');
        errorElem.classList.add('alert');
        errorElem.innerText = `Successfully added to the cart`;
        modalFooter.append(errorElem);
        setTimeout(() => {
          errorElem.remove()
        },2000)
      }
      else{
        let modalFooter = document.querySelector('.modal-footer');
        let modalForm = document.getElementById('addToCartForm');
        let errorElem = document.createElement('p');
        errorElem.classList.add('alert-danger');
        errorElem.classList.add('alert');
        errorElem.innerText = `${data.description}`;
        modalFooter.append(errorElem);
        setTimeout(() => {
          errorElem.remove()
        },2000)
      }
    })
  })
}

document.addEventListener('DOMContentLoaded',function() {
  updateCartBadge();
})

let cartBadge = document.getElementById('cart-badge');

function updateCartBadge() {
  return fetch('/cart.js')
  .then(res => res.json())
  .then(data=> {
    cartBadge.innerText = data.items.length;
  })
  .catch(err=> console.log(err))
}

let predictiveSearchInput = document.getElementById('searchInputField');
let timer;
let offCanvasSearch = document.getElementById('offcanvasSearchResults');
let bsOffCanvas = new bootstrap.Offcanvas(offCanvasSearch);
if(predictiveSearchInput != null){
  predictiveSearchInput.addEventListener('input',function(e){
    clearTimeout(timer);
    if(predictiveSearchInput.value){
      timer =setTimeout( fetchPredictiveSearch, 3000);
    }
   
  });
}

async function fetchPredictiveSearch(){
 await  fetch(`/search/suggest.json?q=${predictiveSearchInput.value}&resources[type]=product`)
  .then(res => res.json())
  .then(data=> {

    let products = data.resources.results.products;
    console.log(products);
    document.getElementById('search-results-body').innerHTML = ``;
    products.forEach(product=>{
      document.getElementById('search-results-body').innerHTML += `
        <div class="card" style="width:19rem;">
          <img src="${product.image}" class="card-img-top"/>
          <div class="card-body">
            <a href="${product.url}"><h5 class="card-title">${product.title}</h5></a>
            <p class="card-text">${product.price}</p>
          </div>
        </div>
      `
    })
    bsOffCanvas.show();
  })
}