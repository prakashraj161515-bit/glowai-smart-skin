"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Utensils, Droplets, Sparkles, CheckCircle2, MessageSquare, BrainCircuit, X, RefreshCcw, Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RoutinePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [gender, setGender] = useState<"male" | "female">("female");
  const [country, setCountry] = useState("India");
  const [latestScan, setLatestScan] = useState<any>(null);
  const [waterIntake, setWaterIntake] = useState(0);
  
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [aiFeedback, setAiFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [dietSeed, setDietSeed] = useState(0);
  const [activeAlarm, setActiveAlarm] = useState<string | null>(null);
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);

  const [activeTab, setActiveTab] = useState<"skincare" | "diet">("skincare");

  useEffect(() => {
    const savedGender = localStorage.getItem("velmora_user_gender") as "male" | "female";
    if (savedGender) setGender(savedGender);
    const savedCountry = localStorage.getItem("velmora_country");
    if (savedCountry) setCountry(savedCountry);
    const scanData = localStorage.getItem("velmora_analysis");
    if (scanData) setLatestScan(JSON.parse(scanData));

    const today = new Date().toLocaleDateString();
    const savedWaterDate = localStorage.getItem("velmora_water_date");
    if (savedWaterDate === today) {
      const savedWater = localStorage.getItem("velmora_water_intake");
      if (savedWater) setWaterIntake(parseInt(savedWater));
      const savedCompleted = localStorage.getItem("velmora_completed_routine");
      if (savedCompleted) setCompletedItems(JSON.parse(savedCompleted));
    } else {
      setWaterIntake(0);
      setCompletedItems([]);
      localStorage.setItem("velmora_water_date", today);
      localStorage.setItem("velmora_water_intake", "0");
      localStorage.setItem("velmora_completed_routine", "[]");
    }
    const savedReminders = localStorage.getItem("velmora_reminders");
    if (savedReminders) setReminders(JSON.parse(savedReminders));
    setActiveDay(new Date().getDay());
  }, []);

  const fullSchedule = useMemo(() => {
    const isOily = latestScan?.oil > 50;
    const isDry = latestScan?.oil < 30;
    const isAcneProne = latestScan?.acne > 30;
    const isPigmented = latestScan?.pigmentation > 40;

    const schedule = [];
    let fwName = "Deep Pore Charcoal Wash";
    let fwImage = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&q=80";
    let crName = "Hydrating Gel Moisturizer";
    let crImage = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80";

    if (isAcneProne) {
      fwName = "Salicylic Acid Purifying Wash";
      fwImage = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80";
      crName = "Zinc & Niacinamide Healing Gel";
      crImage = "https://images.unsplash.com/photo-1556228578-567ba127e37f?w=200&q=80";
    } else if (isDry) { 
      fwName = "Creamy Oat Cleanser"; 
      fwImage = "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80";
      crName = "Ceramide Rich Barrier Cream"; 
      crImage = "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=200&q=80";
    } else if (isOily) { 
      fwName = "Salicylic Acid Purifying Wash"; 
      fwImage = "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=200&q=80";
      crName = "Oil-Free Niacinamide Gel"; 
      crImage = "https://images.unsplash.com/photo-1556228578-567ba127e37f?w=200&q=80";
    } else if (isPigmented) { 
      fwName = "Vitamin C Brightening Wash"; 
      fwImage = "https://images.unsplash.com/photo-1611080626919-7cf5a969fc8f?w=200&q=80";
      crName = "Kojic Acid Night Repair"; 
      crImage = "https://images.unsplash.com/photo-1594125356715-c0852e690082?w=200&q=80";
    }

    schedule.push({ time: "08:00 AM", type: "skincare", name: fwName, label: "Morning Cleansing", image: fwImage, color: "bg-blue-50" });
    schedule.push({ time: "08:15 AM", type: "skincare", name: crName, label: "Day Protection Cream", image: crImage, color: "bg-blue-50" });
    schedule.push({ time: "01:00 PM", type: "skincare", name: "Aqua Fresh Face Wash", label: "Mid-Day Oil Control", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=80", color: "bg-cyan-50" });
    schedule.push({ time: "01:15 PM", type: "skincare", name: "Lightweight Hydrator", label: "Post-Wash Care", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80", color: "bg-cyan-50" });
    
    const countryDiets: Record<string, any[]> = {
      "India": [
        { b: "Papaya & Pomegranate", l: "Boiled Lauki (Bottle Gourd)", s: "Crunchy Gajar & Cucumber", d: "Steamed Palak Soup" },
        { b: "Seb (Apple) & Banana", l: "Sautéed Gobi & Matar", s: "Beetroot & Kheera Salad", d: "Mixed Veg Soup" },
        { b: "Watermelon (Tarbooj)", l: "Boiled Turai (Ridge Gourd)", s: "Ankurit Moong (Sprouts)", d: "Stir-fry Beans" },
        { b: "Guava (Amrud) Slices", l: "Steamed Patta Gobi", s: "Roasted Makhana (Fox Nuts)", d: "Gajar & Methi Sabzi" },
        { b: "Orange & Pomegranate", l: "Sautéed Kundru (Ivy Gourd)", s: "Radish (Mooli) Sticks", d: "Lauki Ka Soup" },
        { b: "Green Seb & Grapes", l: "Boiled Karela (Bitter Gourd)", s: "Steamed Moong Dal", d: "Pumpkin Stew" },
        { b: "Fresh Papaya Bowl", l: "Moringa Leaves Soup", s: "Cucumber & Mint Salad", d: "Mixed Dal Bowl" }
      ],
      "Pakistan": [
        { b: "Papaya & Pomegranate", l: "Boiled Lauki (Bottle Gourd)", s: "Crunchy Gajar & Cucumber", d: "Steamed Palak Soup" },
        { b: "Seb (Apple) & Banana", l: "Sautéed Gobi & Matar", s: "Beetroot & Kheera Salad", d: "Mixed Veg Soup" },
        { b: "Watermelon (Tarbooj)", l: "Boiled Turai (Ridge Gourd)", s: "Ankurit Moong (Sprouts)", d: "Stir-fry Beans" },
        { b: "Guava (Amrud) Slices", l: "Steamed Patta Gobi", s: "Roasted Makhana (Fox Nuts)", d: "Gajar & Methi Sabzi" },
        { b: "Orange & Pomegranate", l: "Sautéed Kundru (Ivy Gourd)", s: "Radish (Mooli) Sticks", d: "Lauki Ka Soup" },
        { b: "Green Seb & Grapes", l: "Boiled Karela (Bitter Gourd)", s: "Steamed Moong Dal", d: "Pumpkin Stew" },
        { b: "Fresh Papaya Bowl", l: "Moringa Leaves Soup", s: "Cucumber & Mint Salad", d: "Mixed Dal Bowl" }
      ],
      "Bangladesh": [
        { b: "Papaya & Pomegranate", l: "Boiled Lauki (Bottle Gourd)", s: "Crunchy Gajar & Cucumber", d: "Steamed Palak Soup" },
        { b: "Seb (Apple) & Banana", l: "Sautéed Gobi & Matar", s: "Beetroot & Kheera Salad", d: "Mixed Veg Soup" },
        { b: "Watermelon (Tarbooj)", l: "Boiled Turai (Ridge Gourd)", s: "Ankurit Moong (Sprouts)", d: "Stir-fry Beans" },
        { b: "Guava (Amrud) Slices", l: "Steamed Patta Gobi", s: "Roasted Makhana (Fox Nuts)", d: "Gajar & Methi Sabzi" },
        { b: "Orange & Pomegranate", l: "Sautéed Kundru (Ivy Gourd)", s: "Radish (Mooli) Sticks", d: "Lauki Ka Soup" },
        { b: "Green Seb & Grapes", l: "Boiled Karela (Bitter Gourd)", s: "Steamed Moong Dal", d: "Pumpkin Stew" },
        { b: "Fresh Papaya Bowl", l: "Moringa Leaves Soup", s: "Cucumber & Mint Salad", d: "Mixed Dal Bowl" }
      ],
      "USA": [
        { b: "Greek Yogurt & Berries", l: "Grilled Salmon & Asparagus", s: "Handful of Almonds", d: "Quinoa Veggie Bowl" },
        { b: "Avocado Toast", l: "Turkey Avocado Wrap", s: "Apple Slices with Peanut Butter", d: "Roasted Chicken & Broccoli" },
        { b: "Oatmeal with Walnuts", l: "Kale & Chickpea Salad", s: "Carrot Sticks & Hummus", d: "Baked Sweet Potato & Beans" },
        { b: "Smoothie Bowl", l: "Tuna Salad (No Mayo)", s: "Greek Yogurt", d: "Lentil Pasta & Zucchini" },
        { b: "Eggs & Spinach", l: "Chicken Breast & Quinoa", s: "Cottage Cheese & Peaches", d: "Grilled Shrimp & Salad" },
        { b: "Protein Pancakes", l: "Buddha Bowl with Tofu", s: "Trail Mix", d: "Mushroom & Kale Risotto" },
        { b: "Chia Seed Pudding", l: "Beef & Vegetable Stir-fry", s: "Hard Boiled Egg", d: "Roasted Vegetable Salad" }
      ],
      "Canada": [
        { b: "Greek Yogurt & Blueberries", l: "Grilled Salmon & Asparagus", s: "Handful of Walnuts", d: "Quinoa Veggie Bowl" },
        { b: "Avocado Toast", l: "Turkey & Spinach Wrap", s: "Apple Slices with Nut Butter", d: "Roasted Chicken & Broccoli" },
        { b: "Oatmeal with Almonds", l: "Kale & Chickpea Salad", s: "Carrot Sticks & Hummus", d: "Baked Sweet Potato & Beans" },
        { b: "Mixed Berry Smoothie", l: "Tuna Salad & Celery", s: "Greek Yogurt", d: "Lentil Soup & Zucchini" },
        { b: "Scrambled Eggs & Spinach", l: "Chicken Breast & Quinoa", s: "Cottage Cheese & Peaches", d: "Grilled Shrimp & Salad" },
        { b: "Protein Pancakes", l: "Buddha Bowl with Tofu", s: "Trail Mix", d: "Mushroom & Kale Stew" },
        { b: "Chia Seed Pudding", l: "Turkey & Vegetable Stir-fry", s: "Hard Boiled Egg", d: "Roasted Vegetable Salad" }
      ],
      "UK": [
        { b: "Porridge with Honey", l: "Baked Potato with Beans", s: "Pear Slices", d: "Vegetable Shepherds Pie" },
        { b: "Poached Eggs on Rye", l: "Roast Beef & Root Veg", s: "Oatcakes & Cheese", d: "Cod & Mushy Peas" },
        { b: "Bran Flakes & Milk", l: "Chicken & Barley Soup", s: "Yogurt & Walnuts", d: "Grilled Sausages & Mash" },
        { b: "Muesli with Raspberries", l: "Ploughman's Lunch", s: "Apple & Cheddar", d: "Steak & Kidney Pie" },
        { b: "Scrambled Eggs", l: "Lamb & Vegetable Stew", s: "Scone & Jam", d: "Fish Cakes & Greens" },
        { b: "Grilled Mushrooms & Toast", l: "Coronation Chicken Salad", s: "Tea & Digestive", d: "Cottage Pie" },
        { b: "Kipper on Toast", l: "Lancashire Hotpot", s: "Blueberry Muffin", d: "Bangers & Mash" }
      ],
      "Australia": [
        { b: "Greek Yogurt & Passion Fruit", l: "Grilled Barramundi & Asparagus", s: "Macadamia Nuts", d: "Quinoa Veggie Bowl" },
        { b: "Avocado & Poached Egg Toast", l: "Grilled Chicken & Beetroot Wrap", s: "Apple Slices", d: "Roasted Salmon & Broccoli" },
        { b: "Oatmeal with Chia Seeds", l: "Kale & Chickpea Salad", s: "Carrot Sticks & Hummus", d: "Baked Sweet Potato" },
        { b: "Mango Smoothie Bowl", l: "Tuna & Spinach Salad", s: "Greek Yogurt", d: "Lentil Soup" },
        { b: "Scrambled Eggs & Tomatoes", l: "Grilled Beef & Quinoa", s: "Cottage Cheese & Berries", d: "Grilled Shrimp & Asparagus" },
        { b: "Protein Pancakes with Honey", l: "Tofu Buddha Bowl", s: "Handful of Almonds", d: "Mushroom Risotto" },
        { b: "Chia Seed Pudding", l: "Turkey & Vegetable Stir-fry", s: "Hard Boiled Egg", d: "Roasted Vegetable Salad" }
      ],
      "UAE": [
        { b: "Dates & Fresh Figs", l: "Grilled Lamb & Hummus", s: "Cucumber & Yogurt Dip", d: "Lentil Soup" },
        { b: "Fattoush Salad", l: "Chicken Shawarma Plate", s: "Handful of Pistachios", d: "Roasted Cauliflower Soup" },
        { b: "Shakshuka (Eggs & Tomatoes)", l: "Baked Sea Bass & Veggies", s: "Sautéed Chickpeas", d: "Tabbouleh & Grilled Halloumi" },
        { b: "Fresh Papaya & Mint", l: "Grilled Chicken & Tabbouleh", s: "Roasted Pumpkin Seeds", d: "Vegetable Harira Soup" },
        { b: "Dates & Almond Milk Smoothie", l: "Spiced Chickpea Salad", s: "Walnut & Pomegranate", d: "Fish Sayadiyah & Salad" },
        { b: "Labneh with Olive Oil & Tomato", l: "Grilled Kebabs & Grilled Veggies", s: "Dried Apricots", d: "Baked Eggplant Stew" },
        { b: "Fresh Grapefruit & Pomegranate", l: "Okra Stew (Bamia) & Brown Rice", s: "Roasted Makhana", d: "Mixed Vegetable Soup" }
      ],
      "Singapore": [
        { b: "Fresh Papaya & Pomegranate", l: "Steamed Chicken & Pak Choy", s: "Roasted Edamame", d: "Clear Vegetable Soup" },
        { b: "Mango Slices & Dragon Fruit", l: "Stir-fry Tofu & Broccoli", s: "Cucumber & Mint Sticks", d: "Miso Soup with Seaweed" },
        { b: "Watermelon Bowl", l: "Sautéed Spinach & Mushroom", s: "Boiled Soybeans (Edamame)", d: "Steamed Fish & Green Beans" },
        { b: "Guava Slices", l: "Braised Tofu with Vegetables", s: "Roasted Lotus Seeds", d: "Mixed Mushroom Soup" },
        { b: "Orange & Pomegranate", l: "Stir-fry Bitter Gourd & Egg", s: "Radish & Cucumber Salad", d: "Lotus Root Soup" },
        { b: "Apple & Green Grapes", l: "Sautéed Mustard Greens", s: "Steamed Moong Dal Sprouts", d: "Pumpkin Soup" },
        { b: "Fresh Papaya Bowl", l: "Moringa & Spinach Soup", s: "Cucumber Salad", d: "Mixed Bean Stew" }
      ],
      "Germany": [
        { b: "Greek Yogurt & Blueberries", l: "Baked Trout & Green Asparagus", s: "Handful of Walnuts", d: "Quinoa Veggie Bowl" },
        { b: "Pumpernickel with Avocado", l: "Turkey & Spinach Salad", s: "Apple Slices", d: "Roasted Chicken & Brussels Sprouts" },
        { b: "Oatmeal with Linseeds", l: "Cabbage & Chickpea Salad", s: "Carrot Sticks & Quark", d: "Baked Sweet Potato" },
        { b: "Berry Smoothie Bowl", l: "Herring Salad & Radish", s: "Greek Yogurt", d: "Lentil Soup" },
        { b: "Boiled Eggs & Spinach", l: "Chicken Breast & Broccoli", s: "Cottage Cheese", d: "Roasted Vegetable Salad" },
        { b: "Protein Pancakes", l: "Tofu & Roasted Veggies", s: "Pumpkin Seeds", d: "Mushroom Stew" },
        { b: "Chia Seed Pudding", l: "Roasted Turkey & Asparagus", s: "Hard Boiled Egg", d: "Potato Soup with Herbs" }
      ],
      "France": [
        { b: "Greek Yogurt & Fresh Berries", l: "Grilled Salmon & Green Beans", s: "Handful of Almonds", d: "Quinoa Veggie Salad" },
        { b: "Avocado & Tomato Tartine", l: "Chicken Paillard & Spinach", s: "Apple Slices", d: "Roasted Sea Bass & Ratatouille" },
        { b: "Oatmeal with Walnuts", l: "Lentil Salad with Tomatoes", s: "Carrot Sticks & Hummus", d: "Baked Sweet Potato" },
        { b: "Fresh Melon Bowl", l: "Tuna Salad & Cucumber", s: "Greek Yogurt", d: "Vegetable Soup" },
        { b: "Omelette with Herbs", l: "Grilled Chicken & Quinoa", s: "Cottage Cheese & Peaches", d: "Grilled Shrimp & Asparagus" },
        { b: "Chia Seed Pudding", l: "Baked Tofu & Zucchini", s: "Walnuts", d: "Mushroom & Leek Stew" },
        { b: "Fresh Grapefruit Bowl", l: "Turkey Stir-fry with Veggies", s: "Hard Boiled Egg", d: "Roasted Vegetable Salad" }
      ],
      "Italy": [
        { b: "Greek Yogurt & Blueberries", l: "Grilled Sea Bass & Spinach", s: "Handful of Walnuts", d: "Quinoa Veggie Salad" },
        { b: "Avocado & Tomato Toast", l: "Chicken Caprese Salad", s: "Apple Slices", d: "Roasted Salmon & Asparagus" },
        { b: "Oatmeal with Almonds", l: "White Bean & Tomato Salad", s: "Carrot Sticks & Hummus", d: "Baked Sweet Potato" },
        { b: "Fresh Fig & Melon Bowl", l: "Tuna Salad & Fennel", s: "Greek Yogurt", d: "Minestrone Vegetable Soup" },
        { b: "Frittata with Herbs & Spinach", l: "Grilled Chicken & Broccoli", s: "Cottage Cheese & Peaches", d: "Grilled Shrimp & Salad" },
        { b: "Chia Seed Pudding", l: "Baked Tofu & Zucchini", s: "Walnuts", d: "Mushroom Stew" },
        { b: "Fresh Grapefruit", l: "Turkey & Veggie Stir-fry", s: "Hard Boiled Egg", d: "Roasted Vegetable Salad" }
      ],
      "Spain": [
        { b: "Greek Yogurt & Berries", l: "Grilled Sea Bass & Green Beans", s: "Handful of Almonds", d: "Quinoa Veggie Bowl" },
        { b: "Pan con Tomate & Avocado", l: "Chicken & Asparagus Salad", s: "Apple Slices", d: "Roasted Cod & Escalivada" },
        { b: "Oatmeal with Walnuts", l: "Chickpea & Spinach Stew", s: "Carrot Sticks & Hummus", d: "Baked Sweet Potato" },
        { b: "Fresh Melon Bowl", l: "Tuna & Tomato Salad", s: "Greek Yogurt", d: "Gazpacho Soup" },
        { b: "Scrambled Eggs with Zucchini", l: "Grilled Chicken & Salad", s: "Cottage Cheese", d: "Grilled Shrimp & Broccoli" },
        { b: "Chia Seed Pudding", l: "Baked Tofu & Peppers", s: "Walnuts", d: "Mushroom Stew" },
        { b: "Fresh Oranges Bowl", l: "Turkey & Vegetable Stir-fry", s: "Hard Boiled Egg", d: "Roasted Vegetable Salad" }
      ],
      "Japan": [
        { b: "Miso Soup & Silken Tofu", l: "Grilled Salmon & Edamame", s: "Fresh Apple Slices", d: "Steamed Spinach & Rice" },
        { b: "Fresh Papaya & Grapes", l: "Stir-fry Tofu & Shiitake", s: "Cucumber Salad with Wakame", d: "Miso Soup with Clams" },
        { b: "Fresh Watermelon Bowl", l: "Sautéed Spinach & Eggplant", s: "Boiled Edamame Seeds", d: "Steamed Cod & Green Beans" },
        { b: "Persimmon or Pear Slices", l: "Braised Tofu with Vegetables", s: "Roasted Soy Nuts", d: "Mixed Mushroom Soup" },
        { b: "Orange & Pomegranate", l: "Stir-fry Bitter Gourd & Egg", s: "Radish Salad with Sesame", d: "Clear Seaweed Soup" },
        { b: "Apple & Green Grapes", l: "Sautéed Bok Choy & Ginger", s: "Steamed Moong Sprouts", d: "Pumpkin Soup (Kabocha)" },
        { b: "Fresh Papaya Bowl", l: "Moringa & Spinach Soup", s: "Cucumber Salad", d: "Mixed Bean Stew" }
      ],
      "South Korea": [
        { b: "Seaweed Soup & Silken Tofu", l: "Grilled Salmon & Steamed Spinach", s: "Fresh Apple Slices", d: "Steamed Barley Rice" },
        { b: "Fresh Papaya & Grapes", l: "Stir-fry Tofu & Shiitake", s: "Cucumber Salad with Sesame", d: "Doenjang Soup with Tofu" },
        { b: "Fresh Watermelon Bowl", l: "Sautéed Spinach & Eggplant", s: "Boiled Edamame Seeds", d: "Steamed Cod & Sprouts" },
        { b: "Asian Pear Slices", l: "Braised Tofu with Vegetables", s: "Roasted Soy Nuts", d: "Mixed Mushroom Soup" },
        { b: "Orange & Pomegranate", l: "Stir-fry Bitter Gourd & Egg", s: "Radish Salad with Sesame", d: "Clear Seaweed Soup" },
        { b: "Apple & Green Grapes", l: "Sautéed Bok Choy & Garlic", s: "Steamed Moong Sprouts", d: "Pumpkin Soup (Hobak-juk)" },
        { b: "Fresh Papaya Bowl", l: "Moringa & Spinach Soup", s: "Cucumber Salad", d: "Mixed Bean Stew" }
      ],
      "Brazil": [
        { b: "Greek Yogurt & Fresh Berries", l: "Grilled Sea Bass & Green Beans", s: "Brazil Nuts", d: "Quinoa Veggie Salad" },
        { b: "Avocado & Tomato Tartine", l: "Chicken Paillard & Spinach", s: "Apple Slices", d: "Roasted Sea Bass & Ratatouille" },
        { b: "Oatmeal with Walnuts", l: "Black Bean Salad with Tomato", s: "Carrot Sticks & Hummus", d: "Baked Sweet Potato" },
        { b: "Fresh Papaya & Mango Bowl", l: "Tuna Salad & Cucumber", s: "Greek Yogurt", d: "Vegetable Soup" },
        { b: "Scrambled Eggs & Tomatoes", l: "Grilled Chicken & Quinoa", s: "Cottage Cheese & Peaches", d: "Grilled Shrimp & Salad" },
        { b: "Chia Seed Pudding", l: "Baked Tofu & Zucchini", s: "Walnuts", d: "Mushroom Stew" },
        { b: "Fresh Grapefruit Bowl", l: "Turkey Stir-fry with Veggies", s: "Hard Boiled Egg", d: "Roasted Vegetable Salad" }
      ]
    };

    // Fallback to India diet if country not found
    const diets = countryDiets[country] || countryDiets["India"];
    
    // Diet now depends on the active day AND the refresh seed for shuffling
    const diet = diets[(activeDay + dietSeed) % 7];

    const getDietImage = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("papaya")) return "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&q=80";
      if (n.includes("apple") || n.includes("seb") || n.includes("pear") || n.includes("persimmon")) return "https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?w=400&q=80";
      if (n.includes("banana")) return "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400&q=80";
      if (n.includes("watermelon") || n.includes("tarbooj")) return "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400&q=80";
      if (n.includes("pomegranate") || n.includes("anar") || n.includes("grapefruit")) return "https://images.unsplash.com/photo-1580636521086-7b0c742dd567?w=400&q=80";
      if (n.includes("orange") || n.includes("lemon") || n.includes("citrus")) return "https://images.unsplash.com/photo-1599076480086-fd46f116eb8c?w=400&q=80";
      if (n.includes("guava") || n.includes("amrud")) return "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=400&q=80";
      if (n.includes("fruit") || n.includes("grapes") || n.includes("angoor") || n.includes("berries") || n.includes("berry") || n.includes("peaches") || n.includes("raspberries") || n.includes("blueberry") || n.includes("figs") || n.includes("mango") || n.includes("dragon") || n.includes("melon") || n.includes("passion fruit")) return "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&q=80";
      if (n.includes("dates") || n.includes("apricots")) return "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&q=80";
      if (n.includes("salad") || n.includes("carrot") || n.includes("cucumber") || n.includes("gajar") || n.includes("kheera") || n.includes("mooli") || n.includes("beetroot") || n.includes("radish") || n.includes("asparagus") || n.includes("broccoli") || n.includes("kale") || n.includes("spinach") || n.includes("palak") || n.includes("celery") || n.includes("cabbage") || n.includes("brussels") || n.includes("greens") || n.includes("leaves") || n.includes("moringa") || n.includes("chok") || n.includes("pak choy") || n.includes("bok choy") || n.includes("mustard greens") || n.includes("peppers") || n.includes("fennel") || n.includes("gourd") || n.includes("lauki") || n.includes("pumpkin") || n.includes("turai") || n.includes("karela") || n.includes("kundru") || n.includes("okra") || n.includes("bamia") || n.includes("eggplant")) return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80";
      if (n.includes("sprouts") || n.includes("moong") || n.includes("makhana") || n.includes("nuts") || n.includes("seed") || n.includes("seeds") || n.includes("almond") || n.includes("almonds") || n.includes("walnut") || n.includes("walnuts") || n.includes("trail mix") || n.includes("ankurit") || n.includes("chickpea") || n.includes("chickpeas") || n.includes("edamame") || n.includes("soybeans") || n.includes("pistachios") || n.includes("linseeds")) return "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=400&q=80";
      if (n.includes("soup") || n.includes("dal") || n.includes("stew") || n.includes("curry") || n.includes("harira") || n.includes("miso") || n.includes("seaweed") || n.includes("doenjang") || n.includes("gazpacho") || n.includes("minestrone")) return "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80";
      if (n.includes("tofu") || n.includes("quinoa") || n.includes("risotto") || n.includes("hotpot") || n.includes("mash") || n.includes("potato") || n.includes("potatoes") || n.includes("rice") || n.includes("barley") || n.includes("mushrooms") || n.includes("shiitake") || n.includes("gobi") || n.includes("matar") || n.includes("veg") || n.includes("veggie") || n.includes("sabzi") || n.includes("beans") || n.includes("peas") || n.includes("zucchini") || n.includes("sweet potato")) return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
      if (n.includes("yogurt") || n.includes("oatmeal") || n.includes("porridge") || n.includes("milk") || n.includes("pudding") || n.includes("cheese") || n.includes("cottage") || n.includes("chia") || n.includes("muesli") || n.includes("labneh") || n.includes("quark") || n.includes("flakes")) return "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80";
      if (n.includes("toast") || n.includes("bread") || n.includes("pancake") || n.includes("pancakes") || n.includes("wrap") || n.includes("pie") || n.includes("muffin") || n.includes("egg") || n.includes("eggs") || n.includes("scone") || n.includes("tea") || n.includes("digestive") || n.includes("oatcakes") || n.includes("pumpernickel") || n.includes("pan con tomate") || n.includes("tartine") || n.includes("frittata")) return "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80";
      if (n.includes("chicken") || n.includes("beef") || n.includes("turkey") || n.includes("salmon") || n.includes("shrimp") || n.includes("cod") || n.includes("sausages") || n.includes("lamb") || n.includes("fish") || n.includes("meat") || n.includes("steak") || n.includes("kipper") || n.includes("kebabs") || n.includes("shawarma") || n.includes("barramundi") || n.includes("sea bass") || n.includes("trout") || n.includes("herring")) return "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80";
      return "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&q=80";
    };

    const waterImg = "/water-glass.png";
    schedule.push({ time: "07:00 AM", type: "diet", name: "Glass 1: Wake Up Water", label: "Metabolism Boost", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "08:30 AM", type: "diet", name: "Glass 2: Post-Breakfast", label: "Morning Hydration", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "09:00 AM", type: "diet", name: diet.b, label: "Breakfast", image: getDietImage(diet.b), color: "bg-emerald-50" });
    schedule.push({ time: "11:00 AM", type: "diet", name: "Glass 3: Mid-Morning", label: "Brain Power", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "01:00 PM", type: "diet", name: "Glass 4: Pre-Lunch", label: "Digestion Support", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "01:30 PM", type: "diet", name: diet.l, label: "Balanced Lunch", image: getDietImage(diet.l), color: "bg-emerald-50" });
    schedule.push({ time: "04:00 PM", type: "diet", name: "Glass 5: Afternoon", label: "Energy Lift", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "05:00 PM", type: "diet", name: diet.s, label: "Evening Snack", image: getDietImage(diet.s), color: "bg-orange-50" });
    schedule.push({ time: "06:00 PM", type: "diet", name: "Glass 6: Evening", label: "Cravings Control", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "08:00 PM", type: "diet", name: "Glass 7: Pre-Dinner", label: "Weight Management", image: waterImg, color: "bg-blue-50" });
    schedule.push({ time: "08:30 PM", type: "diet", name: diet.d, label: "Light Dinner", image: getDietImage(diet.d), color: "bg-emerald-50" });
    schedule.push({ time: "09:35 PM", type: "skincare", name: "Derm-Grade Gentle Cleanser", label: "Doctor's Night Wash", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&q=80", color: "bg-indigo-50" });
    schedule.push({ time: "10:00 PM", type: "skincare", name: crName.includes("Night") ? crName : "Hyaluronic Night Repair", label: "Night Recovery Cream", image: crImage, color: "bg-indigo-50" });
    schedule.push({ time: "10:30 PM", type: "diet", name: "Glass 8: Night", label: "Cell Recovery", image: waterImg, color: "bg-blue-50" });

    return schedule;
  }, [latestScan, dietSeed, activeDay, country]);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      const currentTimeStr = `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

      fullSchedule.forEach(item => {
        if (reminders.includes(item.name) && item.time === currentTimeStr && !activeAlarm) {
          triggerAlarm(item.name);
        }
      });
    };

    const interval = setInterval(checkTime, 30000);
    return () => clearInterval(interval);
  }, [reminders, activeAlarm, fullSchedule]);

  const toggleItem = (name: string) => {
    const updated = completedItems.includes(name) ? completedItems.filter(i => i !== name) : [...completedItems, name];
    setCompletedItems(updated);
    localStorage.setItem("velmora_completed_routine", JSON.stringify(updated));
  };

  const toggleReminder = (name: string) => {
    const updated = reminders.includes(name) ? reminders.filter(i => i !== name) : [...reminders, name];
    setReminders(updated);
    localStorage.setItem("velmora_reminders", JSON.stringify(updated));
    if (!reminders.includes(name)) {
      const chime = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      chime.volume = 0.2;
      chime.play().catch(() => {});
    }
  };

  const triggerAlarm = (name: string) => {
    if (activeAlarm) return;
    setActiveAlarm(name);
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
    audio.loop = true;
    audio.play().catch(() => {});
    setAlarmAudio(audio);

    // Auto-stop alarm after 1 minute (60000ms)
    const timeoutId = setTimeout(() => {
      stopAlarm();
    }, 60000);
    (window as any)._alarmTimeoutId = timeoutId;
  };

  const stopAlarm = () => {
    if ((window as any)._alarmTimeoutId) {
      clearTimeout((window as any)._alarmTimeoutId);
      (window as any)._alarmTimeoutId = null;
    }
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
      setAlarmAudio(null);
    }
    setActiveAlarm(null);
  };

  const formatMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 font-bold">$1</strong>');
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <div key={i} className="flex gap-2 mb-1.5 ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F88E7D] mt-2 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[*-]\s*/, "") }} />
          </div>
        );
      }
      return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  const getDailyFeedback = async () => {
    setIsAnalyzing(true);
    setAiFeedback("");
    setShowFeedback(true);
    
    const dietItems = fullSchedule.filter(i => i.type === "diet" && !i.name.includes("Glass"));
    const completedDiet = dietItems.filter(item => completedItems.includes(item.name));
    const pendingDiet = dietItems.filter(item => !completedItems.includes(item.name));

    const summaryText = `
**Today's Diet Summary:**
${completedDiet.length > 0 ? "✅ **Completed:**\n" + completedDiet.map(i => "- " + i.name).join("\n") : ""}
${pendingDiet.length > 0 ? "⏳ **Pending:**\n" + pendingDiet.map(i => "- " + i.name).join("\n") : ""}
    `;
    
    // We'll store the summary in a temp variable or state if needed, but let's just use aiFeedback
    // for the final combined text. During loading, we'll show the summary + a spinner for the analysis.
    setAiFeedback(summaryText); 

    const context = `User from ${country} is following a ${gender} diet plan. Today they completed ${completedDiet.length} out of ${dietItems.length} diet items. Completed: ${completedDiet.map(i=>i.name).join(", ")}. Pending: ${pendingDiet.map(i=>i.name).join(", ")}. Provide brief, encouraging feedback.`;
    
    try {
      const res = await fetch("/api/generate", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ customPrompt: context }) 
      });
      const data = await res.json();
      setAiFeedback(summaryText + "\n\n**AI Analysis:**\n" + (data.text || "Great effort today! Keep sticking to the plan for better results. ✨"));
    } catch {
      setAiFeedback(summaryText + "\n\n**AI Analysis:**\nGreat effort today! Keep sticking to the plan for better results. ✨");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const days = [{ label: "SUN" }, { label: "MON" }, { label: "TUE" }, { label: "WED" }, { label: "THU" }, { label: "FRI" }, { label: "SAT" }];

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#FDF5F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F88E7D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF5F2] font-outfit pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between">
        <Link href="/" className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm border border-[#F3EAE8]">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-slate-800">Daily Schedule</h1>
          <p className="text-[10px] text-[#F88E7D] font-black uppercase tracking-widest">{gender} &bull; {country}</p>
        </div>
        <button onClick={() => setDietSeed(s => s + 1)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#F88E7D] shadow-sm border border-[#F3EAE8] active:scale-90 transition-transform">
          <RefreshCcw size={20} />
        </button>
      </header>

      <div className="px-4 grid grid-cols-7 gap-1 mb-8">
        {days.map((day, idx) => (
          <button key={idx} onClick={() => setActiveDay(idx)} className={cn("py-3 rounded-[20px] flex flex-col items-center justify-center gap-1 transition-all", activeDay === idx ? "bg-[#F88E7D] text-white shadow-lg shadow-orange-500/20" : "bg-white text-slate-400 border border-[#F3EAE8]")}>
            <span className="text-[9px] font-black tracking-tighter">{day.label}</span>
            {activeDay === idx && <div className="w-1 h-1 rounded-full bg-white mt-0.5" />}
          </button>
        ))}
      </div>

      <div className="px-6 space-y-4">
        <h2 className="text-[20px] font-bold text-slate-800 mb-4">Today&apos;s Progress</h2>
        <div className="bg-white rounded-[32px] p-6 border border-[#F3EAE8] shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500"><Droplets size={20} /></div>
              <div><h3 className="text-[14px] font-bold text-slate-900">Water</h3><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{waterIntake}ml / 3000ml</p></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { if(waterIntake >= 250) { const n = waterIntake - 250; setWaterIntake(n); localStorage.setItem("velmora_water_intake", n.toString()); } }} className="bg-slate-50 px-3 py-1.5 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">-250ml</button>
              <button onClick={() => { const n = waterIntake + 250; setWaterIntake(n); localStorage.setItem("velmora_water_intake", n.toString()); }} className="bg-blue-50 px-3 py-1.5 rounded-xl text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-colors">+250ml</button>
            </div>
          </div>
          <div className="flex gap-1.5 h-1.5">
            {[250,500,750,1000,1250,1500,1750,2000,2250,2500,2750,3000].map((i) => (<div key={i} className={cn("flex-1 rounded-full transition-all duration-500", i <= waterIntake ? "bg-blue-400" : "bg-slate-100")} />))}
          </div>
        </div>
        
        <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] mb-8">
          <button onClick={() => setActiveTab("skincare")} className={cn("flex-1 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all", activeTab === "skincare" ? "bg-white text-[#F88E7D] shadow-sm" : "text-slate-400")}>Facewash</button>
          <button onClick={() => setActiveTab("diet")} className={cn("flex-1 py-4 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all", activeTab === "diet" ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400")}>Diet Plan</button>
        </div>

        <div className="space-y-6 relative">
          <div className="absolute left-[31px] top-4 bottom-4 w-0.5 bg-slate-100" />
          {fullSchedule.filter(item => item.type === activeTab).map((item, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="flex items-center gap-6 relative">
              <div className="w-16 flex-shrink-0 text-right">
                <p className="text-[13px] font-bold text-slate-800">{item.time.split(' ')[0]}</p>
                <p className="text-[9px] font-black text-slate-400 tracking-tight uppercase">{item.time.split(' ')[1]}</p>
              </div>
              <div className={cn("absolute left-[28px] w-2 h-2 rounded-full border-2 border-white z-10", completedItems.includes(item.name) ? "bg-emerald-500" : (item.type === "skincare" ? "bg-[#F88E7D]" : "bg-emerald-500 opacity-30"))} />
              <div onClick={() => toggleItem(item.name)} className={cn("flex-1 p-5 rounded-[32px] flex items-center gap-4 border transition-all cursor-pointer relative overflow-hidden bg-white shadow-sm hover:border-[#F88E7D]/30", completedItems.includes(item.name) && "opacity-60")}>
                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden flex-shrink-0 shadow-inner"><img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=400&q=80"; }} /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <button onClick={(e) => { e.stopPropagation(); toggleReminder(item.name); }} className={cn("p-1.5 rounded-full", reminders.includes(item.name) ? "bg-slate-800 text-white" : "text-slate-300")}>
                      {reminders.includes(item.name) ? <Bell size={14} className="animate-bounce fill-white" /> : <BellOff size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className={cn("text-[14px] font-bold text-slate-800 leading-snug", completedItems.includes(item.name) && "line-through")}>{item.name}</p>
                    <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center", completedItems.includes(item.name) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200")}>{completedItems.includes(item.name) && <CheckCircle2 size={16} />}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeAlarm && (
          <motion.div initial={{scale:0.8, opacity:0, x: "-50%"}} animate={{scale:1, opacity:1, x: "-50%"}} exit={{scale:0.8, opacity:0, x: "-50%"}} className="fixed top-0 bottom-0 left-1/2 w-full max-w-[430px] z-[200] bg-[#F88E7D]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white">
            <Bell size={48} className="animate-bounce mb-8" />
            <h2 className="text-4xl font-black mb-2">Time for {activeAlarm}!</h2>
            <button onClick={stopAlarm} className="w-full h-20 bg-white text-[#F88E7D] rounded-[32px] text-2xl font-black uppercase shadow-2xl active:scale-95 transition-transform">Stop Alarm</button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <motion.div initial={{opacity:0, y: 100, x: "-50%"}} animate={{opacity:1, y: 0, x: "-50%"}} exit={{opacity:0, y: 100, x: "-50%"}} className="fixed top-0 left-1/2 w-full max-w-[430px] h-[100dvh] z-[200] bg-white flex flex-col p-8 pb-12 shadow-2xl">
            <div className="flex justify-between mb-8"><h3 className="text-lg font-black">AI Skin Coach</h3><button onClick={()=>setShowFeedback(false)}><X size={24} /></button></div>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
              {aiFeedback && formatMarkdown(aiFeedback)}
              
              {isAnalyzing && (
                <div className="mt-8 p-6 bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative w-12 h-12">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-[3px] border-white border-t-[#F88E7D] rounded-full shadow-sm" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles size={16} className="text-[#F88E7D] animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse mb-1">
                      AI Skin Analysis
                    </p>
                    <p className="text-[12px] font-bold text-slate-500 italic">
                      Evaluating your effort...
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button onClick={()=>setShowFeedback(false)} className="w-full h-16 flex-shrink-0 bg-[#F88E7D] text-white rounded-[24px] font-black uppercase shadow-xl mt-8 active:scale-95 transition-transform">Got it!</button>
          </motion.div>
        )}
      </AnimatePresence>

      {!showFeedback && !activeAlarm && (
        <button onClick={getDailyFeedback} className="fixed bottom-32 left-1/2 translate-x-[110px] w-16 h-16 bg-primary-gradient rounded-full flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 z-50 animate-pulse active:scale-90 transition-transform">
          <Sparkles size={32} className="fill-white" />
        </button>
      )}
    </div>
  );
}
