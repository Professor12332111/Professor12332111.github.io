/* CART DATA */

let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!Array.isArray(cart)) {
    cart = [];
  }
} catch (error) {
  cart = [];
}

/* COOKIE FUNCTIONS */

function setCookie(cname, cvalue) {
  let d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000);

  document.cookie =
    encodeURIComponent(cname) +
    "=" +
    encodeURIComponent(cvalue) +
    ";expires=" +
    d.toUTCString() +
    ";path=/;SameSite=Lax";
}

function getCookie(cname) {
  let name = encodeURIComponent(cname) + "=";
  let cookieArray = document.cookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let c = cookieArray[i].trim();

    if (c.indexOf(name) === 0) {
      return decodeURIComponent(c.substring(name.length));
    }
  }

  return "";
}

function checkCookie() {
  let user = getCookie("username");

  if (user !== "") {
    displayWelcome(user);
  }
}

function displayWelcome(user) {
  // Welcome message is displayed inside Your Cart.
}

function hideWelcome() {
  // Welcome message disappears when the cart is cleared.
}

/* SAVE CART */

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* NAVBAR ACTIVE BUTTON */

function setActiveNav(clickedElement) {
  document
    .querySelectorAll(".navbar-nav .nav-link, .navbar-nav .dropdown-item")
    .forEach((link) => {
      link.classList.remove("active");
    });

  if (!clickedElement) {
    return;
  }

  clickedElement.classList.add("active");

  if (clickedElement.classList.contains("dropdown-item")) {
    let dropdownToggle = clickedElement
      .closest(".dropdown")
      .querySelector(".dropdown-toggle");

    if (dropdownToggle) {
      dropdownToggle.classList.add("active");
    }
  }
}

/* HOME BUTTON */

function goHome(clickedElement) {
  let carousel = document.querySelector(".carousel-container");
  let row = document.querySelector(".myRow");
  let heading = document.getElementById("contentHeading");
  let track = document.querySelector(".carousel-track");

  if (clickedElement) {
    setActiveNav(clickedElement);
  } else {
    let homeButton = document.querySelector(
      '.navbar-nav .nav-link[onclick*="goHome"]',
    );

    if (homeButton) {
      setActiveNav(homeButton);
    }
  }

  if (carousel) {
    carousel.style.display = "block";
  }

  if (row) {
    row.style.display = "none";
    row.innerHTML = "";
  }

  if (heading) {
    heading.textContent = "Featured Products";
  }

  if (track) {
    track.style.animation = "none";
    void track.offsetWidth;
    track.style.animation = "";
  }
}

/* DISPLAY PRODUCTS */

function displayItems(filter_id, clickedElement) {
  let carousel = document.querySelector(".carousel-container");
  let row = document.querySelector(".myRow");
  let heading = document.getElementById("contentHeading");

  if (clickedElement) {
    setActiveNav(clickedElement);
  }

  if (carousel) {
    carousel.style.display = "none";
  }

  if (!row) {
    return;
  }

  row.style.display = "flex";
  row.innerHTML =
    "<p style='width:100%;text-align:center;padding:20px;'>Loading products...</p>";

  let categoryNames = {
    1: "Menswear",
    2: "Womenswear",
    3: "Food",
    4: "Home Appliances",
    5: "Books",
  };

  if (heading) {
    heading.textContent = categoryNames[filter_id] || "Products";
  }

  fetch("JSON/index.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load JSON/index.json");
      }

      return response.json();
    })
    .then((myObject) => {
      let category = myObject.find(
        (item) => Number(item.filter_id) === Number(filter_id),
      );

      if (!category || !Array.isArray(category.products)) {
        row.innerHTML =
          "<p style='width:100%;text-align:center;padding:20px;'>No products found.</p>";
        return;
      }

      row.innerHTML = category.products
        .map((product) => displayProduct(product))
        .join("");

      row.querySelectorAll(".add-cart-btn").forEach((button) => {
        button.addEventListener("click", function () {
          addToCart(
            this.dataset.productId,
            this.dataset.productName,
            this.dataset.imgSrc,
            this.dataset.price,
          );
        });
      });
    })
    .catch((error) => {
      console.error("Error loading products:", error);

      row.innerHTML =
        "<p style='width:100%;text-align:center;padding:20px;color:#dc3545;'>Unable to load products. Check JSON/index.json and run this page using a local server.</p>";
    });
}

