import type{ Categorie } from '../types';



export const menuData: Categorie[] = [
  {
    "id": 1,
    "nom": "Burgers",
    "image": "categorie_burger.jpeg",
    "promo": true,
    
    "items": [
      {
        "id": 11,
        "nom": "Classics",
        "produits": [
      {
        "id": 101,
        "nom": "cheese",
        "image": "Cheeseburger.jpeg",
        "prix": 18.5,
        "promo": false,
        "description": "Un délicieux burger classique avec du fromage fondant",
        "steps": [
          {
            "type": "composition",
            "nom": "Composition de base",
            "description": "Retirez les ingrédients que vous ne souhaitez pas",
            "elements": [
              { 
                "id": 1, 
                "nom": "Fromage", 
                "image": "fromage.jpeg",
                "description": "Steak haché pur boeuf 150g",
                "included": true
              },
              { 
                "id": 2, 
                "nom": "Salade", 
                "image": "salade.jpeg",
                "description": "Fromage cheddar fondant",
                "included": true
              },
              { 
                "id": 3, 
                "nom": "Sauce sweet curry", 
                "image": "souscury.jpeg",
                "description": "Sauce curry douce et crémeuse",
                "included": true
              }
              
            ],
            "minSelection": 0,
            "maxSelection": 4,
            "required": false
          },
          {
            "type": "Sauc Burger",
            "nom": "Choisissez Sauc Burger",
            "description": "Sélectionnez le type de pain pour votre burger",
            "elements": [
              { 
                "id": 5, 
                "nom": "Mayonnaise", 
                "image": "mayonaie.jpeg",
                "description": "Pain moelleux et légèrement sucré"
              },
              { 
                "id": 6, 
                "nom": "ketchup", 
                "image": "pain-sesame.jpg",
                "description": "Pain classique avec graines de sésame"
              },
              { 
                "id": 7, 
                "nom": "Sauce algerien", 
                "image": "pain-complet.jpg",
                "description": "Pain santé aux céréales complètes"
              },
              { 
                "id": 8, 
                "nom": "BBQ", 
                "image": "pain-complet.jpg",
                "description": "Pain santé aux céréales complètes"
              }
            ],
            "minSelection": 0,
            "maxSelection": 4,
            "required": false
          },
          {
            "type": "supp burg",
            "nom": "supp burg",
            "description": "Sélectionnez supp burg",
            "elements": [
              { 
                "id": 8, 
                "nom": "Galette Pomme", 
                  "prix": 3,
                "image": "steak-classique.jpg",
                "description": "Steak haché pur boeuf 150g"
              },
              { 
                "id": 9, 
                "nom": "Fromage", 
                "image": "steak-double.jpg",
                "prix": 3,
                "description": "Steak haché pur boeuf 200g"
              },
              { 
                "id": 10, 
                "nom": "Oeuf", 
                "image": "poulet-pane.jpg",
                "prix": 2,
                "description": "Filet de poulet pané et croustillant"
              }
            ],
            "minSelection": 0,
            "maxSelection": 3,
            "required": false
          },
          {
            "type": "Frites",
            "nom": "Frites",
            "description": "Ajoutez Frites",
            "elements": [
              { 
                "id": 11, 
                "nom": "frit Small", 
                "image": "cheddar.jpg",
                "prix": 0,
                "description": "Fromage cheddar fondant"
              },
              { 
                "id": 12, 
                "nom": "Frite large", 
                "image": "emmental.jpg",
                "prix": 1.5,
                "description": "Fromage emmental suisse"
              },
             
              
            ],
            "minSelection": 1,
            "maxSelection": 1,
            "required": true

          },
       
      
          {
            "type": "boissons",
            "nom": "Boissons",
            "description": "Choisissez votre boisson accompagnement",
            "elements": [
              { 
                "id": 25, 
                "nom": "Coca Cola", 
                "image": "coca-cola.jpg",
                "prix": 3,
                "description": "Soda au cola rafraîchissant"
              },
              { 
                "id": 26, 
                "nom": "Fanta", 
                "image": "fanta.jpg",
                "prix": 3,
                "description": "Soda à l'orange pétillant"
              },
              { 
                "id": 27, 
                "nom": "Sprite", 
                "image": "sprite.jpg",
                "prix": 3,
                "description": "Soda citron-lime rafraîchissant"
              },
              { 
                "id": 28, 
                "nom": "Eau plate", 
                "image": "eau-plate.jpg",
                "prix": 2,
                "description": "Eau minérale naturelle"
              },
              { 
                "id": 29, 
                "nom": "Eau gazeuse", 
                "image": "eau-gazeuse.jpg",
                "prix": 2.5,
                "description": "Eau pétillante rafraîchissante"
              },
              { 
                "id": 30, 
                "nom": "Ice Tea", 
                "image": "ice-tea.jpg",
                "prix": 3.5,
                "description": "Thé glacé au citron"
              },
              { 
                "id": 31, 
                "nom": "Jus d'orange", 
                "image": "jus-orange.jpg",
                "prix": 4,
                "description": "Jus d'orange pressé"
              },
              { 
                "id": 32, 
                "nom": "Limonade", 
                "image": "limonade.jpg",
                "prix": 3,
                "description": "Limonade maison"
              }
            ],
            "minSelection": 0,
            "maxSelection": 2
          }
        
        ]
      }
    ]
      },
      {
        "id": 102,
        "nom": "Double Beef Burger",
        "image": "double-beef-burger.jpeg",
        "prix": 24.0,
        "promo": true,
        "description": "Un burger double viande pour les plus gourmands",
        "steps": [
          {
            "type": "composition",
            "nom": "Composition de base",
            "description": "Retirez les ingrédients que vous ne souhaitez pas",
            "elements": [
              { 
                "id": 39, 
                "nom": "Double steak haché", 
                "image": "double-steak.jpg",
                "description": "Double steak haché pur boeuf 300g",
                "included": true
              },
              { 
                "id": 40, 
                "nom": "Double fromage", 
                "image": "double-fromage.jpg",
                "description": "Double portion de cheddar fondant",
                "included": true
              },
              { 
                "id": 41, 
                "nom": "Sauce spéciale", 
                "image": "sauce-speciale.jpg",
                "description": "Sauce signature du chef",
                "included": true
              },
              { 
                "id": 42, 
                "nom": "Salade & Tomate", 
                "image": "salade-tomate.jpg",
                "description": "Salade et tomates fraîches",
                "included": true
              }
            ],
            "minSelection": 0,
            "maxSelection": 4,
            "required": false
          },
          // ... autres étapes similaires au cheeseburger
        ]
      }
      // ... autres produits
    ]
  },
  {
    "id": 2,
    "nom": "Pizzas1",
    "image": "categorie_pizza.jpeg",
    "promo": false,
    "produits": [
      {
        "id": 201,
        "nom": "Pizza Margherita",
        "image": "pizza-margherita.jpeg",
        "prix": 22,
        "promo": false,
        "description": "La pizza traditionnelle italienne",
        "steps": [
          {
            "type": "composition",
            "nom": "Composition de base",
            "description": "Retirez les ingrédients que vous ne souhaitez pas",
            "elements": [
              { 
                "id": 50, 
                "nom": "Sauce tomate", 
                "image": "sauce-tomate.jpg",
                "description": "Sauce tomate maison",
                "included": true
              },
              { 
                "id": 51, 
                "nom": "Mozzarella", 
                "image": "mozzarella.jpg",
                "description": "Mozzarella fondante",
                "included": true
              },
              { 
                "id": 52, 
                "nom": "Basilic", 
                "image": "basilic.jpg",
                "description": "Basilic frais",
                "included": true
              }
            ],
            "minSelection": 0,
            "maxSelection": 3,
            "required": false
          },
          {
            "type": "boissons",
            "nom": "Boissons",
            "description": "Choisissez votre boisson accompagnement",
            "elements": [
              { 
                "id": 25, 
                "nom": "Coca Cola", 
                "image": "coca-cola.jpg",
                "prix": 3,
                "description": "Soda au cola rafraîchissant"
              },
              { 
                "id": 26, 
                "nom": "Fanta", 
                "image": "fanta.jpg",
                "prix": 3,
                "description": "Soda à l'orange pétillant"
              },
              { 
                "id": 53, 
                "nom": "San Pellegrino", 
                "image": "san-pellegrino.jpg",
                "prix": 4,
                "description": "Eau gazeuse italienne"
              },
              { 
                "id": 54, 
                "nom": "Limonade citron", 
                "image": "limonade-citron.jpg",
                "prix": 3.5,
                "description": "Limonade au citron frais"
              }
            ],
            "minSelection": 0,
            "maxSelection": 2
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "nom": "Boissons",
    "image": "categorie_boissons.jpeg",
    "promo": false,
    "produits": [
      {
        "id": 301,
        "nom": "Cappuccino",
        "image": "cappuccino.jpeg",
        "prix": 4.5,
        "promo": false,
        "description": "Cappuccino crémeux avec mousse de lait onctueuse",
        "steps": [] // Pas de composition de base ni supplément
      },
      {
        "id": 302,
        "nom": "Expresso",
        "image": "expresso.jpeg",
        "prix": 3.0,
        "promo": false,
        "description": "Café expresso intense et corsé",
        "steps": []
      },
      {
        "id": 303,
        "nom": "Latte Macchiato",
        "image": "latte-macchiato.jpeg",
        "prix": 5.0,
        "promo": true,
        "description": "Latte macchiato avec des couches distinctes",
        "steps": []
      },
      {
        "id": 304,
        "nom": "Thé Vert",
        "image": "the-vert.jpeg",
        "prix": 3.5,
        "promo": false,
        "description": "Thé vert nature aux arômes délicats",
        "steps": []
      },
      {
        "id": 305,
        "nom": "Thé à la Menthe",
        "image": "the-menthe.jpeg",
        "prix": 4.0,
        "promo": false,
        "description": "Thé vert à la menthe fraîche rafraîchissant",
        "steps": []
      },
      {
        "id": 306,
        "nom": "Jus d'Orange Pressé",
        "image": "jus-orange-presse.jpeg",
        "prix": 6.0,
        "promo": false,
        "description": "Jus d'orange fraîchement pressé",
        "steps": []
      },
      {
        "id": 307,
        "nom": "Jus de Pomme",
        "image": "jus-pomme.jpeg",
        "prix": 5.0,
        "promo": false,
        "description": "Jus de pomme 100% pur fruit",
        "steps": []
      },
      {
        "id": 308,
        "nom": "Jus de Banane",
        "image": "jus-banane.jpeg",
        "prix": 5.5,
        "promo": false,
        "description": "Jus de banane naturel et onctueux",
        "steps": []
      },
      {
        "id": 309,
        "nom": "Smoothie Fraise",
        "image": "smoothie-fraise.jpeg",
        "prix": 7.0,
        "promo": true,
        "description": "Smoothie fraise-banane crémeux",
        "steps": []
      },
      {
        "id": 310,
        "nom": "Smoothie Tropical",
        "image": "smoothie-tropical.jpeg",
        "prix": 7.5,
        "promo": false,
        "description": "Smoothie mangue-ananas-passion",
        "steps": []
      },
      {
        "id": 311,
        "nom": "Milkshake Chocolat",
        "image": "milkshake-chocolat.jpeg",
        "prix": 6.5,
        "promo": false,
        "description": "Milkshake au chocolat onctueux",
        "steps": []
      },
      {
        "id": 312,
        "nom": "Milkshake Vanille",
        "image": "milkshake-vanille.jpeg",
        "prix": 6.5,
        "promo": false,
        "description": "Milkshake à la vanille gourmand",
        "steps": []
      },
      {
        "id": 313,
        "nom": "Limonade Maison",
        "image": "limonade-maison.jpeg",
        "prix": 4.5,
        "promo": false,
        "description": "Limonade fraîche maison au citron",
        "steps": []
      },
      {
        "id": 314,
        "nom": "Ice Tea Pêche",
        "image": "ice-teach-peche.jpeg",
        "prix": 4.0,
        "promo": false,
        "description": "Thé glacé à la pêche rafraîchissant",
        "steps": []
      },
      {
        "id": 315,
        "nom": "Eau Minérale",
        "image": "eau-minerale.jpeg",
        "prix": 2.5,
        "promo": false,
        "description": "Eau minérale naturelle 50cl",
        "steps": []
      },
      {
        "id": 316,
        "nom": "Eau Gazeuse",
        "image": "eau-gazeuse.jpeg",
        "prix": 3.0,
        "promo": false,
        "description": "Eau pétillante rafraîchissante",
        "steps": []
      }
    ]
  },
  {
    "id": 4,
    "nom": "Desserts",
    "image": "categorie_desserts.jpeg",
    "promo": true,
    "produits": [
      {
        "id": 401,
        "nom": "Fondant Chocolat",
        "image": "fondant-chocolat.jpeg",
        "prix": 7.0,
        "promo": false,
        "description": "Fondant au chocolat coulant",
        "steps": []
      },
      {
        "id": 402,
        "nom": "Tiramisu",
        "image": "tiramisu.jpeg",
        "prix": 6.5,
        "promo": true,
        "description": "Tiramisu traditionnel italien",
        "steps": []
      },
      {
        "id": 403,
        "nom": "Crème Brûlée",
        "image": "creme-brulee.jpeg",
        "prix": 6.0,
        "promo": false,
        "description": "Crème brûlée à la vanille",
        "steps": []
      }
    ]
  }


  // ... autres catégories
];