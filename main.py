import os
from google import genai
from dotenv import load_dotenv

# Cargar la clave de la IA desde el archivo .env
load_dotenv()

# Inicializar nuestro inventario en memoria
inventario = [
    {"nombre": "Huevos", "cantidad": 6, "ubicacion": "heladera"},
    {"nombre": "Leche", "cantidad": 1, "ubicacion": "heladera"},
    {"nombre": "Arroz", "cantidad": 1, "ubicacion": "alacena"},
    {"nombre": "Fideos", "cantidad": 2, "ubicacion": "alacena"},
    {"nombre": "Tomate en lata", "cantidad": 1, "ubicacion": "despensa"},
    {"nombre": "Cebolla", "cantidad": 3, "ubicacion": "heladera"}
]

def mostrar_inventario():
    print("\n--- 📦 INVENTARIO ---")
    for item in inventario:
        print(f"• {item['nombre']}: {item['cantidad']} (En: {item['ubicacion'].capitalize()})")

def pedir_receta_ia():
    # 1. Filtrar solo los ingredientes que tenemos disponibles
    disponibles = [item['nombre'] for item in inventario if item['cantidad'] > 0]
    lista_texto = ", ".join(disponibles)
    
    print("\n🤖 Conectando con la IA de Gemini...")
    
    try:
        # 2. Inicializar el cliente oficial de Gemini
        client = genai.Client()
        
        # 3. Diseñar el Prompt Base con las instrucciones
        prompt_base = f"""
        Eres un chef experto en cocina de aprovechamiento del hogar.
        Sugiere 2 recetas sencillas y rápidas basadas ESTRICTAMENTE en estos ingredientes disponibles: {lista_texto}.
        Puedes asumir que el usuario tiene sal, pimienta, agua y aceite.
        Sé breve y directo en los pasos.
        """
        
        # 4. Llamar al modelo recomendado actual (gemini-2.5-flash)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt_base,
        )
        
        print("\n✨ IDEAS DE RECETAS:");
        print(response.text)
        
    except Exception as e:
        print(f"\n❌ Error al conectar con la IA: {e}")
        print("Asegúrate de tener tu GEMINI_API_KEY configurada en el archivo .env")

# --- MENÚ DE PRUEBA ---
while True:
    print("\n=== MENÚ PRINCIPAL ===")
    print("1. Ver Inventario")
    print("2. Generar Recetas con IA")
    print("3. Salir")
    opcion = input("Elige una opción: ")
    
    if opcion == "1":
        mostrar_inventario()
    elif opcion == "2":
        pedir_receta_ia()
    elif opcion == "3":
        print("¡Hasta luego!")
        break
    else:
        print("Opción no válida.")
