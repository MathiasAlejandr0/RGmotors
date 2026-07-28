# Fotos 360° de los vehículos (giro real)

Este directorio guarda las fotos con las que la ficha del auto arma el **giro 360° real**.

## Cómo agregar el 360° de un auto

1. Toma entre **24 y 36 fotos** dando una vuelta completa alrededor del vehículo
   (idealmente con el auto sobre un plato giratorio, o caminando tú alrededor a
   pasos parejos). Mantén la misma distancia, altura y encuadre en todas.
2. Renómbralas en orden: `001.jpg`, `002.jpg`, `003.jpg`, … (3 dígitos).
3. Crea una carpeta con el **slug** del auto y déjalas ahí:

   ```
   public/cars/spin/<slug>/001.jpg
   public/cars/spin/<slug>/002.jpg
   ...
   ```

   Ejemplo: `public/cars/spin/toyota-rav4-2022/001.jpg`

4. En `lib/vehicles.ts`, en ese vehículo, agrega cuántas fotos subiste:

   ```ts
   spin: { count: 36 }, // o { count: 36, ext: "webp" } si usas WebP
   ```

Listo. La pestaña **Tour 360°** mostrará automáticamente el giro con fotos reales
y un botón para alternar con el **Modelo 3D**.

## Recomendaciones para que se vea profesional

- Fondo neutro y parejo (idealmente estudio o pared lisa clara).
- Luz uniforme, sin sombras duras que cambien entre fotos.
- Exporta todas al mismo tamaño (ej. 1600×1000) y formato (`jpg` o `webp`).
- Cuantas más fotos, más suave el giro (36 es un buen equilibrio).

## Nota sobre los frames de demostración

Los frames que trae `toyota-rav4-2022` son una **demo generada por software**
(`npm run demo:frames`). Reemplázalos por las fotos reales cuando las tengas.
