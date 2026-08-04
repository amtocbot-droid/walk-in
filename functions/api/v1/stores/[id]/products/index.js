const DEMO_PRODUCTS = {
  "demo-coffee": [
    { sku: "coffee_001", name: "Espresso", price: 3.50, currency: "USD", availability: "InStock", inventoryLevel: 100, aisle: "Counter", shelf: "Menu", coordinates: [1.2, 0, -3.5] },
    { sku: "coffee_002", name: "Cappuccino", price: 4.50, currency: "USD", availability: "InStock", inventoryLevel: 100, aisle: "Counter", shelf: "Menu", coordinates: [1.5, 0, -3.2] },
    { sku: "coffee_003", name: "Cold Brew", price: 4.00, currency: "USD", availability: "InStock", inventoryLevel: 50, aisle: "Counter", shelf: "Menu", coordinates: [0.5, 0, 2.4] },
    { sku: "merch_001", name: "Brew & Bean Tumbler", price: 24.99, currency: "USD", availability: "InStock", inventoryLevel: 15, aisle: "Merchandise", shelf: "Display", coordinates: [-2.1, 0, -1.2] },
    { sku: "merch_002", name: "Whole Bean Coffee 1lb", price: 16.99, currency: "USD", availability: "LimitedAvailability", inventoryLevel: 3, aisle: "Merchandise", shelf: "Display", coordinates: [-1.8, 0, -0.8] },
    { sku: "food_001", name: "Butter Croissant", price: 3.75, currency: "USD", availability: "InStock", inventoryLevel: 12, aisle: "Pastry", shelf: "Case", coordinates: [2.0, 0, -2.0] },
  ],
  "demo-library": [
    { sku: "book_001", name: "The Great Gatsby", price: 0.00, currency: "USD", availability: "InStock", inventoryLevel: 5, aisle: "Fiction", shelf: "F-G", coordinates: [1.2, 0, -3.5] },
    { sku: "book_002", name: "To Kill a Mockingbird", price: 0.00, currency: "USD", availability: "InStock", inventoryLevel: 3, aisle: "Fiction", shelf: "L-M", coordinates: [1.5, 0, -3.2] },
    { sku: "book_003", name: "A Brief History of Time", price: 0.00, currency: "USD", availability: "InStock", inventoryLevel: 2, aisle: "Science", shelf: "Physics", coordinates: [0.5, 0, 2.4] },
    { sku: "service_001", name: "Library Card", price: 0.00, currency: "USD", availability: "InStock", inventoryLevel: 999, aisle: "Services", shelf: "Front Desk", coordinates: [-2.1, 0, -1.2] },
    { sku: "service_002", name: "Printing (per page)", price: 0.15, currency: "USD", availability: "InStock", inventoryLevel: 999, aisle: "Services", shelf: "Computer Lab", coordinates: [-1.8, 0, -0.8] },
    { sku: "media_001", name: "Documentary DVD", price: 0.00, currency: "USD", availability: "LimitedAvailability", inventoryLevel: 1, aisle: "Media", shelf: "Documentaries", coordinates: [2.0, 0, -2.0] },
  ],
  "demo-home-library": [
    { sku: "home_001", name: "Leather-Bound Classics Set", price: 299.99, currency: "USD", availability: "InStock", inventoryLevel: 2, aisle: "Rare Books", shelf: "Display", coordinates: [1.2, 0, -3.5] },
    { sku: "home_002", name: "Reading Chair", price: 449.99, currency: "USD", availability: "InStock", inventoryLevel: 1, aisle: "Furniture", shelf: "Seating", coordinates: [1.5, 0, -3.2] },
    { sku: "home_003", name: "Brass Reading Lamp", price: 89.99, currency: "USD", availability: "InStock", inventoryLevel: 5, aisle: "Lighting", shelf: "Table Lamps", coordinates: [0.5, 0, 2.4] },
    { sku: "home_004", name: "Bookends (Pair)", price: 34.99, currency: "USD", availability: "InStock", inventoryLevel: 8, aisle: "Accessories", shelf: "Decor", coordinates: [-2.1, 0, -1.2] },
    { sku: "home_005", name: "First Edition Novel", price: 150.00, currency: "USD", availability: "LimitedAvailability", inventoryLevel: 1, aisle: "Rare Books", shelf: "Case", coordinates: [-1.8, 0, -0.8] },
  ],
  "demo-office": [
    { sku: "office_001", name: "Hot Desk (Daily)", price: 25.00, currency: "USD", availability: "InStock", inventoryLevel: 20, aisle: "Memberships", shelf: "Desks", coordinates: [1.2, 0, -3.5] },
    { sku: "office_002", name: "Meeting Room (Hourly)", price: 40.00, currency: "USD", availability: "InStock", inventoryLevel: 4, aisle: "Rooms", shelf: "Booking", coordinates: [1.5, 0, -3.2] },
    { sku: "office_003", name: "Dedicated Desk (Monthly)", price: 350.00, currency: "USD", availability: "LimitedAvailability", inventoryLevel: 2, aisle: "Memberships", shelf: "Desks", coordinates: [0.5, 0, 2.4] },
    { sku: "office_004", name: "Ergonomic Chair", price: 599.99, currency: "USD", availability: "InStock", inventoryLevel: 6, aisle: "Furniture", shelf: "Chairs", coordinates: [-2.1, 0, -1.2] },
    { sku: "office_005", name: "Standing Desk", price: 799.99, currency: "USD", availability: "InStock", inventoryLevel: 3, aisle: "Furniture", shelf: "Desks", coordinates: [-1.8, 0, -0.8] },
    { sku: "office_006", name: "Coffee Subscription", price: 29.99, currency: "USD", availability: "InStock", inventoryLevel: 50, aisle: "Amenities", shelf: "Kitchen", coordinates: [2.0, 0, -2.0] },
  ],
  "demo-dentist": [
    { sku: "dental_001", name: "Routine Checkup", price: 120.00, currency: "USD", availability: "InStock", inventoryLevel: 10, aisle: "Services", shelf: "Appointments", coordinates: [1.2, 0, -3.5] },
    { sku: "dental_002", name: "Teeth Cleaning", price: 95.00, currency: "USD", availability: "InStock", inventoryLevel: 8, aisle: "Services", shelf: "Appointments", coordinates: [1.5, 0, -3.2] },
    { sku: "dental_003", name: "Teeth Whitening", price: 450.00, currency: "USD", availability: "LimitedAvailability", inventoryLevel: 3, aisle: "Services", shelf: "Cosmetic", coordinates: [0.5, 0, 2.4] },
    { sku: "dental_004", name: "Electric Toothbrush", price: 89.99, currency: "USD", availability: "InStock", inventoryLevel: 12, aisle: "Products", shelf: "Display", coordinates: [-2.1, 0, -1.2] },
    { sku: "dental_005", name: "Premium Mouthwash", price: 12.99, currency: "USD", availability: "InStock", inventoryLevel: 25, aisle: "Products", shelf: "Display", coordinates: [-1.8, 0, -0.8] },
    { sku: "dental_006", name: "Orthodontic Consultation", price: 200.00, currency: "USD", availability: "InStock", inventoryLevel: 5, aisle: "Services", shelf: "Specialist", coordinates: [2.0, 0, -2.0] },
  ],
  "demo-bookstore": [
    { sku: "bookstore_001", name: "Bestseller Hardcover", price: 28.99, currency: "USD", availability: "InStock", inventoryLevel: 15, aisle: "Fiction", shelf: "New Releases", coordinates: [1.2, 0, -3.5] },
    { sku: "bookstore_002", name: "Local Author Signed Copy", price: 24.99, currency: "USD", availability: "LimitedAvailability", inventoryLevel: 3, aisle: "Local", shelf: "Signed", coordinates: [1.5, 0, -3.2] },
    { sku: "bookstore_003", name: "Children's Picture Book", price: 17.99, currency: "USD", availability: "InStock", inventoryLevel: 20, aisle: "Children", shelf: "Picture Books", coordinates: [0.5, 0, 2.4] },
    { sku: "bookstore_004", name: "Literary Journal Subscription", price: 45.00, currency: "USD", availability: "InStock", inventoryLevel: 30, aisle: "Periodicals", shelf: "Journals", coordinates: [-2.1, 0, -1.2] },
    { sku: "bookstore_005", name: "Book Club Membership", price: 60.00, currency: "USD", availability: "InStock", inventoryLevel: 50, aisle: "Memberships", shelf: "Programs", coordinates: [-1.8, 0, -0.8] },
    { sku: "bookstore_006", name: "Moleskine Notebook", price: 19.95, currency: "USD", availability: "InStock", inventoryLevel: 40, aisle: "Stationery", shelf: "Notebooks", coordinates: [2.0, 0, -2.0] },
  ],
};

export async function onRequestGet(context) {
  const { id } = context.params;

  // Check demo products first.
  if (DEMO_PRODUCTS[id]) {
    return Response.json({ products: DEMO_PRODUCTS[id] });
  }

  const products = await context.env.KV.get(`products:${id}`, "json");
  return Response.json({ products: products ?? [] });
}

export async function onRequestPost(context) {
  const { id } = context.params;
  const body = await context.request.json();

  const products = (await context.env.KV.get(`products:${id}`, "json")) ?? [];
  const idx = products.findIndex((p) => p.sku === body.sku);
  if (idx >= 0) products[idx] = body;
  else products.push(body);

  await context.env.KV.put(`products:${id}`, JSON.stringify(products));
  return Response.json({ saved: true });
}
