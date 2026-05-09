import type { Difficulty } from "@recipes/shared";

export interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
}

export interface SeedCategory {
  name: string;
  description: string;
}

export interface SeedRecipe {
  title: string;
  description: string;
  categoryName: string;
  authorEmail: string;
  difficulty: Difficulty;
  cookingTime: number;
  servings: number;
  isPublic: boolean;
  image: { url: string };
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
}

export interface SeedComment {
  text: string;
  recipeTitle: string;
  authorEmail: string;
}

export interface SeedRating {
  recipeTitle: string;
  userEmail: string;
  value: number;
}

export interface SeedFavorite {
  userEmail: string;
  recipeTitle: string;
}

export interface SeedReview {
  authorEmail: string;
  text: string;
  rating: number;
  isFeatured: boolean;
}

export const seedCategories: SeedCategory[] = [
  {
    name: "American",
    description:
      "Classic American comfort food and iconic dishes from coast to coast",
  },
  {
    name: "Italian",
    description:
      "Traditional and modern Italian cuisine from pasta to pizza and beyond",
  },
  {
    name: "Mexican",
    description:
      "Vibrant Mexican flavors with fresh ingredients, bold spices, and time-honored traditions",
  },
  {
    name: "Asian",
    description:
      "Diverse Asian cuisines from fragrant stir-fries to rich, aromatic curries",
  },
  {
    name: "French",
    description:
      "Elegant French cooking techniques and timeless classic recipes",
  },
  {
    name: "Desserts",
    description:
      "Sweet treats, baked goods, and indulgent finales to complete any meal",
  },
  {
    name: "Appetizers",
    description:
      "Small plates, starters, and snacks to whet the appetite before the main event",
  },
  {
    name: "Beverages",
    description:
      "Refreshing drinks, cocktails, smoothies, and hot beverages for every mood",
  },
];

export const seedUsers: SeedUser[] = [
  {
    email: "admin@recipes.app",
    password: "AdminPass123!",
    name: "Admin User",
    role: "admin",
  },
  {
    email: "mario@recipes.app",
    password: "ChefMario123!",
    name: "Mario Rossi",
    role: "user",
  },
  {
    email: "julia@recipes.app",
    password: "JuliaChild123!",
    name: "Julia Child",
    role: "user",
  },
  {
    email: "gordon@recipes.app",
    password: "GordonRamsay123!",
    name: "Gordon Ramsay",
    role: "user",
  },
  {
    email: "alice@recipes.app",
    password: "AliceWaters123!",
    name: "Alice Waters",
    role: "user",
  },
];