/* DISPLAY PRODUCT CARD */

function displayProduct(product) {
  return `
        <div class="product-card" id="p${escapeHTML(product.product_id)}">

            <h2 title="${escapeHTML(product.product_name)}">
                ${escapeHTML(product.product_name)}
            </h2>

            <img src="${escapeHTML(product.imgSrc)}"
                 alt="${escapeHTML(product.product_name)}">

            <hr style="margin:8px 0;">

            <span class="product-price">
                ₹${Number(product.price).toFixed(2)}
            </span>

            <button type="button"
                class="btn btn-info add-cart-btn"
                data-product-id="${escapeHTML(product.product_id)}"
                data-product-name="${encodeURIComponent(product.product_name)}"
                data-img-src="${encodeURIComponent(product.imgSrc)}"
                data-price="${Number(product.price)}">
                <i class="bi bi-cart-plus"></i> Add to Cart
            </button>

        </div>
    `;
}

/* ADD TO CART */

function addToCart(product_id, product_name, imgSrc, price) {
  let user = getCookie("username");

  if (user === "") {
    user = prompt("Please enter your username:");

    if (user === null || user.trim() === "") {
      return;
    }

    user = user.trim();
    setCookie("username", user);
  }

  product_name = decodeURIComponent(product_name);
  imgSrc = decodeURIComponent(imgSrc);

  let existingProduct = cart.find(
    (item) => String(item.product_id) === String(product_id),
  );

  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({
      product_id: product_id,
      product_name: product_name,
      imgSrc: imgSrc,
      price: Number(price),
      quantity: 1,
    });
  }

  saveCart();
  displayCart();
}

/* DISPLAY CART */

