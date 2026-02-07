import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  //---------------------------
  // TYPES
  //---------------------------

  public type Product = {
    id : Nat;
    name : Text;
    description : Text;
    priceInPaise : Nat;
    stock : Nat;
    image : Text;
    categories : [Text];
    createdAt : Int;
    unit : Text;
    inStock : Bool;
    dealPriceInPaise : ?Nat;
    hasDealPrice : Bool;
    brand : Text;
    volume : Text;
    variants : [ProductVariant];
    tags : [Text];
  };

  public type ProductVariant = {
    variantId : Nat;
    name : Text;
    priceInPaise : Nat;
    stock : Nat;
  };

  public type CartItem = {
    id : Nat;
    variant : ?Nat;
    quantity : Nat;
  };

  public type Order = {
    id : Nat;
    user : Principal;
    items : [OrderItem];
    totalPriceInPaise : Nat;
    createdAt : Int;
  };

  public type OrderItem = {
    id : Nat;
    variant : ?Nat;
    quantity : Nat;
    price : Nat;
  };

  public type Category = {
    id : Nat;
    name : Text;
    image : Text;
    productCount : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Sorting module for Products
  module Product {
    public func compareByStock(a : Product, b : Product) : Order.Order {
      Nat.compare(a.stock, b.stock);
    };

    public func compareByPrice(a : Product, b : Product) : Order.Order {
      Nat.compare(a.priceInPaise, b.priceInPaise);
    };
  };

  // Sorting module for Categories
  module Category {
    public func compareByProductCount(a : Category, b : Category) : Order.Order {
      Nat.compare(b.productCount, a.productCount);
    };
  };

  //---------------------------
  // STATE
  //---------------------------

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextProductId = 1;
  var nextOrderId = 1;
  var nextCategoryId = 1;
  var nextVariantId = 1;

  // Persistent storage
  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Nat, Category>();
  let userCarts = Map.empty<Principal, List.List<CartItem>>();
  let orders = Map.empty<Nat, Order>();
  let mostBoughtProducts = Map.empty<Nat, Nat>(); // Product ID -> Count
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Demo data loaded flag
  var demoDataLoaded = false;

  //---------------------------
  // USER PROFILE MANAGEMENT
  //---------------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  //---------------------------
  // PRODUCT & CATEGORY MGMT (ADMIN)
  //---------------------------

  public shared ({ caller }) func createProduct(name : Text, description : Text, priceInPaise : Nat, stock : Nat, image : Text, categories : [Text], unit : Text, brand : Text, volume : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let product : Product = {
      id = nextProductId;
      name;
      description;
      priceInPaise;
      stock;
      image;
      categories;
      createdAt = Time.now();
      unit;
      inStock = stock > 0;
      dealPriceInPaise = null;
      hasDealPrice = false;
      brand;
      volume;
      variants = [];
      tags = [];
    };

    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared ({ caller }) func createCategory(name : Text, image : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };

    let category : Category = {
      id = nextCategoryId;
      name;
      image;
      productCount = 0;
    };

    categories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category.id;
  };

  //---------------------------
  // PRODUCT QUERY & FILTER
  //---------------------------

  func hasCategory(product : Product, category : Text) : Bool {
    for (cat in product.categories.values()) {
      if (cat == category) {
        return true;
      };
    };
    false;
  };

  func hasTag(product : Product, tag : Text) : Bool {
    for (t in product.tags.values()) {
      if (t == tag) {
        return true;
      };
    };
    false;
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) { hasCategory(p, category) }
    );
  };

  public query ({ caller }) func getFilteredProductsByCategory(category : Text, filter : Text) : async [Product] {
    products.values().toArray().filter(
      func(p) { hasCategory(p, category) and hasTag(p, filter) }
    );
  };

  public query ({ caller }) func getAllProductsByStock() : async [Product] {
    products.values().toArray().sort(Product.compareByStock);
  };

  public query ({ caller }) func getAllProductsByPrice() : async [Product] {
    products.values().toArray().sort(Product.compareByPrice);
  };

  //---------------------------
  // ORDER MANAGEMENT
  //---------------------------

  public shared ({ caller }) func placeOrder(cartItems : [CartItem]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let totalPriceInPaise = cartItems.foldLeft(
      0,
      func(acc, item) {
        switch (products.get(item.id)) {
          case (null) { acc };
          case (?product) { acc + (product.priceInPaise * item.quantity) };
        };
      },
    );

    let orderItems = cartItems.map(
      func(cartItem) {
        switch (products.get(cartItem.id)) {
          case (?product) {
            {
              id = cartItem.id;
              variant = cartItem.variant;
              quantity = cartItem.quantity;
              price = product.priceInPaise;
            };
          };
          case (null) { Runtime.trap("Product not found") };
        };
      }
    );

    let order : Order = {
      id = nextOrderId;
      user = caller;
      items = orderItems;
      totalPriceInPaise;
      createdAt = Time.now();
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  //---------------------------
  // DEMO CATALOG DATA LOAD
  //---------------------------

  public shared ({ caller }) func initializeDemoData() : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can load demo data");
    };
    if (demoDataLoaded) return;

    let demoProducts : [Product] = [
      {
        id = nextProductId;
        name = "Rice (चावल)";
        description = "High-quality rice for daily consumption.";
        priceInPaise = 5000;
        stock = 500;
        image = "rice.jpg";
        categories = ["Food"];
        createdAt = Time.now();
        unit = "Kg";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Local Brand";
        volume = "1 Kg";
        variants = [
          {
            variantId = 1;
            name = "5 Kg packet";
            priceInPaise = 20000;
            stock = 100;
          },
        ];
        tags = ["staple"];
      },
      {
        id = nextProductId + 1;
        name = "Wheat Flour (आटा)";
        description = "Fine quality wheat flour for chapatis.";
        priceInPaise = 4000;
        stock = 400;
        image = "wheatflour.jpg";
        categories = ["Food"];
        createdAt = Time.now();
        unit = "Kg";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Patanjali";
        volume = "1 Kg";
        variants = [
          {
            variantId = 2;
            name = "5 Kg packet";
            priceInPaise = 18000;
            stock = 80;
          },
        ];
        tags = ["staple"];
      },
      {
        id = nextProductId + 2;
        name = "Dal (Lentils) (दाल)";
        description = "Top-quality masoor dal.";
        priceInPaise = 8000;
        stock = 300;
        image = "dal.jpg";
        categories = ["Food"];
        createdAt = Time.now();
        unit = "Kg";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Tata";
        volume = "1 Kg";
        variants = [
          {
            variantId = 3;
            name = "2 Kg packet";
            priceInPaise = 16000;
            stock = 50;
          },
        ];
        tags = ["protein"];
      },
      {
        id = nextProductId + 3;
        name = "Sugar (चीनी)";
        description = "Pure, refined sugar for daily use.";
        priceInPaise = 4500;
        stock = 250;
        image = "sugar.jpg";
        categories = ["Beverages"];
        createdAt = Time.now();
        unit = "Kg";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Local Brand";
        volume = "1 Kg";
        variants = [];
        tags = ["sweetener"];
      },
      {
        id = nextProductId + 4;
        name = "Tea (चाय)";
        description = "Premium tea blend for the perfect cup.";
        priceInPaise = 3500;
        stock = 200;
        image = "tea.jpg";
        categories = ["Beverages"];
        createdAt = Time.now();
        unit = "Kg";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Tata";
        volume = "250 g";
        variants = [];
        tags = ["beverage"];
      },
      {
        id = nextProductId + 5;
        name = "Milk (दूध)";
        description = "Fresh, pure buffalo milk.";
        priceInPaise = 7000;
        stock = 150;
        image = "milk.jpg";
        categories = ["Dairy"];
        createdAt = Time.now();
        unit = "Litre";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Mother Dairy";
        volume = "1 Litre";
        variants = [];
        tags = ["dairy"];
      },
      {
        id = nextProductId + 6;
        name = "Cooking Oil (तेल)";
        description = "Refined sunflower oil.";
        priceInPaise = 12000;
        stock = 100;
        image = "oil.jpg";
        categories = ["Oils"];
        createdAt = Time.now();
        unit = "Litre";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Fortune";
        volume = "1 Litre";
        variants = [
          {
            variantId = 7;
            name = "5 Litre can";
            priceInPaise = 55000;
            stock = 20;
          },
        ];
        tags = ["cooking"];
      },
      {
        id = nextProductId + 7;
        name = "Salt (नमक)";
        description = "Iodized table salt.";
        priceInPaise = 2000;
        stock = 200;
        image = "salt.jpg";
        categories = ["Food"];
        createdAt = Time.now();
        unit = "Kg";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Tata";
        volume = "1 Kg";
        variants = [];
        tags = ["staple"];
      },
      {
        id = nextProductId + 8;
        name = "Spices Mix (मसाला)";
        description = "Blended spices for Indian cooking.";
        priceInPaise = 1500;
        stock = 80;
        image = "spices.jpg";
        categories = ["Food"];
        createdAt = Time.now();
        unit = "100g pack";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = true;
        brand = "Catch";
        volume = "100g";
        variants = [
          {
            variantId = 9;
            name = "50g packet";
            priceInPaise = 800;
            stock = 100;
          },
        ];
        tags = ["spice"];
      },
      {
        id = nextProductId + 9;
        name = "Biscuits (बिस्कुट)";
        description = "Crunchy treat biscuits for tea time.";
        priceInPaise = 2000;
        stock = 150;
        image = "biscuits.jpg";
        categories = ["Snacks"];
        createdAt = Time.now();
        unit = "200g pack";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Parle-G";
        volume = "200g";
        variants = [];
        tags = ["snack"];
      },
      {
        id = nextProductId + 10;
        name = "Soft Drinks (Cold Drinks)";
        description = "Thirst-quenching fizzy beverages.";
        priceInPaise = 1600;
        stock = 120;
        image = "softdrinks.jpg";
        categories = ["Beverages"];
        createdAt = Time.now();
        unit = "250 ml";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Coca-Cola";
        volume = "250 ml";
        variants = [];
        tags = ["drink"];
      },
      {
        id = nextProductId + 11;
        name = "Soap (साबुन)";
        description = "Gentle bathing soap for cleansing.";
        priceInPaise = 2800;
        stock = 130;
        image = "soap.jpg";
        categories = ["Personal Care"];
        createdAt = Time.now();
        unit = "100g";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Lifebuoy";
        volume = "100g";
        variants = [];
        tags = ["hygiene"];
      },
      {
        id = nextProductId + 12;
        name = "Shampoo (शैम्पू)";
        description = "Revitalizing hair cleanser.";
        priceInPaise = 3900;
        stock = 120;
        image = "shampoo.jpg";
        categories = ["Personal Care"];
        createdAt = Time.now();
        unit = "200 ml";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Clinic Plus";
        volume = "200 ml";
        variants = [];
        tags = ["hair care"];
      },
      {
        id = nextProductId + 13;
        name = "Toothpaste (टूथपेस्ट)";
        description = "Cavity protection toothpaste.";
        priceInPaise = 2700;
        stock = 120;
        image = "toothpaste.jpg";
        categories = ["Personal Care"];
        createdAt = Time.now();
        unit = "100g";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Colgate";
        volume = "100g";
        variants = [];
        tags = ["oral care"];
      },
      {
        id = nextProductId + 14;
        name = "Bread (ब्रेड)";
        description = "Fresh bakery bread for breakfast.";
        priceInPaise = 3300;
        stock = 120;
        image = "bread.jpg";
        categories = ["Bakery"];
        createdAt = Time.now();
        unit = "400g";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Modern Bread";
        volume = "400g";
        variants = [];
        tags = ["breakfast"];
      },
      {
        id = nextProductId + 15;
        name = "Egg Tray (अंडे)";
        description = "Farm-fresh eggs in tray.";
        priceInPaise = 1200;
        stock = 100;
        image = "eggs.jpg";
        categories = ["Dairy"];
        createdAt = Time.now();
        unit = "Dozen";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Local Farm";
        volume = "12";
        variants = [];
        tags = ["dairy"];
      },
      {
        id = nextProductId + 16;
        name = "Detergent Powders (डिटर्जेंट)";
        description = "Effective laundry cleaning for all needs.";
        priceInPaise = 4800;
        stock = 100;
        image = "detergent.jpg";
        categories = ["Home Care"];
        createdAt = Time.now();
        unit = "1Kg pack";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Surf";
        volume = "1Kg";
        variants = [];
        tags = ["cleaning"];
      },
      {
        id = nextProductId + 17;
        name = "Sanitizer (सेनिटाइज़र)";
        description = "Alcohol-based hand cleanser for safety.";
        priceInPaise = 2200;
        stock = 100;
        image = "sanitizer.jpg";
        categories = ["Personal Care"];
        createdAt = Time.now();
        unit = "100ml";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Dettol";
        volume = "100ml";
        variants = [];
        tags = ["health"];
      },
      {
        id = nextProductId + 18;
        name = "Vegetables (तरकारी)";
        description = "Fresh seasonal vegetables daily.";
        priceInPaise = 6500;
        stock = 80;
        image = "vegetables.jpg";
        categories = ["Food"];
        createdAt = Time.now();
        unit = "Kg";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Local";
        volume = "1Kg";
        variants = [];
        tags = ["vegetarian"];
      },
      {
        id = nextProductId + 19;
        name = "Fruits (फल)";
        description = "Handpicked fresh quality fruits.";
        priceInPaise = 7000;
        stock = 70;
        image = "fruits.jpg";
        categories = ["Food"];
        createdAt = Time.now();
        unit = "Kg";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Local";
        volume = "1Kg";
        variants = [];
        tags = ["healthy"];
      },
      {
        id = nextProductId + 20;
        name = "Ice Cream (आइसक्रीम)";
        description = "Velvety smooth and deliciously cold treats.";
        priceInPaise = 9000;
        stock = 50;
        image = "icecream.jpg";
        categories = ["Frozen"];
        createdAt = Time.now();
        unit = "500ml";
        inStock = true;
        dealPriceInPaise = null;
        hasDealPrice = false;
        brand = "Amul";
        volume = "500ml";
        variants = [];
        tags = ["dessert"];
      },
    ];

    let demoCategories : [Category] = [
      { id = 1; name = "Food"; image = "foodcategory.jpg"; productCount = 10 },
      { id = 2; name = "Beverages"; image = "beveragescategory.jpg"; productCount = 4 },
      { id = 3; name = "Dairy"; image = "dairycategory.jpg"; productCount = 4 },
      { id = 4; name = "Oils"; image = "oilscategory.jpg"; productCount = 2 },
      { id = 5; name = "Bakery"; image = "bakerycategory.jpg"; productCount = 1 },
      { id = 6; name = "Frozen"; image = "frozencategory.jpg"; productCount = 1 },
      { id = 7; name = "Personal Care"; image = "personalcarecategory.jpg"; productCount = 5 },
      { id = 8; name = "Home Care"; image = "homecarecategory.jpg"; productCount = 1 },
    ];

    demoProducts.forEach(
      func(product) {
        products.add(nextProductId, product);
        nextProductId += 1;
      }
    );

    demoCategories.forEach(
      func(category) {
        categories.add(category.id, category);
        nextCategoryId += 1;
      }
    );

    demoDataLoaded := true;
  };

  //---------------------------
  // CATEGORY QUERY
  //---------------------------

  public query ({ caller }) func getAllCategoriesByProductCount() : async [Category] {
    categories.values().toArray().sort(Category.compareByProductCount);
  };
};