export const seedRecipes: SeedRecipe[] = [
  {
    title: "Classic American Pancakes",
    description:
      "Fluffy, golden pancakes served with maple syrup and butter. A timeless breakfast favorite that never goes out of style.",
    categoryName: "American",
    authorEmail: "mario@recipes.app",
    difficulty: "easy",
    cookingTime: 25,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "all-purpose flour", quantity: 200, unit: "g" },
      { name: "granulated sugar", quantity: 2, unit: "tbsp" },
      { name: "baking powder", quantity: 2, unit: "tsp" },
      { name: "salt", quantity: 0.5, unit: "tsp" },
      { name: "milk", quantity: 300, unit: "ml" },
      { name: "large eggs", quantity: 2, unit: "pcs" },
      { name: "unsalted butter, melted", quantity: 3, unit: "tbsp" },
      { name: "vanilla extract", quantity: 1, unit: "tsp" },
      { name: "maple syrup", quantity: 60, unit: "ml" },
    ],
    instructions: [
      "In a large bowl, whisk together the flour, sugar, baking powder, and salt.",
      "In a separate bowl, beat the eggs and then whisk in the milk, melted butter, and vanilla extract.",
      "Pour the wet ingredients into the dry ingredients and stir until just combined. Do not overmix; a few lumps are fine.",
      "Heat a non-stick pan over medium heat and lightly grease with butter. Pour 1/4 cup of batter for each pancake.",
      "Cook until bubbles form on the surface, then flip and cook for another 1-2 minutes until golden brown.",
      "Serve warm with maple syrup and a pat of butter.",
    ],
  },
  {
    title: "Avocado Toast with Poached Egg",
    description:
      "Creamy smashed avocado on toasted sourdough topped with a perfectly poached egg and chili flakes.",
    categoryName: "American",
    authorEmail: "julia@recipes.app",
    difficulty: "easy",
    cookingTime: 15,
    servings: 2,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "sourdough bread slices", quantity: 2, unit: "pcs" },
      { name: "ripe avocado", quantity: 1, unit: "pcs" },
      { name: "large eggs", quantity: 2, unit: "pcs" },
      { name: "lemon juice", quantity: 1, unit: "tbsp" },
      { name: "red chili flakes", quantity: 0.5, unit: "tsp" },
      { name: "sea salt", quantity: 1, unit: "pinch" },
      { name: "black pepper", quantity: 1, unit: "pinch" },
      { name: "extra virgin olive oil", quantity: 1, unit: "tsp" },
    ],
    instructions: [
      "Toast the sourdough bread slices until golden and crisp.",
      "Halve the avocado, remove the pit, and scoop the flesh into a bowl. Add lemon juice, salt, and pepper, then mash with a fork until chunky-smooth.",
      "Bring a pot of water to a gentle simmer. Crack each egg into a small bowl, then carefully slide into the water. Poach for 3 minutes for a runny yolk.",
      "Spread the mashed avocado generously over the toasted bread.",
      "Top each toast with a poached egg, drizzle with olive oil, and sprinkle with chili flakes. Serve immediately.",
    ],
  },
  {
    title: "Eggs Benedict",
    description:
      "An elegant breakfast of toasted English muffins, Canadian bacon, poached eggs, and rich hollandaise sauce.",
    categoryName: "American",
    authorEmail: "gordon@recipes.app",
    difficulty: "medium",
    cookingTime: 35,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "English muffins", quantity: 2, unit: "pcs" },
      { name: "Canadian bacon slices", quantity: 4, unit: "pcs" },
      { name: "large eggs (for poaching)", quantity: 4, unit: "pcs" },
      { name: "large egg yolks", quantity: 3, unit: "pcs" },
      { name: "unsalted butter", quantity: 200, unit: "g" },
      { name: "lemon juice", quantity: 1, unit: "tbsp" },
      { name: "cayenne pepper", quantity: 1, unit: "pinch" },
      { name: "salt", quantity: 0.5, unit: "tsp" },
      { name: "white vinegar", quantity: 1, unit: "tbsp" },
    ],
    instructions: [
      "Make the hollandaise: Melt the butter in a small saucepan. In a blender, combine egg yolks, lemon juice, and salt. Blend on medium speed for 20 seconds.",
      "With the blender running, slowly drizzle in the hot melted butter until the sauce is thick and creamy. Add a pinch of cayenne and set aside in a warm place.",
      "Split and toast the English muffins until golden. Warm the Canadian bacon in a skillet over medium heat.",
      "Bring a wide pot of water with vinegar to a gentle simmer. Poach the eggs for 3 minutes until the whites are set but yolks are still runny.",
      "Assemble: Place two muffin halves on each plate. Top each with a slice of Canadian bacon, then a poached egg.",
      "Spoon the warm hollandaise sauce generously over each egg. Garnish with a tiny pinch of cayenne and serve immediately.",
    ],
  },
  {
    title: "French Omelette",
    description:
      "A silky, custardy French omelette folded with finesse, filled with gruyere and fresh chives.",
    categoryName: "French",
    authorEmail: "alice@recipes.app",
    difficulty: "medium",
    cookingTime: 10,
    servings: 1,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "large eggs", quantity: 3, unit: "pcs" },
      { name: "unsalted butter", quantity: 1, unit: "tbsp" },
      { name: "fresh chives, finely chopped", quantity: 1, unit: "tbsp" },
      { name: "gruyere cheese, grated", quantity: 2, unit: "tbsp" },
      { name: "salt", quantity: 0.25, unit: "tsp" },
      { name: "black pepper", quantity: 1, unit: "pinch" },
    ],
    instructions: [
      "Crack the eggs into a bowl. Add salt and pepper, then beat vigorously with a fork for 30 seconds until fully homogenized and slightly frothy.",
      "Heat a 9-inch non-stick skillet over medium-low heat. Add the butter and swirl until melted and foamy but not browned.",
      "Pour in the eggs. Using a silicone spatula, stir constantly while shaking the pan back and forth. This creates small curds while keeping the eggs moving.",
      "When the eggs are mostly set but still slightly wet, about 90 seconds, stop stirring. Let them settle for 10 seconds to form a thin layer.",
      "Sprinkle the gruyere and half the chives down the center third of the omelette. Tilt the pan and use the spatula to fold one third over the center, then roll onto a warm plate.",
      "Garnish with remaining chives and serve immediately.",
    ],
  },
  {
    title: "Chicken Caesar Salad",
    description:
      "Crisp romaine lettuce tossed with creamy Caesar dressing, grilled chicken, parmesan, and crunchy croutons.",
    categoryName: "American",
    authorEmail: "mario@recipes.app",
    difficulty: "easy",
    cookingTime: 20,
    servings: 2,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "chicken breasts", quantity: 2, unit: "pcs" },
      { name: "romaine lettuce hearts", quantity: 2, unit: "pcs" },
      { name: "parmesan cheese, shaved", quantity: 50, unit: "g" },
      { name: "croutons", quantity: 1, unit: "cup" },
      { name: "Caesar dressing", quantity: 60, unit: "ml" },
      { name: "olive oil", quantity: 1, unit: "tbsp" },
      { name: "salt", quantity: 0.5, unit: "tsp" },
      { name: "black pepper", quantity: 0.5, unit: "tsp" },
      { name: "lemon wedge", quantity: 1, unit: "pcs" },
    ],
    instructions: [
      "Season the chicken breasts generously with salt and pepper on both sides.",
      "Heat olive oil in a grill pan or skillet over medium-high heat. Cook the chicken for 5-6 minutes per side until golden and cooked through. Let rest for 5 minutes, then slice into strips.",
      "Wash and chop the romaine into bite-sized pieces. Pat dry with a clean towel.",
      "In a large salad bowl, add the romaine. Drizzle with Caesar dressing and toss until every leaf is coated.",
      "Top the salad with sliced chicken, shaved parmesan, and croutons. Squeeze fresh lemon over the top and serve immediately.",
    ],
  },
  {
    title: "Grilled Cheese & Tomato Soup",
    description:
      "The ultimate comfort food pairing: a gooey grilled cheese sandwich served alongside velvety tomato basil soup.",
    categoryName: "American",
    authorEmail: "julia@recipes.app",
    difficulty: "easy",
    cookingTime: 35,
    servings: 2,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1547592166-23acbe346499?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "sourdough bread slices", quantity: 4, unit: "pcs" },
      { name: "sharp cheddar cheese, sliced", quantity: 100, unit: "g" },
      { name: "gruyere cheese, sliced", quantity: 50, unit: "g" },
      { name: "unsalted butter, softened", quantity: 3, unit: "tbsp" },
      { name: "canned whole tomatoes", quantity: 800, unit: "g" },
      { name: "yellow onion, diced", quantity: 1, unit: "pcs" },
      { name: "garlic cloves, minced", quantity: 2, unit: "pcs" },
      { name: "vegetable broth", quantity: 500, unit: "ml" },
      { name: "heavy cream", quantity: 100, unit: "ml" },
      { name: "fresh basil leaves", quantity: 8, unit: "pcs" },
      { name: "sugar", quantity: 1, unit: "tsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "black pepper", quantity: 0.5, unit: "tsp" },
    ],
    instructions: [
      "For the soup: In a large pot, melt 1 tablespoon of butter over medium heat. Saute the onion until soft, about 5 minutes. Add garlic and cook for 1 minute.",
      "Add the canned tomatoes with their juices, vegetable broth, sugar, salt, and pepper. Bring to a boil, then reduce heat and simmer for 15 minutes.",
      "Use an immersion blender to puree the soup until completely smooth. Stir in the heavy cream and half the basil. Keep warm over low heat.",
      "For the sandwiches: Butter one side of each bread slice. Layer cheddar and gruyere on the unbuttered sides of two slices, then top with remaining bread, buttered side up.",
      "Heat a skillet over medium-low heat. Cook each sandwich for 3-4 minutes per side until the bread is golden and the cheese is fully melted.",
      "Cut sandwiches diagonally and serve alongside bowls of hot tomato soup, garnished with fresh basil.",
    ],
  },
  {
    title: "Classic Club Sandwich",
    description:
      "A triple-decker masterpiece with roasted turkey, crispy bacon, fresh lettuce, and tomato layered between toasted bread.",
    categoryName: "American",
    authorEmail: "gordon@recipes.app",
    difficulty: "easy",
    cookingTime: 15,
    servings: 1,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1553909489-cd47e3b4430f?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "white bread slices, toasted", quantity: 3, unit: "pcs" },
      { name: "roasted turkey breast, sliced", quantity: 150, unit: "g" },
      { name: "bacon slices, cooked crisp", quantity: 3, unit: "pcs" },
      { name: "lettuce leaves", quantity: 2, unit: "pcs" },
      { name: "tomato slices", quantity: 2, unit: "pcs" },
      { name: "mayonnaise", quantity: 2, unit: "tbsp" },
      { name: "Dijon mustard", quantity: 1, unit: "tsp" },
      { name: "salt", quantity: 1, unit: "pinch" },
      { name: "black pepper", quantity: 1, unit: "pinch" },
    ],
    instructions: [
      "Toast all three bread slices until golden and crisp. Let cool slightly.",
      "Mix mayonnaise with Dijon mustard in a small bowl.",
      "Spread the mayo mixture on one side of each bread slice.",
      "Build the first layer: Place one slice of bread on a plate, mayo side up. Add lettuce, half the turkey, and a slice of tomato. Season with salt and pepper.",
      "Add the second slice of bread, mayo side down. Layer the remaining turkey, bacon, and the second tomato slice. Season again.",
      "Top with the final slice of bread, mayo side down. Press gently and secure with four cocktail picks. Cut into four triangles and serve with potato chips or a pickle.",
    ],
  },
  {
    title: "Spaghetti Carbonara",
    description:
      "A Roman classic made with eggs, pecorino romano, pancetta, and plenty of black pepper. No cream needed.",
    categoryName: "Italian",
    authorEmail: "mario@recipes.app",
    difficulty: "medium",
    cookingTime: 25,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "spaghetti", quantity: 400, unit: "g" },
      { name: "pancetta, diced", quantity: 200, unit: "g" },
      { name: "large eggs", quantity: 4, unit: "pcs" },
      { name: "pecorino romano, finely grated", quantity: 100, unit: "g" },
      { name: "parmesan, finely grated", quantity: 50, unit: "g" },
      { name: "black pepper, freshly cracked", quantity: 2, unit: "tsp" },
      { name: "salt", quantity: 1, unit: "tbsp" },
    ],
    instructions: [
      "Bring a large pot of water to a boil. Add the salt and cook the spaghetti according to package directions until al dente. Reserve 250ml of pasta water before draining.",
      "While the pasta cooks, heat a large skillet over medium heat. Add the pancetta and cook until crispy and the fat has rendered, about 5-7 minutes. Remove from heat.",
      "In a bowl, whisk together the eggs, pecorino romano, parmesan, and a generous amount of black pepper until well combined.",
      "Add the hot drained spaghetti directly into the skillet with the pancetta. Toss quickly to coat the pasta in the rendered fat.",
      "Working quickly, pour the egg and cheese mixture over the pasta, tossing constantly. Add splashes of reserved pasta water to create a silky, creamy sauce that clings to the noodles.",
      "The residual heat will cook the eggs gently without scrambling them. Serve immediately in warm bowls with extra pecorino and black pepper on top.",
    ],
  },
  {
    title: "Grilled Salmon with Lemon Butter",
    description:
      "Perfectly grilled salmon fillets basted in a garlicky lemon butter sauce, served with fresh dill.",
    categoryName: "American",
    authorEmail: "julia@recipes.app",
    difficulty: "medium",
    cookingTime: 25,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "salmon fillets, skin-on", quantity: 4, unit: "pcs" },
      { name: "unsalted butter", quantity: 100, unit: "g" },
      { name: "lemons", quantity: 2, unit: "pcs" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs" },
      { name: "fresh dill, chopped", quantity: 2, unit: "tbsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "black pepper", quantity: 0.5, unit: "tsp" },
      { name: "olive oil", quantity: 1, unit: "tbsp" },
    ],
    instructions: [
      "Remove the salmon from the refrigerator 15 minutes before cooking. Pat dry with paper towels and season both sides with salt and pepper.",
      "Zest one lemon and juice both. In a small saucepan, melt 50g of butter over medium heat. Add the garlic and cook for 1 minute until fragrant. Stir in lemon juice, zest, and half the dill. Keep warm.",
      "Heat a grill pan or heavy skillet over medium-high heat. Brush with olive oil. Place the salmon skin-side up and cook for 4 minutes until golden.",
      "Flip the salmon and cook for another 3-4 minutes, basting with the lemon butter sauce, until the fish flakes easily with a fork.",
      "Transfer the salmon to plates, drizzle generously with the remaining lemon butter sauce, and garnish with fresh dill and lemon slices.",
    ],
  },
  {
    title: "Beef Tacos with Fresh Salsa",
    description:
      "Seasoned ground beef in crispy taco shells topped with homemade salsa, cheese, lettuce, and sour cream.",
    categoryName: "Mexican",
    authorEmail: "gordon@recipes.app",
    difficulty: "easy",
    cookingTime: 30,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "ground beef", quantity: 500, unit: "g" },
      { name: "taco shells", quantity: 12, unit: "pcs" },
      { name: "yellow onion, diced", quantity: 1, unit: "pcs" },
      { name: "garlic cloves, minced", quantity: 2, unit: "pcs" },
      { name: "ground cumin", quantity: 1, unit: "tbsp" },
      { name: "chili powder", quantity: 1, unit: "tbsp" },
      { name: "smoked paprika", quantity: 1, unit: "tsp" },
      { name: "tomato salsa", quantity: 200, unit: "g" },
      { name: "shredded cheddar cheese", quantity: 150, unit: "g" },
      { name: "iceberg lettuce, shredded", quantity: 2, unit: "cups" },
      { name: "sour cream", quantity: 120, unit: "g" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "vegetable oil", quantity: 1, unit: "tbsp" },
    ],
    instructions: [
      "Heat the vegetable oil in a large skillet over medium-high heat. Add the onion and cook for 3 minutes until softened.",
      "Add the garlic and cook for 30 seconds. Add the ground beef, breaking it up with a wooden spoon. Cook until browned, about 5 minutes.",
      "Drain excess fat if needed. Stir in cumin, chili powder, paprika, and salt. Add 60ml of water and simmer for 5 minutes until the mixture thickens slightly.",
      "Warm the taco shells according to package instructions.",
      "Assemble the tacos: Fill each shell with seasoned beef, then top with lettuce, salsa, shredded cheese, and a dollop of sour cream.",
      "Serve immediately with lime wedges and extra salsa on the side.",
    ],
  },
  {
    title: "Chicken Stir Fry with Vegetables",
    description:
      "Quick and colorful stir fry with tender chicken, crisp vegetables, and a savory soy-sesame sauce over rice.",
    categoryName: "Asian",
    authorEmail: "alice@recipes.app",
    difficulty: "easy",
    cookingTime: 20,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "chicken breast, sliced", quantity: 500, unit: "g" },
      { name: "red bell pepper, sliced", quantity: 1, unit: "pcs" },
      { name: "broccoli florets", quantity: 200, unit: "g" },
      { name: "carrots, julienned", quantity: 2, unit: "pcs" },
      { name: "snap peas", quantity: 100, unit: "g" },
      { name: "garlic cloves, minced", quantity: 3, unit: "pcs" },
      { name: "fresh ginger, minced", quantity: 1, unit: "tbsp" },
      { name: "soy sauce", quantity: 3, unit: "tbsp" },
      { name: "sesame oil", quantity: 1, unit: "tbsp" },
      { name: "cornstarch", quantity: 1, unit: "tbsp" },
      { name: "vegetable oil", quantity: 2, unit: "tbsp" },
      { name: "cooked jasmine rice", quantity: 400, unit: "g" },
      { name: "sesame seeds", quantity: 1, unit: "tsp" },
    ],
    instructions: [
      "In a small bowl, whisk together soy sauce, sesame oil, cornstarch, and 2 tablespoons of water. Set aside.",
      "Heat 1 tablespoon of vegetable oil in a large wok or skillet over high heat until smoking. Add the chicken in a single layer and cook undisturbed for 2 minutes. Stir-fry for another 2 minutes until golden and nearly cooked through. Remove and set aside.",
      "Add the remaining oil to the wok. Add broccoli and carrots first, stir-frying for 2 minutes. Add bell pepper and snap peas, cook for 1 more minute.",
      "Add garlic and ginger, stir-fry for 30 seconds until fragrant.",
      "Return the chicken to the wok. Pour in the sauce and toss everything together for 1-2 minutes until the sauce thickens and coats everything glossy.",
      "Serve immediately over steamed jasmine rice, sprinkled with sesame seeds.",
    ],
  },
  {
    title: "Classic Beef Burger",
    description:
      "Juicy homemade beef patties with melted cheddar, fresh toppings, and a special sauce on toasted brioche buns.",
    categoryName: "American",
    authorEmail: "mario@recipes.app",
    difficulty: "medium",
    cookingTime: 35,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "ground beef, 80/20", quantity: 600, unit: "g" },
      { name: "brioche buns", quantity: 4, unit: "pcs" },
      { name: "cheddar cheese slices", quantity: 4, unit: "pcs" },
      { name: "lettuce leaves", quantity: 4, unit: "pcs" },
      { name: "tomato slices", quantity: 4, unit: "pcs" },
      { name: "red onion, sliced", quantity: 0.5, unit: "pcs" },
      { name: "dill pickle slices", quantity: 8, unit: "pcs" },
      { name: "mayonnaise", quantity: 3, unit: "tbsp" },
      { name: "ketchup", quantity: 2, unit: "tbsp" },
      { name: "Dijon mustard", quantity: 1, unit: "tsp" },
      { name: "Worcestershire sauce", quantity: 1, unit: "tsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "black pepper", quantity: 0.5, unit: "tsp" },
      { name: "vegetable oil", quantity: 1, unit: "tbsp" },
    ],
    instructions: [
      "Make the sauce: In a small bowl, mix mayonnaise, ketchup, Dijon mustard, and Worcestershire sauce. Refrigerate until needed.",
      "Gently form the ground beef into 4 equal patties, about 2cm thick. Make a slight indentation in the center of each to prevent bulging. Season both sides generously with salt and pepper.",
      "Heat a cast-iron skillet or grill pan over high heat. Brush with vegetable oil. Cook the patties for 3-4 minutes per side for medium doneness.",
      "In the last minute of cooking, place a slice of cheddar on each patty and cover the pan briefly to melt the cheese.",
      "Toast the brioche buns cut-side down on the pan for 30 seconds until golden.",
      "Assemble: Spread sauce on both bun halves. Layer lettuce, tomato, the beef patty, onion, and pickles. Top with the bun and serve immediately with fries.",
    ],
  },
  {
    title: "Homemade Margherita Pizza",
    description:
      "Authentic Neapolitan-style pizza with a chewy crust, San Marzano tomato sauce, fresh mozzarella, and basil.",
    categoryName: "Italian",
    authorEmail: "julia@recipes.app",
    difficulty: "medium",
    cookingTime: 60,
    servings: 2,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "pizza dough", quantity: 500, unit: "g" },
      { name: "fresh mozzarella, torn", quantity: 200, unit: "g" },
      { name: "canned San Marzano tomatoes", quantity: 200, unit: "g" },
      { name: "fresh basil leaves", quantity: 10, unit: "pcs" },
      { name: "extra virgin olive oil", quantity: 2, unit: "tbsp" },
      { name: "garlic clove, minced", quantity: 1, unit: "pcs" },
      { name: "salt", quantity: 0.5, unit: "tsp" },
      { name: "semolina flour, for dusting", quantity: 2, unit: "tbsp" },
    ],
    instructions: [
      "Preheat your oven to its highest setting, ideally 250C or higher. If you have a pizza stone or steel, place it in the oven to preheat for at least 30 minutes.",
      "Make the sauce: Crush the canned tomatoes by hand into a bowl. Add minced garlic, a pinch of salt, and 1 tablespoon of olive oil. Do not cook the sauce.",
      "On a floured surface, gently stretch the dough into a 30cm round. Work from the center outward, leaving a slightly thicker edge for the crust.",
      "Transfer the dough to a pizza peel or inverted baking sheet dusted with semolina flour.",
      "Spread a thin layer of tomato sauce over the dough, leaving a 2cm border. Distribute the torn mozzarella evenly. Drizzle with remaining olive oil.",
      "Slide the pizza onto the hot stone or baking sheet. Bake for 8-12 minutes until the crust is blistered and charred in spots and the cheese is bubbling. Remove, top with fresh basil, and serve immediately.",
    ],
  },
  {
    title: "Chicken Tikka Masala",
    description:
      "Tender chicken in a rich, creamy tomato sauce infused with aromatic Indian spices. Serve over basmati rice.",
    categoryName: "Asian",
    authorEmail: "gordon@recipes.app",
    difficulty: "hard",
    cookingTime: 50,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "chicken thighs, cubed", quantity: 800, unit: "g" },
      { name: "plain yogurt", quantity: 200, unit: "g" },
      { name: "tikka masala paste", quantity: 3, unit: "tbsp" },
      { name: "yellow onion, diced", quantity: 1, unit: "pcs" },
      { name: "garlic cloves, minced", quantity: 4, unit: "pcs" },
      { name: "fresh ginger, grated", quantity: 2, unit: "tbsp" },
      { name: "coconut milk", quantity: 400, unit: "ml" },
      { name: "canned tomatoes", quantity: 400, unit: "g" },
      { name: "garam masala", quantity: 1, unit: "tbsp" },
      { name: "ground cumin", quantity: 1, unit: "tsp" },
      { name: "ground coriander", quantity: 1, unit: "tsp" },
      { name: "turmeric", quantity: 0.5, unit: "tsp" },
      { name: "cayenne pepper", quantity: 0.5, unit: "tsp" },
      { name: "fresh cilantro, chopped", quantity: 3, unit: "tbsp" },
      { name: "vegetable oil", quantity: 2, unit: "tbsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "cooked basmati rice", quantity: 400, unit: "g" },
    ],
    instructions: [
      "Marinate the chicken: In a bowl, combine the chicken with yogurt and 1 tablespoon of tikka masala paste. Mix well, cover, and refrigerate for at least 30 minutes or up to 4 hours.",
      "Heat 1 tablespoon of oil in a large skillet over high heat. Add the marinated chicken in batches and sear until browned on all sides, about 5 minutes. Remove and set aside.",
      "In the same pan, add the remaining oil. Saute the onion over medium heat for 5 minutes until soft and golden. Add garlic and ginger, cook for 1 minute.",
      "Add the remaining tikka masala paste, garam masala, cumin, coriander, turmeric, and cayenne. Stir for 1 minute to toast the spices.",
      "Pour in the canned tomatoes and coconut milk. Bring to a simmer, then add the seared chicken back to the pan. Cover and simmer for 20 minutes, stirring occasionally.",
      "Season with salt to taste. Stir in half the cilantro. Serve over steamed basmati rice, garnished with remaining cilantro and a drizzle of coconut milk.",
    ],
  },
  {
    title: "Beef Wellington",
    description:
      "An impressive showstopper: beef tenderloin coated in mushroom duxelles and prosciutto, wrapped in golden puff pastry.",
    categoryName: "French",
    authorEmail: "alice@recipes.app",
    difficulty: "hard",
    cookingTime: 90,
    servings: 6,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "beef tenderloin", quantity: 1, unit: "kg" },
      { name: "puff pastry", quantity: 500, unit: "g" },
      { name: "mushroom duxelles", quantity: 300, unit: "g" },
      { name: "prosciutto slices", quantity: 12, unit: "pcs" },
      { name: "Dijon mustard", quantity: 2, unit: "tbsp" },
      { name: "egg, beaten", quantity: 1, unit: "pcs" },
      { name: "fresh thyme", quantity: 4, unit: "sprigs" },
      { name: "salt", quantity: 2, unit: "tsp" },
      { name: "black pepper", quantity: 1, unit: "tsp" },
      { name: "vegetable oil", quantity: 2, unit: "tbsp" },
      { name: "butter", quantity: 1, unit: "tbsp" },
    ],
    instructions: [
      "Tie the tenderloin with kitchen twine to maintain its shape. Season generously with salt and pepper.",
      "Heat oil in a large skillet over high heat. Sear the beef on all sides until deeply browned, about 2 minutes per side. Remove from heat, brush with Dijon mustard, and let cool completely.",
      "Lay out a large piece of plastic wrap. Arrange the prosciutto slices in a rectangle slightly larger than the tenderloin, overlapping slightly. Spread the mushroom duxelles evenly over the prosciutto.",
      "Place the cooled beef at the bottom edge of the prosciutto rectangle. Using the plastic wrap, roll the prosciutto and mushrooms tightly around the beef. Twist the ends of the plastic wrap to seal and refrigerate for 15 minutes.",
      "Roll out the puff pastry on a floured surface. Unwrap the beef and place it on the pastry. Roll the pastry around the beef, sealing the seam with egg wash. Trim excess pastry and tuck the ends under.",
      "Place the Wellington seam-side down on a baking sheet lined with parchment. Brush the entire surface with egg wash and score a decorative pattern with a knife. Refrigerate for 15 minutes.",
      "Preheat the oven to 200C. Bake the Wellington for 25-30 minutes until the pastry is deep golden brown. Rest for 10 minutes before slicing thickly and serving.",
    ],
  },
  {
    title: "Chocolate Lava Cake",
    description:
      "Decadent individual chocolate cakes with a molten, gooey center that flows out like lava when cut.",
    categoryName: "Desserts",
    authorEmail: "mario@recipes.app",
    difficulty: "medium",
    cookingTime: 30,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "dark chocolate, 70%", quantity: 200, unit: "g" },
      { name: "unsalted butter", quantity: 100, unit: "g" },
      { name: "granulated sugar", quantity: 100, unit: "g" },
      { name: "large eggs", quantity: 3, unit: "pcs" },
      { name: "all-purpose flour", quantity: 50, unit: "g" },
      { name: "cocoa powder", quantity: 1, unit: "tbsp" },
      { name: "vanilla extract", quantity: 1, unit: "tsp" },
      { name: "salt", quantity: 1, unit: "pinch" },
      { name: "butter, for greasing", quantity: 1, unit: "tbsp" },
      { name: "cocoa powder, for dusting", quantity: 1, unit: "tbsp" },
    ],
    instructions: [
      "Preheat the oven to 200C. Generously butter four 200ml ramekins and dust with cocoa powder, tapping out the excess.",
      "Chop the dark chocolate into small pieces. In a heatproof bowl set over simmering water, melt the chocolate and butter together, stirring until smooth. Remove from heat and let cool slightly.",
      "Whisk the eggs and sugar together in a large bowl until pale and slightly thickened, about 2 minutes. Whisk in the vanilla extract.",
      "Fold the melted chocolate mixture into the eggs until combined. Sift the flour, cocoa powder, and salt over the mixture and fold gently until just combined.",
      "Divide the batter evenly among the prepared ramekins. Place on a baking sheet.",
      "Bake for 12 minutes. The edges should be set and the center should still be slightly jiggly. Remove from the oven and let rest for 1 minute.",
      "Run a knife around the edge of each ramekin, then invert onto serving plates. Dust with powdered sugar and serve immediately with vanilla ice cream.",
    ],
  },
  {
    title: "Classic Tiramisu",
    description:
      "An Italian no-bake dessert of coffee-soaked ladyfingers layered with rich mascarpone cream and dusted with cocoa.",
    categoryName: "Desserts",
    authorEmail: "julia@recipes.app",
    difficulty: "hard",
    cookingTime: 40,
    servings: 8,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "mascarpone cheese", quantity: 500, unit: "g" },
      { name: "large eggs, separated", quantity: 6, unit: "pcs" },
      { name: "granulated sugar", quantity: 150, unit: "g" },
      { name: "strong espresso, cooled", quantity: 300, unit: "ml" },
      { name: "ladyfingers", quantity: 200, unit: "g" },
      { name: "Marsala wine", quantity: 3, unit: "tbsp" },
      { name: "unsweetened cocoa powder", quantity: 2, unit: "tbsp" },
      { name: "salt", quantity: 1, unit: "pinch" },
    ],
    instructions: [
      "In a large bowl, beat the egg yolks and 100g of sugar with an electric mixer until pale, thick, and creamy, about 3 minutes. Add the mascarpone and Marsala wine, then beat until smooth and fully combined.",
      "In a separate clean bowl, whip the egg whites with a pinch of salt until soft peaks form. Gradually add the remaining 50g of sugar and whip until stiff, glossy peaks form.",
      "Gently fold one-third of the whipped egg whites into the mascarpone mixture to lighten it, then fold in the remaining whites until no streaks remain.",
      "Combine the cooled espresso with 1 tablespoon of Marsala wine in a shallow dish. Quickly dip each ladyfinger into the coffee mixture for 1-2 seconds per side. Do not soak them or they will fall apart.",
      "Arrange a layer of dipped ladyfingers in the bottom of a 20x30cm serving dish. Spread half the mascarpone cream evenly over the ladyfingers.",
      "Add a second layer of dipped ladyfingers, then spread the remaining cream on top. Smooth the surface with a spatula.",
      "Cover with plastic wrap and refrigerate for at least 4 hours, preferably overnight. Dust generously with cocoa powder just before serving.",
    ],
  },
  {
    title: "Apple Pie with Vanilla Ice Cream",
    description:
      "A flaky, buttery double-crust pie filled with spiced apples and served warm with a scoop of vanilla ice cream.",
    categoryName: "Desserts",
    authorEmail: "gordon@recipes.app",
    difficulty: "hard",
    cookingTime: 90,
    servings: 8,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "Granny Smith apples", quantity: 6, unit: "pcs" },
      { name: "all-purpose flour", quantity: 300, unit: "g" },
      { name: "unsalted butter, cold and cubed", quantity: 200, unit: "g" },
      { name: "granulated sugar", quantity: 100, unit: "g" },
      { name: "brown sugar", quantity: 50, unit: "g" },
      { name: "ground cinnamon", quantity: 1, unit: "tsp" },
      { name: "ground nutmeg", quantity: 0.5, unit: "tsp" },
      { name: "lemon juice", quantity: 1, unit: "tbsp" },
      { name: "egg, beaten", quantity: 1, unit: "pcs" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "ice water", quantity: 60, unit: "ml" },
      { name: "vanilla ice cream", quantity: 500, unit: "g" },
    ],
    instructions: [
      "Make the crust: In a food processor, pulse the flour and salt. Add the cold butter and pulse until the mixture resembles coarse crumbs with some pea-sized pieces. Drizzle in ice water and pulse until the dough just comes together. Divide in half, shape into disks, wrap, and refrigerate for at least 1 hour.",
      "Prepare the filling: Peel, core, and slice the apples into 5mm slices. In a large bowl, toss the apples with both sugars, cinnamon, nutmeg, lemon juice, and a pinch of salt. Let sit for 15 minutes.",
      "Preheat the oven to 190C. Roll out one disk of dough on a floured surface to a 30cm circle. Transfer to a 23cm pie dish, pressing gently into the bottom and sides.",
      "Drain any excess liquid from the apples. Pile the apple filling into the crust, mounding slightly in the center. Dot with small pieces of butter.",
      "Roll out the second disk of dough. Place it over the filling. Trim the overhang to 2cm, then fold and crimp the edges. Cut several steam vents in the top.",
      "Brush the top crust with beaten egg and sprinkle with a little sugar. Bake for 50-60 minutes until the crust is golden brown and the filling is bubbling. If the edges brown too quickly, cover with foil.",
      "Let the pie cool for at least 2 hours before slicing. Serve warm with a generous scoop of vanilla ice cream.",
    ],
  },
  {
    title: "Chocolate Chip Cookies",
    description:
      "Chewy in the center, crisp on the edges, and loaded with melted chocolate chips. The perfect cookie.",
    categoryName: "Desserts",
    authorEmail: "alice@recipes.app",
    difficulty: "easy",
    cookingTime: 25,
    servings: 24,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1499636138143-bd649043ea52?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "all-purpose flour", quantity: 280, unit: "g" },
      { name: "unsalted butter, softened", quantity: 225, unit: "g" },
      { name: "granulated sugar", quantity: 150, unit: "g" },
      { name: "brown sugar", quantity: 100, unit: "g" },
      { name: "large eggs", quantity: 2, unit: "pcs" },
      { name: "vanilla extract", quantity: 2, unit: "tsp" },
      { name: "baking soda", quantity: 1, unit: "tsp" },
      { name: "salt", quantity: 1, unit: "tsp" },
      { name: "semisweet chocolate chips", quantity: 300, unit: "g" },
    ],
    instructions: [
      "Preheat the oven to 190C. Line two baking sheets with parchment paper.",
      "In a large bowl, beat the softened butter, granulated sugar, and brown sugar together with an electric mixer until light and fluffy, about 3 minutes.",
      "Add the eggs one at a time, beating well after each addition. Stir in the vanilla extract.",
      "In a separate bowl, whisk together the flour, baking soda, and salt. Gradually add the dry ingredients to the wet mixture, mixing on low speed until just combined.",
      "Fold in the chocolate chips with a wooden spoon. Do not overmix.",
      "Drop rounded tablespoons of dough onto the prepared baking sheets, spacing them 5cm apart. Bake for 10-12 minutes until the edges are golden but the centers still look slightly underdone.",
      "Let the cookies cool on the baking sheet for 5 minutes, then transfer to a wire rack to cool completely. Store in an airtight container for up to 5 days.",
    ],
  },
  {
    title: "Guacamole with Tortilla Chips",
    description:
      "Creamy, chunky guacamole made with ripe avocados, fresh lime, and cilantro. Perfect for dipping or topping.",
    categoryName: "Appetizers",
    authorEmail: "mario@recipes.app",
    difficulty: "easy",
    cookingTime: 10,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "ripe avocados", quantity: 3, unit: "pcs" },
      { name: "lime, juiced", quantity: 1, unit: "pcs" },
      { name: "small red onion, finely diced", quantity: 1, unit: "pcs" },
      { name: "roma tomatoes, diced", quantity: 2, unit: "pcs" },
      { name: "jalapeno, seeded and minced", quantity: 1, unit: "pcs" },
      { name: "fresh cilantro, chopped", quantity: 3, unit: "tbsp" },
      { name: "garlic clove, minced", quantity: 1, unit: "pcs" },
      { name: "salt", quantity: 0.75, unit: "tsp" },
      { name: "black pepper", quantity: 0.25, unit: "tsp" },
      { name: "tortilla chips", quantity: 200, unit: "g" },
    ],
    instructions: [
      "Cut the avocados in half, remove the pits, and scoop the flesh into a large bowl.",
      "Add the lime juice immediately to prevent browning. Using a fork, mash the avocados to your desired consistency, some like it chunky, others smooth.",
      "Fold in the diced onion, tomatoes, jalapeno, cilantro, and garlic. Season with salt and pepper.",
      "Taste and adjust seasoning. If needed, add more lime juice or salt.",
      "Transfer to a serving bowl and serve immediately with tortilla chips. Press plastic wrap directly onto the surface if storing to minimize browning.",
    ],
  },
  {
    title: "Bruschetta with Tomato & Basil",
    description:
      "Crispy grilled bread rubbed with garlic, topped with fresh tomatoes, basil, and a drizzle of balsamic glaze.",
    categoryName: "Appetizers",
    authorEmail: "julia@recipes.app",
    difficulty: "easy",
    cookingTime: 15,
    servings: 4,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1572695157363-bc31c5dd3c8b?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "baguette, sliced", quantity: 1, unit: "pcs" },
      { name: "ripe tomatoes, diced", quantity: 4, unit: "pcs" },
      { name: "fresh basil, torn", quantity: 10, unit: "pcs" },
      { name: "garlic cloves, halved", quantity: 2, unit: "pcs" },
      { name: "extra virgin olive oil", quantity: 3, unit: "tbsp" },
      { name: "balsamic glaze", quantity: 1, unit: "tbsp" },
      { name: "salt", quantity: 0.5, unit: "tsp" },
      { name: "black pepper", quantity: 0.25, unit: "tsp" },
    ],
    instructions: [
      "Preheat a grill pan or broiler to high heat.",
      "In a bowl, combine the diced tomatoes, torn basil, 2 tablespoons of olive oil, salt, and pepper. Let sit for 5 minutes to allow the flavors to meld.",
      "Brush both sides of the baguette slices with the remaining olive oil. Grill or broil for 1-2 minutes per side until golden and crisp.",
      "While the bread is still warm, rub one side of each slice with the cut side of a garlic clove.",
      "Spoon the tomato mixture generously over the grilled bread. Drizzle with balsamic glaze and serve immediately.",
    ],
  },
  {
    title: "Classic Mojito",
    description:
      "A refreshing Cuban cocktail of white rum, fresh mint, lime, and soda water. Perfect for warm afternoons.",
    categoryName: "Beverages",
    authorEmail: "alice@recipes.app",
    difficulty: "easy",
    cookingTime: 5,
    servings: 1,
    isPublic: true,
    image: {
      url: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&h=600&fit=crop",
    },
    ingredients: [
      { name: "fresh mint leaves", quantity: 10, unit: "pcs" },
      { name: "lime, cut into wedges", quantity: 0.5, unit: "pcs" },
      { name: "granulated sugar", quantity: 2, unit: "tsp" },
      { name: "white rum", quantity: 60, unit: "ml" },
      { name: "soda water", quantity: 120, unit: "ml" },
      { name: "crushed ice", quantity: 1, unit: "cup" },
      { name: "mint sprig, for garnish", quantity: 1, unit: "pcs" },
    ],
    instructions: [
      "Place the mint leaves and 1 lime wedge into a sturdy highball glass.",
      "Use a muddler or the back of a spoon to gently bruise the mint and release its oils. Do not shred the leaves.",
      "Add the sugar and two more lime wedges, then muddle again gently to release the lime juice.",
      "Fill the glass with crushed ice. Pour in the white rum and top with soda water.",
      "Stir well with a bar spoon to mix the sugar and distribute the mint. Garnish with a fresh mint sprig and a lime wedge. Serve with a straw.",
    ],
  },
];