function displayCart() {
  let cartBox = document.getElementById("cartBox");

  if (!cartBox) {
    cartBox = document.createElement("div");
    cartBox.id = "cartBox";
    document.body.appendChild(cartBox);
  }

  let user = getCookie("username");
  let safeUser = escapeHTML(user);

  let cartHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-shrink:0;">
            <h4 style="margin:0;color:white;">
                <i class="bi bi-cart3"></i> Your Cart
            </h4>

            <button type="button" onclick="closeCart()"
                aria-label="Close cart"
                style="background:transparent;color:white;border:none;font-size:22px;cursor:pointer;">
                &times;
            </button>
        </div>

        ${
          user !== ""
            ? `
            <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:12px;padding:10px;background:linear-gradient(135deg,#212529,#343a40);color:white;font-size:14px;font-weight:600;border:1px solid #ffc107;border-radius:10px;overflow-wrap:anywhere;flex-shrink:0;">
                <i class="bi bi-person-circle" style="color:#ffc107;font-size:22px;flex-shrink:0;"></i>
                <span>Welcome, ${safeUser}! Enjoy shopping!</span>
            </div>
        `
            : ""
        }

        <div id="cartItems">
    `;

  let total = 0;

  cart.forEach((item) => {
    let itemTotal = Number(item.price) * Number(item.quantity);
    total += itemTotal;

    cartHTML += `
            <div style="background:#343a40;border:1px solid #495057;border-radius:10px;padding:12px;margin-bottom:12px;">

                <div style="font-size:15px;font-weight:600;overflow-wrap:anywhere;margin-bottom:8px;color:white;">
                    ${escapeHTML(item.product_name)}
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div style="font-size:13px;color:#ced4da;">
                        Price: ₹${Number(item.price).toFixed(2)}
                    </div>

                    <button type="button"
                        onclick="deleteCartItem('${escapeHTML(item.product_id)}')"
                        style="background:#dc3545;color:white;border:none;border-radius:6px;padding:5px 8px;font-size:12px;cursor:pointer;">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;gap:8px;">
                    <div style="font-size:13px;color:#ced4da;">Quantity</div>

                    <div style="display:flex;align-items:center;background:#212529;border:1px solid #6c757d;border-radius:8px;overflow:hidden;">
                        <button type="button"
                            onclick="changeQuantity('${escapeHTML(item.product_id)}',-1)"
                            aria-label="Decrease quantity"
                            style="width:32px;height:30px;border:none;background:#343a40;color:white;font-size:18px;cursor:pointer;">−</button>

                        <span style="min-width:32px;text-align:center;color:#ffc107;font-weight:bold;font-size:14px;">
                            ${Number(item.quantity)}
                        </span>

                        <button type="button"
                            onclick="changeQuantity('${escapeHTML(item.product_id)}',1)"
                            aria-label="Increase quantity"
                            style="width:32px;height:30px;border:none;background:#343a40;color:white;font-size:18px;cursor:pointer;">+</button>
                    </div>
                </div>

                <div style="text-align:right;margin-top:10px;font-weight:bold;color:#ffc107;">
                    Subtotal: ₹${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
  });

  cartHTML += `</div>`;

  if (cart.length === 0) {
    cartHTML += `
            <p style="text-align:center;color:#ced4da;padding:15px 0;">
                Your cart is empty!
            </p>
        `;
  } else {
    cartHTML += `
            <div id="cartActions">

                <div style="display:flex;justify-content:space-between;align-items:center;margin:10px 0;">
                    <strong style="color:white;">Grand Total</strong>
                    <strong style="color:#ffc107;font-size:20px;">
                        ₹${total.toFixed(2)}
                    </strong>
                </div>

                <div style="display:flex;gap:10px;margin-top:8px;">
                    <button type="button" onclick="clearCart()"
                        style="flex:1;background:#dc3545;color:white;border:none;border-radius:8px;padding:9px 5px;font-weight:600;font-size:13px;cursor:pointer;">
                        <i class="bi bi-trash"></i> Clear Cart
                    </button>

                    <button type="button" onclick="checkOut()"
                        style="flex:1;background:#198754;color:white;border:none;border-radius:8px;padding:9px 5px;font-weight:600;font-size:13px;cursor:pointer;">
                        <i class="bi bi-bag-check"></i> Check Out
                    </button>
                </div>

            </div>
        `;
  }

  cartBox.innerHTML = cartHTML;
  saveCart();
}

/* CHANGE QUANTITY */

function changeQuantity(product_id, change) {
  let item = cart.find(
    (product) => String(product.product_id) === String(product_id),
  );

  if (!item) {
    return;
  }

  item.quantity += change;

  if (item.quantity <= 0) {
    deleteCartItem(product_id);
    return;
  }

  displayCart();
}

/* DELETE CART ITEM */

function deleteCartItem(product_id) {
  cart = cart.filter((item) => String(item.product_id) !== String(product_id));

  saveCart();
  displayCart();
}

/* CLEAR CART */

function clearCart() {
  if (!confirm("Are you sure you want to clear your cart?")) {
    return;
  }

  cart = [];
  localStorage.removeItem("cart");

  document.cookie =
    encodeURIComponent("username") +
    "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";

  hideWelcome();
  displayCart();
}

/* CLOSE CART */

function closeCart() {
  let cartBox = document.getElementById("cartBox");

  if (cartBox) {
    cartBox.remove();
  }
}

/* ESCAPE HTML */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char];
  });
}

/* CHECKOUT - COMPACT BILL */

