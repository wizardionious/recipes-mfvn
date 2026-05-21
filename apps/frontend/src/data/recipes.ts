import type { Minutes } from "@recipes/shared";
import type { RecipeInput } from "@/utils/addRecipeSlugs";
import { addRecipeSlugs } from "@/utils/addRecipeSlugs";

const rawRecipes: RecipeInput[] = [
  {
    id: "507f1f77bcf86cd799439001",
    title: "Хлеб, масло и идеальный кофе",
    description:
      "Простой, уютный завтрак с хлебом, маслом и кофе. Идеально подходит для медитативного раннего утра.",
    ingredients: [
      { name: "Хлеб", quantity: 2, unit: "куска" },
      { name: "Масло сливочное", quantity: 20, unit: "г" },
      { name: "Кофе молотый", quantity: 15, unit: "г" },
      { name: "Вода", quantity: 200, unit: "мл" },
    ],
    instructions: [
      "Нарежьте хлеб ломтиками толщиной около 1 см.",
      "Намажьте каждый ломтик тонким слоем сливочного масла.",
      "Сварите кофе любимым способом (френч-пресс, пуровер или турка).",
      "Подавайте хлеб с маслом вместе с горячим кофе.",
    ],
    category: {
      id: "507f1f77bcf86cd799439010",
      name: "Завтраки",
      slug: "breakfasts",
      image: {
        url: "https://example.com/breakfasts.jpg",
        alt: "Завтраки",
      },
    },
    author: {
      id: "507f1f77bcf86cd799439011",
      name: "Андрей",
      email: "andrii@example.com",
    },
    difficulty: "easy",
    cookingTime: 15 as Minutes,
    servings: 1,
    isPublic: true,
    image: {
      url: "https://example.com/bread-butter-coffee.jpg",
      alt: "Хлеб с маслом и кофе",
    },
    isFavorited: false,
    userRating: null,
    averageRating: null,
    ratingCount: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const recipes = addRecipeSlugs(rawRecipes);