export const seedComments: SeedComment[] = [
  {
    text: "These pancakes are absolutely fluffy and delicious! My whole family devoured them.",
    recipeTitle: "Classic American Pancakes",
    authorEmail: "gordon@recipes.app",
  },
  {
    text: "Perfect Sunday breakfast recipe. My kids keep asking for these every weekend.",
    recipeTitle: "Classic American Pancakes",
    authorEmail: "julia@recipes.app",
  },
  {
    text: "Simple but elegant. The poached egg technique works like a charm every time.",
    recipeTitle: "Avocado Toast with Poached Egg",
    authorEmail: "alice@recipes.app",
  },
  {
    text: "The hollandaise sauce is tricky but absolutely worth the effort. Restaurant quality!",
    recipeTitle: "Eggs Benedict",
    authorEmail: "mario@recipes.app",
  },
  {
    text: "Best Caesar salad I've ever made at home. The homemade croutons make a huge difference.",
    recipeTitle: "Chicken Caesar Salad",
    authorEmail: "gordon@recipes.app",
  },
  {
    text: "Classic comfort food at its finest. The tomato soup is velvety smooth.",
    recipeTitle: "Grilled Cheese & Tomato Soup",
    authorEmail: "julia@recipes.app",
  },
  {
    text: "Layering the ingredients properly is the key to a perfect club sandwich. Great tips!",
    recipeTitle: "Classic Club Sandwich",
    authorEmail: "alice@recipes.app",
  },
  {
    text: "Authentic carbonara — no cream needed! This is exactly how it's done in Rome.",
    recipeTitle: "Spaghetti Carbonara",
    authorEmail: "gordon@recipes.app",
  },
  {
    text: "The salmon was perfectly cooked. The lemon butter sauce is simply divine.",
    recipeTitle: "Grilled Salmon with Lemon Butter",
    authorEmail: "mario@recipes.app",
  },
  {
    text: "Great weeknight dinner option. The whole family enjoyed building their own tacos.",
    recipeTitle: "Beef Tacos with Fresh Salsa",
    authorEmail: "julia@recipes.app",
  },
  {
    text: "Quick, healthy, and packed with flavor. I added extra ginger and it was amazing.",
    recipeTitle: "Chicken Stir Fry with Vegetables",
    authorEmail: "alice@recipes.app",
  },
  {
    text: "Juicy burger with the perfect cheese melt. The special sauce is a game changer.",
    recipeTitle: "Classic Beef Burger",
    authorEmail: "gordon@recipes.app",
  },
  {
    text: "Homemade pizza beats delivery every single time. The crust was perfectly chewy.",
    recipeTitle: "Homemade Margherita Pizza",
    authorEmail: "mario@recipes.app",
  },
  {
    text: "Restaurant quality tikka masala made right in my own kitchen. Incredible depth of flavor.",
    recipeTitle: "Chicken Tikka Masala",
    authorEmail: "julia@recipes.app",
  },
  {
    text: "A real showstopper. Took some time but the result was absolutely worth it for our dinner party.",
    recipeTitle: "Beef Wellington",
    authorEmail: "gordon@recipes.app",
  },
  {
    text: "The lava cake was molten perfection. My guests were completely impressed.",
    recipeTitle: "Chocolate Lava Cake",
    authorEmail: "alice@recipes.app",
  },
  {
    text: "Best tiramisu recipe I've tried. Letting it rest overnight is definitely the secret.",
    recipeTitle: "Classic Tiramisu",
    authorEmail: "mario@recipes.app",
  },
  {
    text: "The crust was flaky and buttery, exactly as described. A new holiday tradition!",
    recipeTitle: "Apple Pie with Vanilla Ice Cream",
    authorEmail: "julia@recipes.app",
  },
  {
    text: "Chewy centers, crispy edges, and so much chocolate. These are my go-to cookie recipe now.",
    recipeTitle: "Chocolate Chip Cookies",
    authorEmail: "gordon@recipes.app",
  },
  {
    text: "So fresh and flavorful. The jalapeno adds just the right amount of kick.",
    recipeTitle: "Guacamole with Tortilla Chips",
    authorEmail: "alice@recipes.app",
  },
  {
    text: "Crispy, garlicky, and bursting with summer flavors. Perfect starter for any meal.",
    recipeTitle: "Bruschetta with Tomato & Basil",
    authorEmail: "mario@recipes.app",
  },
  {
    text: "Refreshing and perfectly balanced. The muddling technique makes all the difference.",
    recipeTitle: "Classic Mojito",
    authorEmail: "julia@recipes.app",
  },
];

