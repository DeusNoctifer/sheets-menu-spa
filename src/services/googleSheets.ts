import Papa from 'papaparse';
import type { Product, Ingredient, IngredientCategory } from '../types/product';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSf-ehQbxC87zfQkwQlhQ_SXiMzFiKmxZ3amTS1zV6oPJiP2GPhSh3g8zUXtsgqiW9fkkpoFmFC6zCo/pub?gid=0&single=true&output=csv';

const INGREDIENTS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSf-ehQbxC87zfQkwQlhQ_SXiMzFiKmxZ3amTS1zV6oPJiP2GPhSh3g8zUXtsgqiW9fkkpoFmFC6zCo/pub?gid=500777&single=true&output=csv';

export async function fetchProducts(): Promise<Product[]> {
    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Error al conectar con Sheets');

        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results: Papa.ParseResult<any>) => {
                    const rawData = results.data as any[];

                    const products = rawData.map((data: any, index: number) => {
                        const rawName = (data.Nombre || data.nombre || '').trim();
                        const safeName = rawName || `Producto-Sin-Nombre-${index}`;

                        const safeId = data.id?.trim() || safeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

                        const rawPriceStr = String(data.Precio || data.precio || '0').replace(/[^0-9]/g, '');
                        const price = parseInt(rawPriceStr, 10);
                        const isValidPrice = !isNaN(price) && price > 0;

                        const isAvailableInSheet = ['SÍ', 'TRUE', '1'].includes(
                            String(data.Disponibilidad || data.disponibilidad).toUpperCase()
                        );

                        const isAvailable = isAvailableInSheet && isValidPrice;

                        if (isAvailableInSheet && !isValidPrice) {
                            console.warn(`[Don Melona] Producto desactivado por precio inválido: ${safeName}`);
                        }

                        return {
                            id: safeId,
                            name: safeName,
                            description: (data.Descripción || data.descripción || '').trim(),
                            price: price || 0,
                            category: (data.Categoría || data.categoría || 'OTRO').toUpperCase().replace(/\s+/g, ' ').trim(),
                            image: (data.Imagen || data.imagen || '🍔').trim(),
                            isAvailable: isAvailable
                        };
                    });

                    resolve(products);
                },
                error: (error: Error) => {
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

export async function fetchIngredients(): Promise<Ingredient[]> {
    try {
        const response = await fetch(INGREDIENTS_CSV_URL);
        if (!response.ok) throw new Error('Error al conectar con Sheets');

        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results: Papa.ParseResult<any>) => {
                    const rawData = results.data as any[];

                    const ingredients = rawData.map((data: any, index: number) => {
                        const rawName = (data.Nombre || '').trim();
                        
                        const safeId = `ing-${rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index}`;
                        
                        const rawPriceStr = String(data.PrecioExtra || '0').replace(/[^0-9]/g, '');
                        const extraPrice = parseInt(rawPriceStr, 10) || 0;

                        // 1. Limpiamos espacios y pasamos a mayúsculas
                        const rawCategory = (data.Categoría || '').trim().toUpperCase();
                        
                        // 2. Quitamos tildes (convierte PROTEÍNA en PROTEINA)
                        const cleanCategory = rawCategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                        // 3. Mapeamos el español al tipo exacto de TypeScript
                        let category: IngredientCategory = 'TOPPING';
                        
                        if (cleanCategory === 'BASE') {
                            category = 'BASE';
                        } else if (cleanCategory === 'PROTEINA' || cleanCategory === 'PROTEIN') {
                            category = 'PROTEIN';
                        } else if (cleanCategory === 'TOPPING') {
                            category = 'TOPPING';
                        } else if (cleanCategory === 'SALSA' || cleanCategory === 'SAUCE') {
                            category = 'SAUCE';
                        }

                        const isAvailable = ['SÍ', 'TRUE', '1'].includes(
                            String(data.Disponibilidad || '').toUpperCase()
                        );

                        return {
                            id: safeId,
                            name: rawName,
                            category: category,
                            extraPrice: extraPrice,
                            isAvailable: isAvailable
                        };
                    });

                    resolve(ingredients.filter(ing => ing.isAvailable));
                },
                error: (error: Error) => reject(error)
            });
        });
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}