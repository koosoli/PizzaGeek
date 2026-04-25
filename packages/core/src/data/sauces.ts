import type { StyleSauceCollection } from "../domain/types";

export const SAUCE_SALT_WARNING = "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.";

export const STYLE_SAUCE_COLLECTIONS: StyleSauceCollection[] = [
  {
    "sourceStyleId": "neapolitan",
    "styleName": "Neapolitan",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "neapolitan-primary",
    "options": [
      {
        "id": "neapolitan-primary",
        "name": "AVPN Marinara",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "San Marzano tomatoes (DOP)",
            "amount": "400g",
            "note": "Whole, peeled"
          },
          {
            "item": "Sea salt",
            "amount": "To taste",
            "note": "Check if tomatoes contain salt first"
          },
          {
            "item": "Fresh basil leaves",
            "amount": "4-5 leaves",
            "note": "Torn, not chopped"
          },
          {
            "item": "Extra virgin olive oil",
            "amount": "Drizzle",
            "note": "High quality"
          }
        ],
        "instructions": [
          "Crush tomatoes by hand directly into a bowl - do not use a blender or food processor. You want texture, not puree.",
          "Add salt sparingly (taste your tomatoes first - many are pre-salted).",
          "Tear basil leaves and fold in gently.",
          "Drizzle with olive oil just before using.",
          "Use immediately or refrigerate up to 3 days. Do not cook."
        ],
        "proTip": "True Neapolitan sauce is raw. The 90-second bake in a 900°F oven \"cooks\" the sauce perfectly. Cooking it beforehand results in overcooked, dull flavor.",
        "source": "AVPN (Associazione Verace Pizza Napoletana)",
        "yield": "4 pizzas",
        "isDefault": true
      },
      {
        "id": "neapolitan-fresh-tomato-crudo",
        "name": "Fresh Tomato (Crudo)",
        "description": "Summer-only sauce using peak-season fresh tomatoes",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Ripe San Marzano or Roma tomatoes",
            "amount": "500g",
            "note": "Fresh, not canned"
          },
          {
            "item": "Sea salt",
            "amount": "½ tsp"
          },
          {
            "item": "Fresh basil",
            "amount": "6-8 leaves"
          },
          {
            "item": "Extra virgin olive oil",
            "amount": "2 tbsp"
          }
        ],
        "instructions": [
          "Score tomatoes with an X, blanch 30 seconds, peel.",
          "Halve, remove seeds, crush flesh by hand.",
          "Season with salt, add torn basil and oil.",
          "Use within 24 hours for peak freshness."
        ],
        "proTip": "Only make this June-September when tomatoes are at their best.",
        "isDefault": false
      },
      {
        "id": "neapolitan-white-sauce-bianca",
        "name": "White Sauce (Bianca)",
        "description": "No tomato - olive oil, garlic, and cheese base",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Extra virgin olive oil",
            "amount": "3 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "2 cloves",
            "note": "Thinly sliced"
          },
          {
            "item": "Fresh mozzarella",
            "amount": "150g",
            "note": "Torn"
          },
          {
            "item": "Pecorino Romano",
            "amount": "30g",
            "note": "Grated"
          },
          {
            "item": "Fresh basil",
            "amount": "To garnish"
          }
        ],
        "instructions": [
          "Brush dough with olive oil.",
          "Scatter sliced garlic (raw or lightly sautéed).",
          "Add torn mozzarella and pecorino.",
          "Bake, then finish with fresh basil."
        ],
        "proTip": "Great for showcasing high-quality toppings like prosciutto or truffle.",
        "isDefault": false
      },
      {
        "id": "neapolitan-crema-di-parmigiano",
        "name": "Crema di Parmigiano",
        "description": "Modern Italian — silky parmigiano cream, Franco Pepe style",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Parmigiano-Reggiano (24mo)",
            "amount": "100g",
            "note": "Grated fine"
          },
          {
            "item": "Whole milk",
            "amount": "150ml"
          },
          {
            "item": "Heavy cream",
            "amount": "50ml"
          },
          {
            "item": "Black pepper",
            "amount": "To taste",
            "note": "Fresh cracked"
          }
        ],
        "instructions": [
          "Warm milk and cream together in a saucepan (do not boil).",
          "Whisk in grated parmigiano until fully emulsified and smooth.",
          "Season with fresh cracked black pepper.",
          "Cool to room temp, then chill to set (at least 1 hour).",
          "Spread a thin layer on dough before adding toppings."
        ],
        "proTip": "Used by award-winning pizzaioli like Franco Pepe. Pairs beautifully with pear + walnut, mortadella + pistachio, prosciutto crudo, or truffle.",
        "isDefault": false
      },
      {
        "id": "neapolitan-pesto-verde",
        "name": "Pesto Verde",
        "description": "Basil pesto base - Genovese tradition",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Fresh basil leaves",
            "amount": "60g",
            "note": "Packed"
          },
          {
            "item": "Pine nuts",
            "amount": "30g",
            "note": "Lightly toasted"
          },
          {
            "item": "Garlic",
            "amount": "1 clove"
          },
          {
            "item": "Parmigiano-Reggiano",
            "amount": "50g",
            "note": "Grated"
          },
          {
            "item": "Pecorino Romano",
            "amount": "25g",
            "note": "Grated"
          },
          {
            "item": "Extra virgin olive oil",
            "amount": "120ml"
          },
          {
            "item": "Sea salt",
            "amount": "Pinch"
          }
        ],
        "instructions": [
          "Blend basil, pine nuts, garlic, and salt in food processor.",
          "Add cheeses, pulse to combine.",
          "Stream in olive oil while processing until smooth.",
          "Spread thin layer on dough before toppings."
        ],
        "proTip": "Use sparingly - pesto is intense. 2 tbsp per pizza is plenty.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "new-york",
    "styleName": "New York",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "new-york-primary",
    "options": [
      {
        "id": "new-york-primary",
        "name": "Classic NY Pizza Sauce",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "800g",
            "note": "6-in-1 or Stanislaus preferred"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "4 cloves",
            "note": "Minced"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "1 tsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp",
            "note": "Balances acidity"
          },
          {
            "item": "Salt",
            "amount": "1 tsp",
            "note": "Adjust to taste"
          },
          {
            "item": "Black pepper",
            "amount": "¼ tsp"
          },
          {
            "item": "Red pepper flakes",
            "amount": "¼ tsp",
            "note": "Optional"
          }
        ],
        "instructions": [
          "Heat olive oil over medium heat. Add garlic, sauté 30 seconds until fragrant (don't brown).",
          "Add crushed tomatoes, oregano, basil, sugar, salt, pepper, and red pepper flakes.",
          "Bring to a gentle simmer, reduce heat to low.",
          "Simmer uncovered 30-45 minutes, stirring occasionally, until slightly thickened.",
          "Taste and adjust seasoning. Cool before using.",
          "Refrigerate up to 1 week or freeze up to 3 months."
        ],
        "proTip": "NY sauce should be smooth but not pureed. The 6-in-1 tomatoes from Stanislaus are the industry standard for a reason - worth seeking out.",
        "source": "Tony Gemignani - World Pizza Champion",
        "yield": "6 pizzas",
        "isDefault": true
      },
      {
        "id": "new-york-vodka-sauce",
        "name": "Vodka Sauce",
        "description": "Creamy tomato with vodka - Brooklyn favorite",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "400g"
          },
          {
            "item": "Heavy cream",
            "amount": "120ml"
          },
          {
            "item": "Vodka",
            "amount": "60ml"
          },
          {
            "item": "Butter",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves",
            "note": "Minced"
          },
          {
            "item": "Red pepper flakes",
            "amount": "¼ tsp"
          },
          {
            "item": "Fresh basil",
            "amount": "10 leaves"
          },
          {
            "item": "Parmigiano-Reggiano",
            "amount": "50g",
            "note": "Grated"
          },
          {
            "item": "Salt & pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Melt butter, sauté garlic and pepper flakes 1 minute.",
          "Add vodka, simmer 2 minutes to cook off alcohol.",
          "Add tomatoes, simmer 15 minutes.",
          "Stir in cream and parmesan, simmer 5 more minutes.",
          "Add torn basil off heat. Season to taste."
        ],
        "proTip": "The vodka releases flavor compounds in tomatoes that water and fat cannot. Don't skip it!",
        "isDefault": false
      },
      {
        "id": "new-york-fra-diavolo-spicy",
        "name": "Fra Diavolo (Spicy)",
        "description": "Fiery tomato sauce with serious heat",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "800g"
          },
          {
            "item": "Olive oil",
            "amount": "3 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "6 cloves",
            "note": "Sliced"
          },
          {
            "item": "Calabrian chili paste",
            "amount": "2 tbsp",
            "note": "Or 1 tbsp red pepper flakes"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Fresh basil",
            "amount": "Handful"
          },
          {
            "item": "Salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Heat oil, add garlic and chili paste, sauté 1 minute.",
          "Add tomatoes and oregano, simmer 25 minutes.",
          "Finish with fresh basil, season with salt.",
          "Cool before using."
        ],
        "proTip": "Calabrian chilis have fruity heat. Red pepper flakes work but lack complexity.",
        "isDefault": false
      },
      {
        "id": "new-york-garlic-white-sauce",
        "name": "Garlic White Sauce",
        "description": "Creamy garlic sauce - no tomato",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Butter",
            "amount": "4 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "8 cloves",
            "note": "Minced"
          },
          {
            "item": "Heavy cream",
            "amount": "240ml"
          },
          {
            "item": "Cream cheese",
            "amount": "60g",
            "note": "Softened"
          },
          {
            "item": "Parmigiano-Reggiano",
            "amount": "60g",
            "note": "Grated"
          },
          {
            "item": "Italian seasoning",
            "amount": "1 tsp"
          },
          {
            "item": "Salt & pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Melt butter over medium-low heat. Add garlic, cook 2-3 minutes until golden.",
          "Add cream, bring to gentle simmer.",
          "Whisk in cream cheese until smooth.",
          "Add parmesan and Italian seasoning, stir until melted.",
          "Season to taste. Cool before using."
        ],
        "proTip": "Don't rush the garlic - golden garlic is sweet, burnt garlic ruins the sauce.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "detroit",
    "styleName": "Detroit",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "detroit-primary",
    "options": [
      {
        "id": "detroit-primary",
        "name": "Detroit Red Sauce (Racing Stripes)",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "800g",
            "note": "Escalon 6-in-1 preferred"
          },
          {
            "item": "Tomato paste",
            "amount": "2 tbsp"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "4 cloves",
            "note": "Minced"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "2 tsp"
          },
          {
            "item": "Sugar",
            "amount": "2 tsp"
          },
          {
            "item": "Salt",
            "amount": "1 tsp"
          },
          {
            "item": "Black pepper",
            "amount": "½ tsp"
          },
          {
            "item": "Onion powder",
            "amount": "½ tsp"
          }
        ],
        "instructions": [
          "Heat olive oil, sauté garlic 30 seconds.",
          "Add tomato paste, cook 1 minute to caramelize slightly.",
          "Add crushed tomatoes and all seasonings.",
          "Simmer 30-40 minutes until thick enough to hold a stripe.",
          "Cool completely before using.",
          "Apply in 2-3 \"racing stripes\" on TOP of cheese after baking."
        ],
        "proTip": "Detroit sauce goes ON TOP of the cheese in stripes, not under. This is non-negotiable! The sauce should be thick enough to hold its shape.",
        "source": "Shawn Randazzo - World Pizza Champion",
        "yield": "4 Detroit pans",
        "isDefault": true
      },
      {
        "id": "detroit-white-detroit",
        "name": "White Detroit",
        "description": "Garlic cream base with Wisconsin brick cheese",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Butter",
            "amount": "3 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "6 cloves",
            "note": "Minced"
          },
          {
            "item": "Heavy cream",
            "amount": "180ml"
          },
          {
            "item": "Cream cheese",
            "amount": "60g"
          },
          {
            "item": "Parmesan",
            "amount": "40g",
            "note": "Grated"
          },
          {
            "item": "Italian herbs",
            "amount": "1 tsp"
          }
        ],
        "instructions": [
          "Melt butter, sauté garlic until golden.",
          "Add cream, simmer 3 minutes.",
          "Whisk in cream cheese and parmesan.",
          "Season and cool.",
          "Apply in stripes on top of cheese after baking."
        ],
        "proTip": "Still apply in stripes on top! The \"stripes on top\" is the Detroit tradition.",
        "isDefault": false
      },
      {
        "id": "detroit-detroit-vodka-stripes",
        "name": "Detroit Vodka Stripes",
        "description": "Pink vodka sauce for Detroit-style",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "400g"
          },
          {
            "item": "Heavy cream",
            "amount": "120ml"
          },
          {
            "item": "Vodka",
            "amount": "60ml"
          },
          {
            "item": "Butter",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves"
          },
          {
            "item": "Parmesan",
            "amount": "40g"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp"
          },
          {
            "item": "Salt & pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Sauté garlic in butter, add vodka, reduce by half.",
          "Add tomatoes and sugar, simmer 15 minutes.",
          "Add cream and parmesan, simmer 5 more minutes.",
          "Cool until thick enough for stripes."
        ],
        "proTip": "Should be thicker than regular vodka sauce to hold stripe shape.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "chicago",
    "styleName": "Chicago Deep Dish",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "chicago-primary",
    "options": [
      {
        "id": "chicago-primary",
        "name": "Chicago Chunky Tomato",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Whole peeled tomatoes",
            "amount": "800g",
            "note": "Preferably Stanislaus or 7/11"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "2 tsp"
          },
          {
            "item": "Garlic powder",
            "amount": "1 tsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp"
          },
          {
            "item": "Salt",
            "amount": "½ tsp"
          },
          {
            "item": "Black pepper",
            "amount": "¼ tsp"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          }
        ],
        "instructions": [
          "Drain tomatoes, reserving juice for another use.",
          "Crush tomatoes by hand into chunky pieces - do NOT puree.",
          "Mix in all seasonings and olive oil.",
          "Do not cook - the long bake time (30-40 min) cooks the sauce.",
          "Spread generously over cheese layer (sauce goes on TOP in Chicago style)."
        ],
        "proTip": "Chicago sauce is CHUNKY and goes on TOP of the cheese. It's essentially seasoned crushed tomatoes that cook during the long bake. Pre-cooking makes it mushy.",
        "source": "Lou Malnati's Style",
        "yield": "2 deep dish pies",
        "isDefault": true
      },
      {
        "id": "chicago-butter-crust-sauce",
        "name": "Butter Crust Sauce",
        "description": "Richer sauce for butter-crust deep dish",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Whole peeled tomatoes",
            "amount": "800g"
          },
          {
            "item": "Butter",
            "amount": "3 tbsp",
            "note": "Melted"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves",
            "note": "Minced"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "2 tsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp"
          },
          {
            "item": "Salt & pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Crush tomatoes by hand.",
          "Mix in melted butter, raw garlic, and seasonings.",
          "Spread on top of cheese layer.",
          "The butter melts into the sauce during baking."
        ],
        "proTip": "The butter adds richness that complements a butter-based crust.",
        "isDefault": false
      },
      {
        "id": "chicago-italian-sausage-sauce",
        "name": "Italian Sausage Sauce",
        "description": "Sauce with sausage drippings mixed in",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Whole peeled tomatoes",
            "amount": "800g"
          },
          {
            "item": "Italian sausage drippings",
            "amount": "2 tbsp",
            "note": "From cooking sausage"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Fennel seeds",
            "amount": "½ tsp",
            "note": "Crushed"
          },
          {
            "item": "Garlic powder",
            "amount": "1 tsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp"
          },
          {
            "item": "Red pepper flakes",
            "amount": "¼ tsp"
          }
        ],
        "instructions": [
          "Cook sausage, reserve 2 tbsp of the fat.",
          "Crush tomatoes, mix with sausage drippings.",
          "Add all seasonings, mix well.",
          "Layer on top of cheese and sausage."
        ],
        "proTip": "The sausage fat adds incredible depth. Don't skip it!",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "new-haven",
    "styleName": "New Haven",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "new-haven-primary",
    "options": [
      {
        "id": "new-haven-primary",
        "name": "New Haven Tomato Sauce",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "800g",
            "note": "Uncooked, straight from can"
          },
          {
            "item": "Garlic",
            "amount": "6 cloves",
            "note": "Thinly sliced or minced"
          },
          {
            "item": "Dried oregano",
            "amount": "2 tsp"
          },
          {
            "item": "Salt",
            "amount": "½ tsp"
          },
          {
            "item": "Olive oil",
            "amount": "Generous drizzle"
          },
          {
            "item": "Pecorino Romano",
            "amount": "For grating on top"
          }
        ],
        "instructions": [
          "This is the simplest sauce - straight crushed tomatoes from the can.",
          "Spread thin layer of crushed tomatoes on dough.",
          "Scatter sliced garlic generously over sauce.",
          "Sprinkle with oregano and salt.",
          "Drizzle with olive oil.",
          "After baking, grate pecorino romano over the top."
        ],
        "proTip": "New Haven apizza is about the coal-fired char, not complicated sauce. Raw crushed tomatoes + raw garlic + intense heat = magic. The garlic chars slightly and becomes sweet.",
        "source": "Frank Pepe's Tradition",
        "yield": "4-6 apizza",
        "isDefault": true
      },
      {
        "id": "new-haven-white-clam-famous",
        "name": "White Clam (Famous)",
        "description": "Frank Pepe's legendary white clam pizza - no tomato",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Fresh littleneck clams",
            "amount": "24-30",
            "note": "Shucked, or 300g canned"
          },
          {
            "item": "Garlic",
            "amount": "8 cloves",
            "note": "Thinly sliced"
          },
          {
            "item": "Olive oil",
            "amount": "4 tbsp"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tsp"
          },
          {
            "item": "Fresh parsley",
            "amount": "2 tbsp",
            "note": "Chopped"
          },
          {
            "item": "Pecorino Romano",
            "amount": "60g",
            "note": "Grated"
          },
          {
            "item": "Black pepper",
            "amount": "To taste"
          },
          {
            "item": "Lemon juice",
            "amount": "Squeeze after baking"
          }
        ],
        "instructions": [
          "Brush dough with olive oil generously.",
          "Scatter sliced garlic over dough.",
          "Distribute clams evenly (if using fresh, add clam juice too).",
          "Sprinkle with oregano, pepper, and half the pecorino.",
          "Drizzle more olive oil on top.",
          "Bake until charred. Finish with parsley, remaining pecorino, and lemon."
        ],
        "proTip": "This is NOT a cheese pizza - no mozzarella! Just olive oil, clams, garlic, and pecorino. The clam juice creates the \"sauce.\"",
        "isDefault": false
      },
      {
        "id": "new-haven-plain-tomato-pie-no-cheese",
        "name": "Plain Tomato Pie (No Cheese)",
        "description": "Traditional apizza - tomato sauce, no mozzarella",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "200g per pizza"
          },
          {
            "item": "Garlic",
            "amount": "4 cloves",
            "note": "Sliced"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tsp"
          },
          {
            "item": "Olive oil",
            "amount": "Generous drizzle"
          },
          {
            "item": "Pecorino Romano",
            "amount": "For grating"
          },
          {
            "item": "Salt",
            "amount": "Pinch"
          }
        ],
        "instructions": [
          "Spread crushed tomatoes on stretched dough.",
          "Add garlic, oregano, salt, olive oil.",
          "Bake at highest heat until charred.",
          "Grate pecorino on top after baking."
        ],
        "proTip": "Traditional New Haven \"plain\" has no mozzarella - just tomato, garlic, pecorino, and char.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "montreal",
    "styleName": "Montreal",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "montreal-primary",
    "options": [
      {
        "id": "montreal-primary",
        "name": "Montreal Pizzeria Sauce",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "800g"
          },
          {
            "item": "Olive oil",
            "amount": "3 tbsp"
          },
          {
            "item": "Anchovy fillets",
            "amount": "2",
            "note": "Secret umami - won't taste fishy"
          },
          {
            "item": "Garlic",
            "amount": "4 cloves",
            "note": "Minced"
          },
          {
            "item": "Fresh oregano",
            "amount": "2 tbsp",
            "note": "Or 1 tbsp dried"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tsp",
            "note": "In addition to fresh"
          },
          {
            "item": "Fresh basil",
            "amount": "6-8 leaves"
          },
          {
            "item": "Red pepper flakes",
            "amount": "¼ tsp"
          },
          {
            "item": "Baking soda",
            "amount": "Tiny pinch",
            "note": "Reduces acidity without sugar"
          },
          {
            "item": "Salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Heat olive oil over medium-low. Add anchovies, let them dissolve into oil (1-2 min).",
          "Add garlic, sauté 60 seconds - don't brown.",
          "Add fresh oregano, cook 2 minutes on low to release oils.",
          "Add crushed tomatoes, dried oregano, and red pepper flakes.",
          "Simmer 20-30 minutes, stirring occasionally.",
          "Add tiny pinch of baking soda (neutralizes acidity without adding sweetness).",
          "Tear in basil leaves off heat. Season with salt to taste.",
          "Cool before using. Stores 1 week refrigerated."
        ],
        "proTip": "The anchovy is the secret - it dissolves completely and adds deep umami without any fishiness. Montreal pizzerias have used this trick for decades. The baking soda is another pro secret - it cuts acidity better than sugar.",
        "source": "Quebec Italian-Canadian Tradition",
        "yield": "4-6 pizzas",
        "isDefault": true
      },
      {
        "id": "montreal-all-dressed-sauce",
        "name": "All-Dressed Sauce",
        "description": "Slightly sweeter for the classic All-Dressed pie",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "800g"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves",
            "note": "Minced"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "2 tsp"
          },
          {
            "item": "Onion powder",
            "amount": "½ tsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp",
            "note": "Balances for toppings"
          },
          {
            "item": "Salt & pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Sauté garlic in oil 30 seconds.",
          "Add tomatoes and all seasonings.",
          "Simmer 25 minutes until slightly thick.",
          "Season to taste, cool before using."
        ],
        "proTip": "All-Dressed (mushrooms, pepperoni, green peppers) releases moisture. Slightly thicker, sweeter sauce balances it.",
        "isDefault": false
      },
      {
        "id": "montreal-7up-secret-sauce",
        "name": "7UP Secret Sauce",
        "description": "The legendary Montreal 7UP dough trick adapted for sauce",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "700g"
          },
          {
            "item": "7UP or Sprite",
            "amount": "100ml",
            "note": "Not diet"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Fresh basil",
            "amount": "4 leaves"
          },
          {
            "item": "Salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Sauté garlic in oil.",
          "Add tomatoes and 7UP.",
          "Simmer 30 minutes - the soda adds subtle sweetness and helps break down tomatoes.",
          "Add oregano and basil, season to taste."
        ],
        "proTip": "The carbonation in 7UP helps create a lighter, slightly tangy sauce. Old Montreal pizzeria secret!",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "sicilian",
    "styleName": "Sicilian",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "sicilian-primary",
    "options": [
      {
        "id": "sicilian-primary",
        "name": "NYC Sicilian Tomato Sauce",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "800g",
            "note": "Stanislaus or 6-in-1"
          },
          {
            "item": "Olive oil",
            "amount": "3 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "6 cloves",
            "note": "Minced"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "2 tsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp"
          },
          {
            "item": "Salt",
            "amount": "1 tsp"
          },
          {
            "item": "Black pepper",
            "amount": "½ tsp"
          },
          {
            "item": "Red pepper flakes",
            "amount": "¼ tsp"
          }
        ],
        "instructions": [
          "Heat olive oil over medium heat, sauté garlic until fragrant (30 seconds).",
          "Add crushed tomatoes and all seasonings.",
          "Simmer 30-40 minutes until thickened.",
          "For traditional Sicilian: spread sauce on TOP of cheese.",
          "For upside-down style (L&B): sauce goes under cheese, more sauce on top after baking."
        ],
        "proTip": "NYC Sicilian sauce is applied generously - don't be shy! The thick, spongy crust absorbs it beautifully. Some shops put sauce under AND on top.",
        "source": "Prince Street Pizza / L&B Spumoni Gardens Tradition",
        "yield": "2 Sicilian pans",
        "isDefault": true
      },
      {
        "id": "sicilian-thin-sicilian-sauce",
        "name": "Thin Sicilian Sauce",
        "description": "Lighter sauce for thinner Sicilian-style pies",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "600g"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "4 cloves",
            "note": "Sliced thin"
          },
          {
            "item": "Fresh basil",
            "amount": "8-10 leaves"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tsp"
          },
          {
            "item": "Salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Combine crushed tomatoes with sliced garlic (raw).",
          "Add oregano and salt.",
          "Spread thin layer on dough.",
          "Add torn basil after baking."
        ],
        "proTip": "For a lighter Sicilian, less sauce lets the crust shine.",
        "isDefault": false
      },
      {
        "id": "sicilian-sicilian-vodka",
        "name": "Sicilian Vodka",
        "description": "Creamy vodka sauce for upscale Sicilian",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "400g"
          },
          {
            "item": "Heavy cream",
            "amount": "120ml"
          },
          {
            "item": "Vodka",
            "amount": "60ml"
          },
          {
            "item": "Butter",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves"
          },
          {
            "item": "Parmesan",
            "amount": "40g"
          },
          {
            "item": "Red pepper flakes",
            "amount": "¼ tsp"
          }
        ],
        "instructions": [
          "Sauté garlic in butter, add vodka, reduce.",
          "Add tomatoes, simmer 15 minutes.",
          "Add cream and parmesan, cook 5 more minutes.",
          "Season and cool before using."
        ],
        "proTip": "A Brooklyn favorite - vodka sauce on thick Sicilian crust is incredible.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "roman",
    "styleName": "Roman",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "roman-primary",
    "options": [
      {
        "id": "roman-primary",
        "name": "Roman Pizza Sauce",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Passata di pomodoro",
            "amount": "400g",
            "note": "Strained tomatoes"
          },
          {
            "item": "Extra virgin olive oil",
            "amount": "3 tbsp",
            "note": "High quality Italian"
          },
          {
            "item": "Garlic",
            "amount": "1 clove",
            "note": "Grated on microplane"
          },
          {
            "item": "Fresh oregano",
            "amount": "1 tsp",
            "note": "Or ½ tsp dried"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Use smooth passata, not chunky crushed tomatoes.",
          "Mix passata with grated garlic, oregano, salt, and olive oil.",
          "Let sit 30 minutes for flavors to meld.",
          "Spread thin layer on pre-baked crust (Roman style often pars-bakes first).",
          "Add toppings and finish baking."
        ],
        "proTip": "Roman pizza al taglio often uses less sauce than other styles. The focaccia-like crust and high-quality toppings are the stars. Bonci says \"let the dough speak.\"",
        "source": "Gabriele Bonci - Pizzarium Style",
        "yield": "1 large teglia",
        "isDefault": true
      },
      {
        "id": "roman-pizza-bianca-no-sauce",
        "name": "Pizza Bianca (No Sauce)",
        "description": "Traditional Roman white pizza - just olive oil, salt, rosemary",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Extra virgin olive oil",
            "amount": "4 tbsp"
          },
          {
            "item": "Flaky sea salt",
            "amount": "Generous pinch"
          },
          {
            "item": "Fresh rosemary",
            "amount": "2 sprigs",
            "note": "Leaves stripped"
          }
        ],
        "instructions": [
          "Dimple the dough generously.",
          "Drizzle olive oil into dimples.",
          "Sprinkle with flaky salt and rosemary.",
          "Bake until golden."
        ],
        "proTip": "True Roman pizza bianca is just bread, oil, and salt. It's eaten for breakfast in Rome!",
        "isDefault": false
      },
      {
        "id": "roman-pizza-con-patate-sauce",
        "name": "Pizza con Patate Sauce",
        "description": "For the classic Roman potato pizza",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Extra virgin olive oil",
            "amount": "4 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "2 cloves",
            "note": "Thinly sliced"
          },
          {
            "item": "Fresh rosemary",
            "amount": "2 tbsp"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          },
          {
            "item": "Black pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Mix oil with garlic, rosemary, salt, and pepper.",
          "Toss thinly sliced potatoes in half the mixture.",
          "Brush remaining oil mixture on dough.",
          "Top with seasoned potatoes, bake until crispy."
        ],
        "proTip": "Slice potatoes paper-thin on a mandoline. They should be almost translucent.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "grandma",
    "styleName": "Grandma",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "grandma-primary",
    "options": [
      {
        "id": "grandma-primary",
        "name": "Long Island Grandma Sauce",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "400g",
            "note": "Hand-crushed from whole"
          },
          {
            "item": "Garlic",
            "amount": "6-8 cloves",
            "note": "Sliced paper thin"
          },
          {
            "item": "Extra virgin olive oil",
            "amount": "4 tbsp",
            "note": "Generous!"
          },
          {
            "item": "Fresh basil",
            "amount": "10 leaves",
            "note": "Torn"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tsp"
          },
          {
            "item": "Sea salt",
            "amount": "½ tsp"
          },
          {
            "item": "Black pepper",
            "amount": "¼ tsp"
          }
        ],
        "instructions": [
          "Hand-crush whole tomatoes - keep it very chunky.",
          "Scatter raw sliced garlic directly on the oiled dough.",
          "Spoon crushed tomatoes over garlic.",
          "Drizzle generously with olive oil.",
          "Sprinkle oregano, salt, pepper.",
          "Add torn basil after baking."
        ],
        "proTip": "Grandma pizza is ALL about the garlic. The raw garlic slices roast in the oven and become sweet and caramelized. Don't skip this step or pre-cook the garlic!",
        "source": "Umberto's / King Umberto Style",
        "yield": "1 grandma pan",
        "isDefault": true
      },
      {
        "id": "grandma-fresh-tomato-grandma",
        "name": "Fresh Tomato Grandma",
        "description": "Summer version with fresh tomatoes",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Fresh plum tomatoes",
            "amount": "500g",
            "note": "Sliced"
          },
          {
            "item": "Garlic",
            "amount": "6 cloves",
            "note": "Sliced"
          },
          {
            "item": "Fresh basil",
            "amount": "12 leaves"
          },
          {
            "item": "Olive oil",
            "amount": "4 tbsp"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tsp"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Slice fresh tomatoes, let drain 10 minutes.",
          "Scatter garlic on oiled dough.",
          "Layer tomato slices over garlic.",
          "Drizzle with oil, season with oregano and salt.",
          "Add fresh basil after baking."
        ],
        "proTip": "Only make this when tomatoes are peak season. The fresh tomato flavor is incredible.",
        "isDefault": false
      },
      {
        "id": "grandma-pesto-grandma",
        "name": "Pesto Grandma",
        "description": "Basil pesto swirled with tomato",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "300g"
          },
          {
            "item": "Basil pesto",
            "amount": "4 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "4 cloves",
            "note": "Sliced"
          },
          {
            "item": "Olive oil",
            "amount": "3 tbsp"
          },
          {
            "item": "Fresh mozzarella",
            "amount": "200g"
          }
        ],
        "instructions": [
          "Scatter garlic on oiled dough.",
          "Spoon crushed tomatoes in patches (not full coverage).",
          "Dollop pesto between tomato patches.",
          "Add torn mozzarella.",
          "Drizzle with oil, bake until bubbly."
        ],
        "proTip": "Don't mix the pesto and tomato - let them stay separate for visual appeal and flavor contrast.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "chicago-thin",
    "styleName": "Chicago Thin",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "chicago-thin-primary",
    "options": [
      {
        "id": "chicago-thin-primary",
        "name": "Midwest Tavern Sauce",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Tomato sauce",
            "amount": "400g",
            "note": "Smooth, not crushed"
          },
          {
            "item": "Tomato paste",
            "amount": "2 tbsp"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic powder",
            "amount": "1 tsp"
          },
          {
            "item": "Onion powder",
            "amount": "1 tsp"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "1 tsp"
          },
          {
            "item": "Sugar",
            "amount": "2 tsp"
          },
          {
            "item": "Salt",
            "amount": "½ tsp"
          },
          {
            "item": "Fennel seeds",
            "amount": "¼ tsp",
            "note": "Optional, crushed"
          }
        ],
        "instructions": [
          "Heat olive oil, add tomato paste, cook 1 minute.",
          "Add tomato sauce and all seasonings.",
          "Simmer 20-25 minutes until slightly thickened.",
          "Cool completely before using.",
          "Spread thin layer - tavern style uses less sauce."
        ],
        "proTip": "Tavern pizza is cut in squares (\"party cut\") and has a thin, cracker-like crust. The sauce should be smooth and applied sparingly so the crust stays crispy.",
        "source": "Chicago Tavern Style Tradition",
        "yield": "4-6 tavern pies",
        "isDefault": true
      },
      {
        "id": "chicago-thin-sweet-tavern-sauce",
        "name": "Sweet Tavern Sauce",
        "description": "Slightly sweeter version popular in some Midwest spots",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Tomato sauce",
            "amount": "400g"
          },
          {
            "item": "Tomato paste",
            "amount": "2 tbsp"
          },
          {
            "item": "Brown sugar",
            "amount": "1 tbsp"
          },
          {
            "item": "Garlic powder",
            "amount": "1 tsp"
          },
          {
            "item": "Onion powder",
            "amount": "1 tsp"
          },
          {
            "item": "Dried oregano",
            "amount": "2 tsp"
          },
          {
            "item": "Salt",
            "amount": "½ tsp"
          }
        ],
        "instructions": [
          "Combine all ingredients in a saucepan.",
          "Simmer 15-20 minutes.",
          "Cool before using."
        ],
        "proTip": "The slight sweetness pairs well with spicy Italian sausage - a tavern favorite.",
        "isDefault": false
      },
      {
        "id": "chicago-thin-garlic-butter-white-tavern",
        "name": "Garlic Butter (White Tavern)",
        "description": "For white tavern-style pizza",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Butter",
            "amount": "4 tbsp",
            "note": "Melted"
          },
          {
            "item": "Garlic",
            "amount": "4 cloves",
            "note": "Minced"
          },
          {
            "item": "Italian seasoning",
            "amount": "1 tsp"
          },
          {
            "item": "Parmesan",
            "amount": "30g",
            "note": "Grated"
          },
          {
            "item": "Salt",
            "amount": "Pinch"
          }
        ],
        "instructions": [
          "Melt butter, add garlic, cook 1 minute.",
          "Remove from heat, stir in Italian seasoning and parmesan.",
          "Brush on dough before adding cheese."
        ],
        "proTip": "Brush the edges too for a buttery, garlic-flavored crust.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "california",
    "styleName": "California",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "california-primary",
    "options": [
      {
        "id": "california-primary",
        "name": "California Pizza Sauce",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "San Marzano tomatoes",
            "amount": "400g",
            "note": "Crushed by hand"
          },
          {
            "item": "Extra virgin olive oil",
            "amount": "2 tbsp",
            "note": "California EVOO preferred"
          },
          {
            "item": "Fresh garlic",
            "amount": "2 cloves",
            "note": "Minced"
          },
          {
            "item": "Fresh basil",
            "amount": "6 leaves",
            "note": "Chiffonade"
          },
          {
            "item": "Fresh oregano",
            "amount": "1 tsp",
            "note": "Minced"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          },
          {
            "item": "Black pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Crush tomatoes by hand, leaving some texture.",
          "Mix with olive oil, garlic, and fresh herbs.",
          "Season with salt and pepper.",
          "Use immediately for freshest flavor.",
          "Spread sparingly - California style lets toppings shine."
        ],
        "proTip": "California pizza is about fresh, high-quality ingredients and creative toppings. The sauce is a supporting player, not the star. Wolfgang Puck pioneered using ingredients like smoked salmon, goat cheese, and arugula.",
        "source": "Wolfgang Puck / CPK Inspiration",
        "yield": "4 pizzas",
        "isDefault": true
      },
      {
        "id": "california-bbq-sauce-base",
        "name": "BBQ Sauce Base",
        "description": "For the famous BBQ Chicken Pizza",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "BBQ sauce",
            "amount": "200g",
            "note": "Sweet and tangy style"
          },
          {
            "item": "Tomato sauce",
            "amount": "100g"
          },
          {
            "item": "Honey",
            "amount": "1 tbsp"
          },
          {
            "item": "Garlic powder",
            "amount": "½ tsp"
          },
          {
            "item": "Smoked paprika",
            "amount": "¼ tsp"
          }
        ],
        "instructions": [
          "Mix BBQ sauce with tomato sauce to lighten it.",
          "Add honey, garlic powder, and smoked paprika.",
          "Spread thin layer on dough.",
          "Top with grilled chicken, red onion, cilantro, and smoked gouda."
        ],
        "proTip": "The original CPK BBQ Chicken pizza used a mix of BBQ sauce and tomato sauce. Pure BBQ sauce is too sweet.",
        "isDefault": false
      },
      {
        "id": "california-pesto-cream",
        "name": "Pesto Cream",
        "description": "Creamy pesto base for gourmet California pizza",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Basil pesto",
            "amount": "4 tbsp"
          },
          {
            "item": "Ricotta",
            "amount": "120g"
          },
          {
            "item": "Cream",
            "amount": "2 tbsp"
          },
          {
            "item": "Lemon zest",
            "amount": "½ tsp"
          },
          {
            "item": "Salt & pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Mix pesto with ricotta and cream until smooth.",
          "Add lemon zest, season to taste.",
          "Spread as base, top with prosciutto, arugula, shaved parmesan."
        ],
        "proTip": "Add the arugula AFTER baking - it wilts perfectly from residual heat.",
        "isDefault": false
      },
      {
        "id": "california-thai-peanut-sauce",
        "name": "Thai Peanut Sauce",
        "description": "For Thai Chicken Pizza",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Peanut butter",
            "amount": "4 tbsp",
            "note": "Creamy"
          },
          {
            "item": "Soy sauce",
            "amount": "2 tbsp"
          },
          {
            "item": "Rice vinegar",
            "amount": "1 tbsp"
          },
          {
            "item": "Sesame oil",
            "amount": "1 tsp"
          },
          {
            "item": "Sriracha",
            "amount": "1 tsp"
          },
          {
            "item": "Honey",
            "amount": "1 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "1 clove",
            "note": "Minced"
          },
          {
            "item": "Ginger",
            "amount": "½ tsp",
            "note": "Grated"
          }
        ],
        "instructions": [
          "Whisk all ingredients until smooth.",
          "Add warm water if too thick.",
          "Spread on dough, top with chicken, mozzarella, bean sprouts, scallions.",
          "Drizzle with extra sauce after baking."
        ],
        "proTip": "Garnish with crushed peanuts and fresh cilantro for authentic Thai flavor.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "st-louis",
    "styleName": "St. Louis",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "st-louis-primary",
    "options": [
      {
        "id": "st-louis-primary",
        "name": "St. Louis Pizza Sauce",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Tomato sauce",
            "amount": "400g",
            "note": "Smooth"
          },
          {
            "item": "Tomato paste",
            "amount": "3 tbsp"
          },
          {
            "item": "Olive oil",
            "amount": "1 tbsp"
          },
          {
            "item": "Garlic powder",
            "amount": "1 tsp"
          },
          {
            "item": "Onion powder",
            "amount": "1 tsp"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "1 tsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tbsp",
            "note": "St. Louis style is sweeter"
          },
          {
            "item": "Salt",
            "amount": "½ tsp"
          },
          {
            "item": "Black pepper",
            "amount": "¼ tsp"
          }
        ],
        "instructions": [
          "Combine tomato sauce and paste with oil.",
          "Add all seasonings and sugar.",
          "Simmer 15-20 minutes.",
          "Cool completely.",
          "Apply medium layer - St. Louis isn't shy with sauce."
        ],
        "proTip": "St. Louis sauce is noticeably sweeter than NYC or Chicago. This pairs perfectly with Provel cheese (a processed blend of cheddar, swiss, and provolone). Outside St. Louis, use a mix of provolone and white cheddar.",
        "source": "Imo's Pizza Tradition",
        "yield": "4-6 St. Louis pies",
        "isDefault": true
      },
      {
        "id": "st-louis-extra-sweet-provel-sauce",
        "name": "Extra-Sweet Provel Sauce",
        "description": "Optimized for Provel cheese pairing",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Tomato sauce",
            "amount": "400g"
          },
          {
            "item": "Tomato paste",
            "amount": "2 tbsp"
          },
          {
            "item": "Brown sugar",
            "amount": "1.5 tbsp"
          },
          {
            "item": "Oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Garlic powder",
            "amount": "1 tsp"
          },
          {
            "item": "Onion powder",
            "amount": "1 tsp"
          },
          {
            "item": "Salt",
            "amount": "½ tsp"
          }
        ],
        "instructions": [
          "Mix all ingredients.",
          "Simmer 15 minutes.",
          "The sweetness balances Provel's unique tang."
        ],
        "proTip": "Provel melts into a gooey, almost fondue-like consistency. The sweet sauce is essential.",
        "isDefault": false
      },
      {
        "id": "st-louis-st-louis-white-garlic",
        "name": "St. Louis White Garlic",
        "description": "Garlic butter base for white St. Louis",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Butter",
            "amount": "4 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "5 cloves",
            "note": "Minced"
          },
          {
            "item": "Italian seasoning",
            "amount": "1 tsp"
          },
          {
            "item": "Parmesan",
            "amount": "30g"
          },
          {
            "item": "Salt",
            "amount": "Pinch"
          }
        ],
        "instructions": [
          "Melt butter, sauté garlic until golden.",
          "Add Italian seasoning, remove from heat.",
          "Stir in parmesan.",
          "Brush on thin cracker crust."
        ],
        "proTip": "White St. Louis with bacon and tomato slices is a local favorite.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "focaccia",
    "styleName": "Focaccia",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "focaccia-primary",
    "options": [
      {
        "id": "focaccia-primary",
        "name": "Focaccia Genovese Topping",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Extra virgin olive oil",
            "amount": "80ml",
            "note": "Ligurian if possible"
          },
          {
            "item": "Water",
            "amount": "40ml"
          },
          {
            "item": "Flaky sea salt",
            "amount": "1 tsp"
          },
          {
            "item": "Fresh rosemary",
            "amount": "2 tbsp",
            "note": "Leaves only"
          }
        ],
        "instructions": [
          "Mix olive oil with water (this creates the signature crispy-yet-moist top).",
          "Dimple the focaccia dough generously with your fingers.",
          "Pour oil-water mixture over dough, letting it pool in dimples.",
          "Press rosemary leaves into the dough.",
          "Sprinkle generously with flaky salt.",
          "Bake until golden."
        ],
        "proTip": "The water-oil emulsion is the Genovese secret. The water steams the surface while oil crisps it. Don't skip this! Also, use your fingertips to dimple all the way to the bottom of the pan.",
        "source": "Ligurian Tradition",
        "yield": "1 large focaccia",
        "isDefault": true
      },
      {
        "id": "focaccia-focaccia-al-pomodoro",
        "name": "Focaccia al Pomodoro",
        "description": "Tomato-topped focaccia",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Cherry tomatoes",
            "amount": "200g",
            "note": "Halved"
          },
          {
            "item": "Olive oil",
            "amount": "60ml"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves",
            "note": "Sliced"
          },
          {
            "item": "Fresh oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Dimple focaccia, drizzle with oil.",
          "Press tomato halves cut-side up into dimples.",
          "Scatter garlic slices and oregano.",
          "Season with salt, bake until tomatoes blister."
        ],
        "proTip": "The tomatoes become jammy and sweet. This is incredible warm or at room temperature.",
        "isDefault": false
      },
      {
        "id": "focaccia-focaccia-di-recco-onion",
        "name": "Focaccia di Recco (Onion)",
        "description": "Caramelized onion focaccia",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Yellow onions",
            "amount": "3 large",
            "note": "Thinly sliced"
          },
          {
            "item": "Olive oil",
            "amount": "60ml"
          },
          {
            "item": "Butter",
            "amount": "2 tbsp"
          },
          {
            "item": "Fresh thyme",
            "amount": "2 tsp"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          },
          {
            "item": "Sugar",
            "amount": "Pinch",
            "note": "Helps caramelization"
          }
        ],
        "instructions": [
          "Slowly caramelize onions in butter and oil (30-40 min).",
          "Add thyme and sugar, cook until deeply golden.",
          "Dimple focaccia, spread caramelized onions on top.",
          "Drizzle more oil, season with salt.",
          "Bake until edges are crispy."
        ],
        "proTip": "Low and slow is the key to sweet, jammy onions. Don't rush this step!",
        "isDefault": false
      },
      {
        "id": "focaccia-focaccia-alle-olive",
        "name": "Focaccia alle Olive",
        "description": "Black olive focaccia",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Olive oil",
            "amount": "60ml"
          },
          {
            "item": "Kalamata olives",
            "amount": "100g",
            "note": "Pitted, halved"
          },
          {
            "item": "Fresh rosemary",
            "amount": "1 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "2 cloves",
            "note": "Sliced"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Dimple focaccia, drizzle with oil.",
          "Press olive halves into dimples.",
          "Scatter rosemary and garlic.",
          "Season and bake."
        ],
        "proTip": "Use good quality olives - they're the star here.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "pan",
    "styleName": "Pan",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "pan-primary",
    "options": [
      {
        "id": "pan-primary",
        "name": "Classic Pan Pizza Sauce",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "600g"
          },
          {
            "item": "Tomato paste",
            "amount": "2 tbsp"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "4 cloves",
            "note": "Minced"
          },
          {
            "item": "Dried oregano",
            "amount": "1 tbsp"
          },
          {
            "item": "Dried basil",
            "amount": "2 tsp"
          },
          {
            "item": "Onion powder",
            "amount": "1 tsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp"
          },
          {
            "item": "Salt",
            "amount": "1 tsp"
          },
          {
            "item": "Black pepper",
            "amount": "½ tsp"
          },
          {
            "item": "Italian seasoning",
            "amount": "1 tsp"
          }
        ],
        "instructions": [
          "Heat oil, sauté garlic 30 seconds.",
          "Add tomato paste, cook 1 minute.",
          "Add crushed tomatoes and all seasonings.",
          "Simmer 25-30 minutes until thickened.",
          "Cool before using.",
          "Spread generously - pan pizza can handle lots of sauce."
        ],
        "proTip": "Pan pizza sauce should be robust and well-seasoned because it competes with the buttery, crispy crust. Don't be subtle with the seasoning!",
        "source": "Pizza Hut / American Pan Tradition",
        "yield": "2-3 pan pizzas",
        "isDefault": true
      },
      {
        "id": "pan-stuffed-crust-sauce",
        "name": "Stuffed Crust Sauce",
        "description": "Slightly lighter sauce for stuffed crust",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Crushed tomatoes",
            "amount": "400g"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves"
          },
          {
            "item": "Italian seasoning",
            "amount": "1 tbsp"
          },
          {
            "item": "Sugar",
            "amount": "1 tsp"
          },
          {
            "item": "Salt",
            "amount": "½ tsp"
          }
        ],
        "instructions": [
          "Sauté garlic in oil.",
          "Add tomatoes and seasonings.",
          "Simmer 20 minutes.",
          "Apply medium layer - don't overshadow the stuffed crust."
        ],
        "proTip": "With stuffed crust, the cheese-filled edge is the star. Use moderate sauce so it doesn't overpower.",
        "isDefault": false
      },
      {
        "id": "pan-buffalo-sauce-base",
        "name": "Buffalo Sauce Base",
        "description": "For Buffalo Chicken Pan Pizza",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Hot sauce (Frank's)",
            "amount": "120ml"
          },
          {
            "item": "Butter",
            "amount": "60g",
            "note": "Melted"
          },
          {
            "item": "Garlic powder",
            "amount": "½ tsp"
          },
          {
            "item": "Worcestershire",
            "amount": "1 tsp"
          },
          {
            "item": "Honey",
            "amount": "1 tbsp",
            "note": "Optional for milder heat"
          }
        ],
        "instructions": [
          "Melt butter, whisk in hot sauce.",
          "Add garlic powder and Worcestershire.",
          "Add honey if desired for milder version.",
          "Brush on dough, top with chicken and mozzarella.",
          "Drizzle more buffalo sauce after baking."
        ],
        "proTip": "Serve with blue cheese drizzle and celery on the side for authentic buffalo wing experience.",
        "isDefault": false
      },
      {
        "id": "pan-garlic-parmesan-white",
        "name": "Garlic Parmesan White",
        "description": "Creamy white sauce for pan pizza",
        "cookType": "simmered",
        "ingredients": [
          {
            "item": "Butter",
            "amount": "4 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "6 cloves",
            "note": "Minced"
          },
          {
            "item": "Heavy cream",
            "amount": "200ml"
          },
          {
            "item": "Parmesan",
            "amount": "80g",
            "note": "Grated"
          },
          {
            "item": "Italian seasoning",
            "amount": "1 tsp"
          },
          {
            "item": "Salt & pepper",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Melt butter, sauté garlic until golden.",
          "Add cream, bring to simmer.",
          "Whisk in parmesan until smooth.",
          "Season with Italian seasoning, salt, pepper.",
          "Spread on dough as base."
        ],
        "proTip": "This pairs amazingly with bacon, chicken, and broccoli for a \"loaded\" white pan pizza.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "coca",
    "styleName": "Coca",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "coca-primary",
    "options": [
      {
        "id": "coca-primary",
        "name": "Escalivada (Roasted Vegetables)",
        "cookType": "roasted",
        "ingredients": [
          {
            "item": "Red bell peppers",
            "amount": "2 large"
          },
          {
            "item": "Eggplant",
            "amount": "1 medium"
          },
          {
            "item": "Yellow onion",
            "amount": "1 large"
          },
          {
            "item": "Extra virgin olive oil",
            "amount": "4 tbsp",
            "note": "Spanish EVOO preferred"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves",
            "note": "Whole, roasted with vegetables"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          },
          {
            "item": "Sherry vinegar",
            "amount": "1 tbsp",
            "note": "Optional"
          }
        ],
        "instructions": [
          "Roast whole peppers, eggplant, onion, and garlic at 400°F until charred and soft (40-50 min).",
          "Place peppers in a bowl, cover with plastic wrap to steam (makes peeling easier).",
          "Peel peppers and eggplant, discard seeds and skin.",
          "Slice all vegetables into strips, squeeze roasted garlic from skins.",
          "Toss with olive oil, salt, and optional sherry vinegar.",
          "Spread on coca dough before baking, or add after par-baking."
        ],
        "proTip": "Traditional coca has NO tomato sauce and NO cheese. Escalivada is the classic topping - the smoky roasted vegetables paired with quality olive oil is pure Catalan perfection.",
        "source": "Traditional Catalan",
        "yield": "2 cocas",
        "isDefault": true
      },
      {
        "id": "coca-simple-olive-oil-base",
        "name": "Simple Olive Oil Base",
        "description": "The most traditional - just olive oil, salt, and toppings",
        "cookType": "roasted",
        "ingredients": [
          {
            "item": "Extra virgin olive oil",
            "amount": "4 tbsp"
          },
          {
            "item": "Flaky sea salt",
            "amount": "1 tsp"
          },
          {
            "item": "Fresh rosemary",
            "amount": "1 tbsp",
            "note": "Optional"
          }
        ],
        "instructions": [
          "Brush stretched coca dough generously with olive oil.",
          "Sprinkle with flaky salt.",
          "Add rosemary if using.",
          "Top with your choice: anchovies, sardines, or roasted vegetables."
        ],
        "proTip": "The best coca is the simplest. Let quality olive oil and fresh toppings shine.",
        "isDefault": false
      },
      {
        "id": "coca-coca-de-espinacas-spinach",
        "name": "Coca de Espinacas (Spinach)",
        "description": "Classic Catalan spinach coca with pine nuts and raisins",
        "cookType": "roasted",
        "ingredients": [
          {
            "item": "Fresh spinach",
            "amount": "400g"
          },
          {
            "item": "Olive oil",
            "amount": "3 tbsp"
          },
          {
            "item": "Garlic",
            "amount": "3 cloves",
            "note": "Sliced"
          },
          {
            "item": "Pine nuts",
            "amount": "30g"
          },
          {
            "item": "Raisins",
            "amount": "30g",
            "note": "Soaked in warm water"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Sauté garlic in olive oil until golden.",
          "Add spinach, cook until wilted. Season with salt.",
          "Drain excess liquid.",
          "Toast pine nuts separately.",
          "Spread spinach on coca, top with pine nuts and drained raisins."
        ],
        "proTip": "The sweet-savory combination of raisins and pine nuts is distinctly Catalan.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "flammkuchen",
    "styleName": "Flammkuchen",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "flammkuchen-primary",
    "options": [
      {
        "id": "flammkuchen-primary",
        "name": "Crème Fraîche Base",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Crème fraîche",
            "amount": "200g",
            "note": "Full-fat, not low-fat"
          },
          {
            "item": "Fromage blanc or quark",
            "amount": "100g",
            "note": "Or substitute sour cream"
          },
          {
            "item": "Sea salt",
            "amount": "½ tsp"
          },
          {
            "item": "White pepper",
            "amount": "Pinch"
          },
          {
            "item": "Nutmeg",
            "amount": "Tiny pinch",
            "note": "Freshly grated"
          }
        ],
        "instructions": [
          "Mix crème fraîche and fromage blanc until smooth.",
          "Season with salt, white pepper, and nutmeg.",
          "Spread a thin layer on rolled-out dough (less is more).",
          "Top with thinly sliced onions and lardons.",
          "Bake immediately at high heat."
        ],
        "proTip": "This is NOT pizza - there is NO tomato sauce and NO melting cheese. The crème fraîche is the star. Spread it thin or the center will be soggy. Authentic Flammkuchen from Alsace is minimalist perfection.",
        "source": "Traditional Alsatian",
        "yield": "2 Flammkuchen",
        "isDefault": true
      },
      {
        "id": "flammkuchen-flammkuchen-gratinee",
        "name": "Flammkuchen Gratinée",
        "description": "With Gruyère cheese - a modern variation",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Crème fraîche",
            "amount": "150g"
          },
          {
            "item": "Gruyère cheese",
            "amount": "80g",
            "note": "Grated"
          },
          {
            "item": "Sea salt",
            "amount": "¼ tsp"
          },
          {
            "item": "White pepper",
            "amount": "Pinch"
          }
        ],
        "instructions": [
          "Mix crème fraîche with salt and pepper.",
          "Spread on dough.",
          "Add traditional onion and lardon toppings.",
          "Scatter Gruyère on top.",
          "Bake until cheese is golden."
        ],
        "proTip": "Purists will say this isn't authentic - they're right. But it's delicious.",
        "isDefault": false
      },
      {
        "id": "flammkuchen-flammkuchen-au-munster",
        "name": "Flammkuchen au Munster",
        "description": "With Munster cheese - Alsatian specialty",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Crème fraîche",
            "amount": "150g"
          },
          {
            "item": "Munster cheese",
            "amount": "100g",
            "note": "Sliced"
          },
          {
            "item": "Cumin seeds",
            "amount": "½ tsp"
          },
          {
            "item": "Sea salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Spread crème fraîche on dough.",
          "Add onions (skip the bacon for this version).",
          "Place Munster slices on top.",
          "Sprinkle with cumin seeds.",
          "Bake until edges char."
        ],
        "proTip": "Munster is an Alsatian washed-rind cheese with a strong aroma but mild flavor. The cumin is traditional.",
        "isDefault": false
      }
    ]
  },
  {
    "sourceStyleId": "lahmacun",
    "styleName": "Lahmacun",
    "saltWarning": "Always check your canned tomato label before adding salt. Many brands (Cento, La Valle, etc.) already contain salt. Taste first, adjust later.",
    "defaultOptionId": "lahmacun-primary",
    "options": [
      {
        "id": "lahmacun-primary",
        "name": "Spiced Meat Topping (Lahmacun Harcı)",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Ground lamb or beef",
            "amount": "300g",
            "note": "Finely minced, not coarse"
          },
          {
            "item": "Onion",
            "amount": "1 medium",
            "note": "Grated or very finely minced"
          },
          {
            "item": "Tomato",
            "amount": "2 medium",
            "note": "Grated, juice squeezed out"
          },
          {
            "item": "Red bell pepper",
            "amount": "1 small",
            "note": "Finely diced"
          },
          {
            "item": "Green pepper",
            "amount": "1 small",
            "note": "Finely diced"
          },
          {
            "item": "Fresh parsley",
            "amount": "1/2 cup",
            "note": "Finely chopped"
          },
          {
            "item": "Tomato paste",
            "amount": "2 tbsp"
          },
          {
            "item": "Aleppo pepper (pul biber)",
            "amount": "1 tbsp",
            "note": "Or 1 tsp red pepper flakes"
          },
          {
            "item": "Sumac",
            "amount": "1 tsp"
          },
          {
            "item": "Cumin",
            "amount": "1 tsp"
          },
          {
            "item": "Salt",
            "amount": "1 tsp"
          },
          {
            "item": "Black pepper",
            "amount": "½ tsp"
          },
          {
            "item": "Olive oil",
            "amount": "2 tbsp"
          }
        ],
        "instructions": [
          "Grate onion and tomato, squeeze out excess liquid (this is critical!).",
          "Combine meat with all vegetables, paste, spices, and oil.",
          "Mix thoroughly with your hands until the mixture is paste-like.",
          "Spread a VERY THIN layer on rolled dough - you should see dough through the meat.",
          "The meat should extend to the edges.",
          "Bake at high heat until edges are charred (6-8 minutes)."
        ],
        "proTip": "The mixture must be WET enough to spread thin but not watery. Squeeze liquid from grated tomato and onion. The meat layer should be almost translucent - thick meat won't cook properly on the thin crust. NEVER add cheese - this is a meat flatbread, not pizza.",
        "source": "Traditional Turkish",
        "yield": "6-8 lahmacun",
        "isDefault": true
      },
      {
        "id": "lahmacun-vegetarian-lahmacun",
        "name": "Vegetarian Lahmacun",
        "description": "Meat-free version with walnuts and mushrooms",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Walnuts",
            "amount": "150g",
            "note": "Finely ground"
          },
          {
            "item": "Mushrooms",
            "amount": "150g",
            "note": "Finely chopped"
          },
          {
            "item": "Onion",
            "amount": "1 medium",
            "note": "Grated"
          },
          {
            "item": "Tomato",
            "amount": "2 medium",
            "note": "Grated"
          },
          {
            "item": "Red pepper",
            "amount": "1 small"
          },
          {
            "item": "Tomato paste",
            "amount": "2 tbsp"
          },
          {
            "item": "Aleppo pepper",
            "amount": "1 tbsp"
          },
          {
            "item": "Sumac",
            "amount": "1 tsp"
          },
          {
            "item": "Cumin",
            "amount": "1 tsp"
          },
          {
            "item": "Salt",
            "amount": "To taste"
          }
        ],
        "instructions": [
          "Pulse walnuts in food processor until finely ground.",
          "Sauté mushrooms until dry.",
          "Mix all ingredients as with traditional version.",
          "Spread thin on dough, bake at high heat."
        ],
        "proTip": "The walnuts provide the richness that meat usually gives. This is popular during Lent in Turkey.",
        "isDefault": false
      },
      {
        "id": "lahmacun-ac-l-lahmacun-extra-spicy",
        "name": "Acılı Lahmacun (Extra Spicy)",
        "description": "Fiery version with extra Aleppo pepper and fresh chilies",
        "cookType": "no-cook",
        "ingredients": [
          {
            "item": "Standard lahmacun mixture",
            "amount": "1 batch"
          },
          {
            "item": "Aleppo pepper",
            "amount": "2 tbsp",
            "note": "Double the amount"
          },
          {
            "item": "Fresh hot peppers",
            "amount": "2",
            "note": "Finely minced"
          },
          {
            "item": "Isot pepper",
            "amount": "1 tsp",
            "note": "Smoky Turkish pepper, optional"
          }
        ],
        "instructions": [
          "Prepare standard meat mixture.",
          "Add extra Aleppo pepper, fresh chilies, and isot.",
          "Mix well and spread on dough.",
          "Bake until edges char."
        ],
        "proTip": "Serve with extra lemon to balance the heat. Ayran (yogurt drink) is the traditional pairing.",
        "isDefault": false
      }
    ]
  }
];

const STYLE_SAUCE_MAP: Record<string, string> = {
  "contemporary-neapolitan": "neapolitan",
  "contemporary-neapolitan-double-preferment-whole-grain": "neapolitan",
  "roman-al-taglio": "roman",
  "pizza-alla-pala": "roman",
  "chicago-deep-dish": "chicago",
  "chicago-thin": "chicago-thin"
};

export function getSauceCollectionForStyle(styleId: string): StyleSauceCollection | undefined {
  const lookupId = STYLE_SAUCE_MAP[styleId] ?? styleId;
  return STYLE_SAUCE_COLLECTIONS.find((collection) => collection.sourceStyleId === lookupId);
}

export function getDefaultSauceOptionId(styleId: string): string | undefined {
  return getSauceCollectionForStyle(styleId)?.defaultOptionId;
}

export function getSauceOption(styleId: string, optionId?: string) {
  const collection = getSauceCollectionForStyle(styleId);
  if (!collection) return undefined;
  if (!optionId) return collection.options.find((option) => option.id === collection.defaultOptionId) ?? collection.options[0];
  return collection.options.find((option) => option.id === optionId) ?? collection.options.find((option) => option.id === collection.defaultOptionId) ?? collection.options[0];
}