export const seedRatings: SeedRating[] = [
  {
    recipeTitle: "Classic American Pancakes",
    userEmail: "julia@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Classic American Pancakes",
    userEmail: "gordon@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Classic American Pancakes",
    userEmail: "alice@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Avocado Toast with Poached Egg",
    userEmail: "mario@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Avocado Toast with Poached Egg",
    userEmail: "gordon@recipes.app",
    value: 4,
  },
  { recipeTitle: "Eggs Benedict", userEmail: "julia@recipes.app", value: 5 },
  { recipeTitle: "Eggs Benedict", userEmail: "alice@recipes.app", value: 4 },
  { recipeTitle: "French Omelette", userEmail: "mario@recipes.app", value: 5 },
  { recipeTitle: "French Omelette", userEmail: "gordon@recipes.app", value: 5 },
  {
    recipeTitle: "Chicken Caesar Salad",
    userEmail: "mario@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Chicken Caesar Salad",
    userEmail: "julia@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Chicken Caesar Salad",
    userEmail: "alice@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Grilled Cheese & Tomato Soup",
    userEmail: "mario@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Grilled Cheese & Tomato Soup",
    userEmail: "gordon@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Classic Club Sandwich",
    userEmail: "julia@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Classic Club Sandwich",
    userEmail: "alice@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Spaghetti Carbonara",
    userEmail: "julia@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Spaghetti Carbonara",
    userEmail: "gordon@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Spaghetti Carbonara",
    userEmail: "alice@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Grilled Salmon with Lemon Butter",
    userEmail: "mario@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Grilled Salmon with Lemon Butter",
    userEmail: "gordon@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Beef Tacos with Fresh Salsa",
    userEmail: "mario@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Beef Tacos with Fresh Salsa",
    userEmail: "alice@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Chicken Stir Fry with Vegetables",
    userEmail: "mario@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Chicken Stir Fry with Vegetables",
    userEmail: "julia@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Chicken Stir Fry with Vegetables",
    userEmail: "gordon@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Classic Beef Burger",
    userEmail: "julia@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Classic Beef Burger",
    userEmail: "alice@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Homemade Margherita Pizza",
    userEmail: "gordon@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Homemade Margherita Pizza",
    userEmail: "alice@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Chicken Tikka Masala",
    userEmail: "mario@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Chicken Tikka Masala",
    userEmail: "alice@recipes.app",
    value: 5,
  },
  { recipeTitle: "Beef Wellington", userEmail: "mario@recipes.app", value: 5 },
  { recipeTitle: "Beef Wellington", userEmail: "julia@recipes.app", value: 4 },
  {
    recipeTitle: "Chocolate Lava Cake",
    userEmail: "mario@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Chocolate Lava Cake",
    userEmail: "julia@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Chocolate Lava Cake",
    userEmail: "gordon@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Classic Tiramisu",
    userEmail: "gordon@recipes.app",
    value: 5,
  },
  { recipeTitle: "Classic Tiramisu", userEmail: "alice@recipes.app", value: 5 },
  {
    recipeTitle: "Apple Pie with Vanilla Ice Cream",
    userEmail: "mario@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Apple Pie with Vanilla Ice Cream",
    userEmail: "alice@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Chocolate Chip Cookies",
    userEmail: "julia@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Chocolate Chip Cookies",
    userEmail: "alice@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Guacamole with Tortilla Chips",
    userEmail: "mario@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Guacamole with Tortilla Chips",
    userEmail: "gordon@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Guacamole with Tortilla Chips",
    userEmail: "julia@recipes.app",
    value: 4,
  },
  {
    recipeTitle: "Bruschetta with Tomato & Basil",
    userEmail: "gordon@recipes.app",
    value: 5,
  },
  {
    recipeTitle: "Bruschetta with Tomato & Basil",
    userEmail: "alice@recipes.app",
    value: 5,
  },
  { recipeTitle: "Classic Mojito", userEmail: "mario@recipes.app", value: 5 },
  { recipeTitle: "Classic Mojito", userEmail: "gordon@recipes.app", value: 4 },
  { recipeTitle: "Classic Mojito", userEmail: "alice@recipes.app", value: 5 },
];