function checkOut() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  let total = 0;

  let billRows = cart
    .map((item, index) => {
      let price = Number(item.price);
      let quantity = Number(item.quantity);
      let subtotal = price * quantity;

      total += subtotal;

      return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(item.product_name)}</td>
                <td>₹${price.toFixed(2)}</td>
                <td>${quantity}</td>
                <td>₹${subtotal.toFixed(2)}</td>
            </tr>
        `;
    })
    .join("");

  let billNumber = "JOY-" + Date.now().toString().slice(-8);
  let billDate = new Date().toLocaleString("en-IN");
  let username = getCookie("username") || "Guest";

  let oldBill = document.getElementById("billOverlay");

  if (oldBill) {
    oldBill.remove();
  }

  let billOverlay = document.createElement("div");
  billOverlay.id = "billOverlay";

  billOverlay.innerHTML = `
        <div id="billBox">

            <div class="bill-print-area">

                <div class="bill-header">
                    <h2><i class="bi bi-cart3"></i> JOY SHOPPING</h2>
                    <p>Thank you for shopping with us!</p>
                </div>

                <div class="bill-details">
                    <p><strong>Bill Number:</strong> ${billNumber}</p>
                    <p><strong>Customer:</strong> ${escapeHTML(username)}</p>
                    <p><strong>Date:</strong> ${escapeHTML(billDate)}</p>
                </div>

                <h3 class="bill-title">Shopping Bill</h3>

                <div class="bill-table-container">
                    <table class="bill-table">
                        <thead>
                            <tr>
                                <th style="width:8%;">S.No</th>
                                <th style="width:36%;">Product Name</th>
                                <th style="width:18%;">Price</th>
                                <th style="width:10%;">Qty</th>
                                <th style="width:28%;">Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${billRows}
                        </tbody>

                        <tfoot>
                            <tr>
                                <td colspan="4">Grand Total</td>
                                <td>₹${total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="bill-footer">
                    <p>Thank you! Visit Again.</p>
                </div>

            </div>

            <div class="bill-buttons">

                <button type="button" id="backToShopping">
                    <i class="bi bi-arrow-left"></i> Back
                </button>

                <button type="button" id="printBill">
                    <i class="bi bi-printer"></i> Print Bill
                </button>

                <button type="button" id="proceedToPay">
                    <i class="bi bi-credit-card"></i> Proceed to Pay
                </button>

            </div>

            <!-- ANIMATED PAYMENT SECTION -->

            <div id="paymentSection">

                <h3>
                    <i class="bi bi-shield-check"></i>
                    Select Payment Method
                </h3>

                <p style="text-align:center;font-size:13px;margin-bottom:12px;">
                    Amount to Pay:
                    <strong style="color:#198754;font-size:17px;">
                        ₹${total.toFixed(2)}
                    </strong>
                </p>

                <div class="payment-options">

                    <label class="payment-option">
                        <i class="bi bi-credit-card"></i>
                        <input type="radio" name="paymentMethod" value="Card">
                        Card
                    </label>

                    <label class="payment-option">
                        <i class="bi bi-qr-code"></i>
                        <input type="radio" name="paymentMethod" value="UPI">
                        UPI
                    </label>

                    <label class="payment-option">
                        <i class="bi bi-cash-coin"></i>
                        <input type="radio" name="paymentMethod" value="Cash">
                        Cash
                    </label>

                </div>

                <!-- CARD DETAILS -->

                <div class="payment-fields" id="cardFields">

                    <img src="Images/Icons/Visa Card.jpg">
                    <img src="Images/Icons/Master Card.jpg">
                    <img src="Images/Icons/American Express.jpg">
                    <img src="Images/Icons/Discover.jpg">

                    <label for="cardName">Cardholder Name</label>
                    <input type="text" id="cardName"
                        placeholder="Enter cardholder name"
                        autocomplete="cc-name">

                    <label for="cardNumber">Card Number</label>
                    <input type="text" id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        inputmode="numeric"
                        maxlength="19"
                        autocomplete="cc-number">

                    <div style="display:flex;gap:10px;">

                        <div style="flex:1;">
                            <label for="cardExpiry">Expiry Date</label>
                            <input type="text" id="cardExpiry"
                                placeholder="MM/YY"
                                maxlength="5"
                                autocomplete="cc-exp">
                        </div>

                        <div style="flex:1;">
                            <label for="cardCVV">CVV</label>
                            <input type="password" id="cardCVV"
                                placeholder="CVV"
                                inputmode="numeric"
                                maxlength="4"
                                autocomplete="cc-csc">
                        </div>

                    </div>

                    <p style="font-size:11px;color:#6c757d;margin-top:7px;">
                        Demo only. Do not enter real payment card details.
                    </p>

                </div>

                <!-- UPI DETAILS -->

                <div class="payment-fields" id="upiFields">

                    <img src="Images/Icons/G Pay.jpg">
                    <img src="Images/Icons/Phonepe.jpg">
                    <img src="Images/Icons/Paytm.jpg">

                    <label for="upiId">UPI ID</label>
                    <input type="text" id="upiId"
                        placeholder="example@upi"
                        autocomplete="off">

                    <p style="font-size:11px;color:#6c757d;margin-top:7px;">
                        Demo only. No real UPI transaction will be made.
                    </p>

                </div>

                <!-- CASH DETAILS -->

                <div class="payment-fields" id="cashFields">

                    <div style="padding:10px;background:white;border-radius:6px;font-size:13px;">
                        <i class="bi bi-cash-stack"
                            style="font-size:20px;color:#198754;"></i>

                        <strong>Cash Payment</strong>

                        <p style="margin:5px 0 0;">
                            Pay ₹${total.toFixed(2)} in cash at the counter.
                        </p>
                    </div>

                </div>

                <button type="button" id="confirmPayment">
                    <i class="bi bi-check-circle"></i>
                    Confirm Payment
                </button>

                <button type="button" id="cancelPayment">
                    Cancel
                </button>

                <div id="paymentMessage"></div>

            </div>

        </div>
    `;

  document.body.appendChild(billOverlay);

  const billBox = document.getElementById("billBox");
  const paymentSection = document.getElementById("paymentSection");
  const proceedButton = document.getElementById("proceedToPay");

  /* BACK BUTTON */

  document.getElementById("backToShopping").onclick = function () {
    billOverlay.remove();
  };

  /* PRINT BILL */

  document.getElementById("printBill").onclick = function () {
    window.print();
  };

  /* PROCEED TO PAYMENT - SLOW 6-SECOND SLIDE DOWN */

  proceedButton.onclick = function () {
    proceedButton.style.display = "none";

    // Reset the animation so it starts from the top each time.
    paymentSection.classList.remove("payment-open");

    // Force the browser to register the hidden starting state.
    void paymentSection.offsetWidth;

    // Start the 6-second slide-down animation.
    requestAnimationFrame(() => {
      paymentSection.classList.add("payment-open");

      /*
       * Wait until the animation finishes, then scroll
       * down smoothly if the payment section is below view.
       */
      setTimeout(() => {
        const paymentBottom = paymentSection.getBoundingClientRect().bottom;

        const billBottom = billBox.getBoundingClientRect().bottom;

        if (paymentBottom > billBottom - 15) {
          billBox.scrollTo({
            top: billBox.scrollTop + (paymentBottom - billBottom) + 25,
            behavior: "smooth",
          });
        }
      }, 6100);
    });
  };

  /* SHOW SELECTED PAYMENT FIELDS */

  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      document.getElementById("cardFields").style.display = "none";
      document.getElementById("upiFields").style.display = "none";
      document.getElementById("cashFields").style.display = "none";
      document.getElementById("paymentMessage").style.display = "none";
      document.getElementById("confirmPayment").style.display = "block";

      if (this.value === "Card") {
        document.getElementById("cardFields").style.display = "block";
      }

      if (this.value === "UPI") {
        document.getElementById("upiFields").style.display = "block";
      }

      if (this.value === "Cash") {
        document.getElementById("cashFields").style.display = "block";
      }
    });
  });

  /* FORMAT CARD NUMBER */

  document.getElementById("cardNumber").addEventListener("input", function () {
    let digits = this.value.replace(/\D/g, "").slice(0, 16);
    this.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });

  /* FORMAT EXPIRY */

  document.getElementById("cardExpiry").addEventListener("input", function () {
    let digits = this.value.replace(/\D/g, "").slice(0, 4);

    if (digits.length >= 3) {
      this.value = digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
      this.value = digits;
    }
  });

  /* CARD CVV */

  document.getElementById("cardCVV").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 4);
  });

  /* CONFIRM PAYMENT */

  document.getElementById("confirmPayment").onclick = function () {
    let selected = document.querySelector(
      'input[name="paymentMethod"]:checked',
    );

    if (!selected) {
      alert("Please select a payment method.");
      return;
    }

    let method = selected.value;

    if (method === "Card") {
      let cardName = document.getElementById("cardName").value.trim();
      let cardNumber = document
        .getElementById("cardNumber")
        .value.replace(/\s/g, "");
      let expiry = document.getElementById("cardExpiry").value.trim();
      let cvv = document.getElementById("cardCVV").value.trim();

      if (!cardName || !cardNumber || !expiry || !cvv) {
        alert("Please fill in all card fields.");
        return;
      }

      if (!/^\d{16}$/.test(cardNumber)) {
        alert("Enter a valid 16-digit demo card number.");
        return;
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        alert("Enter the expiry date in MM/YY format.");
        return;
      }

      let month = Number(expiry.split("/")[0]);
      let year = 2000 + Number(expiry.split("/")[1]);
      let now = new Date();

      if (
        year < now.getFullYear() ||
        (year === now.getFullYear() && month < now.getMonth() + 1)
      ) {
        alert("This card expiry date has passed.");
        return;
      }

      if (!/^\d{3,4}$/.test(cvv)) {
        alert("Enter a valid demo CVV.");
        return;
      }
    }

    if (method === "UPI") {
      let upiId = document.getElementById("upiId").value.trim();

      if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
        alert("Please enter a valid UPI ID, for example example@upi.");
        return;
      }
    }

    /*
     * DEMO PAYMENT ONLY.
     * This does not contact a bank or process real payments.
     */

    let message = document.getElementById("paymentMessage");

    message.style.display = "block";

    message.innerHTML = `
            <i class="bi bi-check-circle-fill"></i>
            Demo payment confirmation successful!<br>
            Method: ${escapeHTML(method)}<br>
            Amount: ₹${total.toFixed(2)}<br>
            Bill No: ${escapeHTML(billNumber)}
            <br><br>

            <button type="button" id="finishShopping"
                style="background:#198754;color:white;border:none;border-radius:5px;padding:8px 15px;font-weight:bold;cursor:pointer;">
                <i class="bi bi-check2-circle"></i> Finish Shopping
            </button>
        `;

    document.getElementById("confirmPayment").style.display = "none";

    setTimeout(() => {
      message.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);

    /* FINISH SHOPPING - DEMO SUCCESS ALERT */

    document.getElementById("finishShopping").onclick = function () {
      cart = [];
      localStorage.removeItem("cart");

      let cartBox = document.getElementById("cartBox");

      if (cartBox) {
        cartBox.remove();
      }

      document.cookie =
        encodeURIComponent("username") +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax";

      billOverlay.remove();

      goHome();

      alert(
        "🎉 Payment Completed Successfully!\n\n" +
          "Thank you for shopping with Joy Shopping!\n\n" +
          "Your order has been completed successfully.\n\n" +
          "(Demo only — no real payment was processed.)",
      );
    };
  };

  /* CANCEL PAYMENT */

  document.getElementById("cancelPayment").onclick = function () {
    paymentSection.classList.remove("payment-open");

    setTimeout(() => {
      proceedButton.style.display = "inline-block";

      billBox.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 300);
  };
}

/* PAGE LOAD */

document.addEventListener("DOMContentLoaded", function () {
  checkCookie();

  if (cart.length > 0) {
    displayCart();
  }

  /* DUPLICATE CAROUSEL IMAGES FOR CONTINUOUS ANIMATION */

  let track = document.querySelector(".carousel-track");

  if (track) {
    let originalImages = Array.from(track.children);

    originalImages.forEach((img) => {
      let duplicate = img.cloneNode(true);
      duplicate.setAttribute("aria-hidden", "true");
      track.appendChild(duplicate);
    });
  }
});
