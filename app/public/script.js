document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById("productForm");
    const productList = document.getElementById("productList");

    // Form submission
    productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const productName = document.getElementById("productName").value;
    const productDescription =
        document.getElementById("productDescription").value;
    const productPrice = parseFloat(
        document.getElementById("productPrice").value
    );
    const productStock = parseInt(
        document.getElementById("productStock").value
    );

    const productData = {
        name: productName,
        description: productDescription,
        price: productPrice,
        stock: productStock,
    };

    fetch("/api/products", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    })
        .then((response) => {
        if (response.status === 201) {
            document.getElementById("productName").value = "";
            document.getElementById("productDescription").value = "";
            document.getElementById("productPrice").value = "";
            document.getElementById("productStock").value = "";
            displayProducts();
        } else {
            console.error("Failed to add the product:", response.statusText);
        }
        })
        .catch((error) => {
        console.error("Error adding product:", error);
        });
    });

    // Function to display products
    function displayProducts() {
    fetch("/api/products")
        .then((response) => response.json())
        .then((data) => {
        if (Array.isArray(data.products)) {
            productList.innerHTML = "";
            data.products.forEach((product) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
                        <strong>${product.name}</strong> - ${product.description}<br>
                        Price: $${product.price}, Stock: ${product.stock}
                        <button onclick="editProduct(${product.id})">Edit</button>
                        <button onclick="viewProductDetails(${product.id})">View Details</button>
                        <button onclick="toggleProductStatus(${product.id}, ${product.available})">${product.available? "Mark as Out of Stock": product.available === 1? "Out of Stock": "Delete"}</button>`;
            productList.appendChild(listItem);
            });
        } else {
            console.error("Received data is not an array:", data);
        }
        })
        .catch((error) => {
        console.error("Error fetching products:", error);
        });
    }

    // Function to open the edit modal with product details
    function editProduct(productId) {
    const editModal = document.getElementById("editModal");
    editModal.style.display = "block";

    // Remove any previous event listeners from the edit form
    const editForm = document.getElementById("editForm");
    const newEditForm = editForm.cloneNode(true);
    editForm.parentNode.replaceChild(newEditForm, editForm);

    // Fetch the existing product details using the product ID from your API
    fetch(`/api/products/${productId}`)
        .then((response) => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 404) {
            alert("Product not found");
            return null;
        } else {
            alert("Failed to retrieve product");
            return null;
        }
        })
        .then((productDetails) => {
        if (productDetails) {
            // Populate the form with the existing product details
            document.getElementById("editName").value = productDetails.name;
            document.getElementById("editDescription").value =
            productDetails.description;
            document.getElementById("editPrice").value = productDetails.price;
            document.getElementById("editStock").value = productDetails.stock;

            // Handle the form submission to save changes with the productId
            const newEditForm = document.getElementById("editForm");
            newEditForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Retrieve the edited product details
            const editedProduct = {
                name: document.getElementById("editName").value,
                description: document.getElementById("editDescription").value,
                price: parseFloat(document.getElementById("editPrice").value),
                stock: parseInt(document.getElementById("editStock").value),
            };
            // Send the productId along with the edited product details
            updateProduct(productId, editedProduct);
            });
        }
        });
    }

    // Function to update a product
    function updateProduct(productId, editedProduct) {
    // Make an API request to fetch the existing product data
    fetch(`/api/products/${productId}`)
        .then((response) => {
        if (response.status === 200) {
            return response.json();
        } else {
            alert("Failed to retrieve existing product data for comparison.");
            return null;
        }
        })
        .then((existingProduct) => {
        if (existingProduct) {
            // Check if there are actual changes to be saved
            if (
            existingProduct.name === editedProduct.name &&
            existingProduct.description === editedProduct.description &&
            existingProduct.price === editedProduct.price &&
            existingProduct.stock === editedProduct.stock
            ) {
            alert("No changes made. Product update failed.");
            } else {
            // There are changes, proceed with the update
            fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(editedProduct),
            }).then((response) => {
                if (response.status === 200) {
                alert("Product updated successfully");
                closeEditModal();
                displayProducts(); // Refresh the product list
                } else {
                alert("Product update failed.");
                }
            });
            }
        }
        });
    }

    // Function to view the product detail page
    function viewProductDetails(productId) {
    const detailsModal = document.getElementById("detailsModal");
    detailsModal.style.display = "block";

    // Fetch the product details using the product ID
    fetch(`/api/products/${productId}`)
        .then((response) => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 404) {
            alert("Product not found");
            return null;
        } else {
            alert("Failed to retrieve product");
            return null;
        }
        })
        .then((productDetails) => {
        if (productDetails) {
            // Populate the modal with the product details
            document.getElementById(
            "productDetailsName"
            ).textContent = `Name: ${productDetails.name}\n`;
            document.getElementById(
            "productDetailsDescription"
            ).textContent = `Description: ${productDetails.description}\n`;
            document.getElementById(
            "productDetailsPrice"
            ).textContent = `Price: $${productDetails.price}\n`;
            document.getElementById(
            "productDetailsStock"
            ).textContent = `Stock: ${productDetails.stock}`;
        }
        });
    }

    // Function To close Edit Modal
    function closeEditModal() {
    const editModal = document.getElementById("editModal");
    editModal.style.display = "none";
    }
    const closeEditModalButton = document.getElementById("closeEditModal");
    closeEditModalButton.addEventListener("click", closeEditModal);

    function closeDetailsModal() {
    const detailsModal = document.getElementById("detailsModal");
    detailsModal.style.display = "none";
    }

    // Close the modal if the user clicks outside of it

    window.onclick = function (event) {
    const editModal = document.getElementById("editModal");
    if (event.target === editModal) {
        editModal.style.display = "none";
    }
    };

    // Function to mark a product as out of stock => Have Some Bug // needs refreshing after clicking the button to see the change
    function markAsOutOfStock(productId) {
    // Call the server-side API to mark the product as out of stock
    fetch(`/api/products/${productId}/markOutOfStock`, {
        method: "PUT",
    }).then((response) => {
        if (response.status === 200) {
        // Update the button text to "Out of Stock"
        const outOfStockButton = document.getElementById(
            `toggleProductStatus${productId}`
        );
        outOfStockButton.textContent = "Out of Stock";

        // Update the product's status locally
        const product = toggleProductStatus(productId);
        if (product) {
            product.available = 0; // Assuming 0 means out of stock in your data structure
        }
        } else if (response.status === 400) {
        alert("Product is already out of stock");
        } else {
        alert("Failed to mark product as out of stock");
        }
    });
    }

    // Function to toggle product status
    function toggleProductStatus(productId, isAvailable) {
    if (isAvailable) {
        // If the product is available, mark it as out of stock
        markAsOutOfStock(productId);
    } else if (isAvailable === 0) {
        // If the product is marked as out of stock, allow deletion
        deleteProduct(productId);
    }
    }

    //Function to delete a product
    function deleteProduct(productId) {
    // Ask the user for confirmation before deleting the product
    if (confirm("Are you sure you want to delete this product?")) {
        // Make an API request to delete the product based on its ID
        fetch(`/api/products/${productId}`, {
        method: "DELETE",
        }).then((response) => {
        if (response.status === 200) {
            alert("Product deleted successfully");
            displayProducts(); // Refresh the product list
        } else {
            alert("Product deletion failed.");
        }
        });
    }
    }

    // Display existing products when the page loads
    displayProducts();
});