export const seedFavorites: SeedFavorite[] = [
  { userEmail: "mario@recipes.app", recipeTitle: "Classic American Pancakes" },
  { userEmail: "mario@recipes.app", recipeTitle: "Spaghetti Carbonara" },
  { userEmail: "mario@recipes.app", recipeTitle: "Classic Beef Burger" },
  { userEmail: "mario@recipes.app", recipeTitle: "Homemade Margherita Pizza" },
  { userEmail: "mario@recipes.app", recipeTitle: "Chocolate Lava Cake" },
  { userEmail: "mario@recipes.app", recipeTitle: "Chicken Tikka Masala" },
  { userEmail: "julia@recipes.app", recipeTitle: "Classic American Pancakes" },
  { userEmail: "julia@recipes.app", recipeTitle: "Chicken Caesar Salad" },
  {
    userEmail: "julia@recipes.app",
    recipeTitle: "Grilled Cheese & Tomato Soup",
  },
  {
    userEmail: "julia@recipes.app",
    recipeTitle: "Beef Tacos with Fresh Salsa",
  },
  { userEmail: "julia@recipes.app", recipeTitle: "Classic Tiramisu" },
  { userEmail: "gordon@recipes.app", recipeTitle: "Eggs Benedict" },
  { userEmail: "gordon@recipes.app", recipeTitle: "Spaghetti Carbonara" },
  {
    userEmail: "gordon@recipes.app",
    recipeTitle: "Grilled Salmon with Lemon Butter",
  },
  { userEmail: "gordon@recipes.app", recipeTitle: "Beef Wellington" },
  { userEmail: "gordon@recipes.app", recipeTitle: "Classic Tiramisu" },
  {
    userEmail: "gordon@recipes.app",
    recipeTitle: "Bruschetta with Tomato & Basil",
  },
  {
    userEmail: "alice@recipes.app",
    recipeTitle: "Avocado Toast with Poached Egg",
  },
  {
    userEmail: "alice@recipes.app",
    recipeTitle: "Chicken Stir Fry with Vegetables",
  },
  {
    userEmail: "alice@recipes.app",
    recipeTitle: "Apple Pie with Vanilla Ice Cream",
  },
  {
    userEmail: "alice@recipes.app",
    recipeTitle: "Guacamole with Tortilla Chips",
  },
  { userEmail: "alice@recipes.app", recipeTitle: "Classic Mojito" },
  { userEmail: "alice@recipes.app", recipeTitle: "Chocolate Chip Cookies" },
];

export const seedReviews: SeedReview[] = [
  {
    authorEmail: "mario@recipes.app",
    text: "Amazing recipe platform! I love the incredible variety of dishes from all around the world. The instructions are always clear and the results are consistently delicious.",
    rating: 5,
    isFeatured: true,
  },
  {
    authorEmail: "julia@recipes.app",
    text: "Beautifully designed and so easy to follow. The ingredient lists are well-organized and the step-by-step format makes even complex recipes feel approachable.",
    rating: 5,
    isFeatured: true,
  },
  {
    authorEmail: "gordon@recipes.app",
    text: "Great selection of recipes, but I would love to see more advanced techniques and professional-level content. The fundamentals are solid though.",
    rating: 4,
    isFeatured: false,
  },
  {
    authorEmail: "alice@recipes.app",
    text: "A wonderful community for home cooks. I have discovered so many new favorite recipes here. The emphasis on fresh, seasonal ingredients really resonates with me.",
    rating: 5,
    isFeatured: true,
  },
];
