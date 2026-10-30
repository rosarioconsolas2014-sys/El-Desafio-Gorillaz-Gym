# GORILLAZ GYM – THE CHAMPION CHALLENGE
## Guía de Preparación, Compilación y Despliegue en Firebase

Este proyecto es una aplicación web interactiva de competición deportiva para socios del gimnasio **GORILLAZ GYM**, desarrollada en **React (Vite SPA)** con estética **Gaming Neon Fitness** y persistencia centralizada en **Google Firebase (Cloud Firestore, Firebase Authentication y Firebase Hosting)**.

---

### 1. Detección del Entorno de Compilación

- **Herramienta de empaquetado**: **Vite** (detectado en `package.json` y `vite.config.ts`).
- **Directorio de salida (Build output)**: `dist`.
- **Enrutamiento**: Single Page Application (SPA), configurado con redirección `rewrite` hacia `/index.html` en `firebase.json`.

---

### 2. Estructura de Archivos de Firebase Creada

El proyecto ya cuenta con todos los archivos de configuración requeridos para el despliegue con Firebase CLI:

| Archivo | Función |
| :--- | :--- |
| `.firebaserc` | Apunta automáticamente al proyecto oficial: `gorillaz-gym-the--challenge`. |
| `firebase.json` | Configura **Hosting** (`public: "dist"`, caché de estáticos y rewrites SPA), **Firestore** (`rules` e `indexes`), y **Functions** (`source: "functions"`). |
| `firestore.rules` | Reglas de seguridad para proteger los DNI de los socios, validar puntajes y restringir paneles de administración. |
| `firestore.indexes.json` | Índices compuestos para consultas rápidas de clasificación y ordenamiento de podio. |
| `firebase-blueprint.json` | Esquema formal de las colecciones `participants`, `games`, `settings` y `adminLogs`. |
| `functions/` | Cloud Functions en JavaScript (Node.js 20) para validación de partidas y control de intentos en el servidor. |

---

### 3. Requisitos Previos

1. **Node.js**: Versión 18 o 20 LTS instalada en tu sistema.
2. **Firebase CLI**: Instalar globalmente mediante npm (si aún no lo tienes):
   ```bash
   npm install -g firebase-tools
   ```

---

### 4. Instrucciones de Compilación y Despliegue

#### Paso 1: Instalar dependencias del proyecto principal
```bash
npm install
```

*(Opcional si vas a desplegar Cloud Functions)*:
```bash
cd functions
npm install
cd ..
```

#### Paso 2: Compilar la aplicación React para producción
```bash
npm run build
```
> Esto generará el directorio optimizado `dist/` con todos los activos, estilos y el bundle comprimido.

#### Paso 3: Iniciar sesión en Firebase CLI
```bash
firebase login
```
*(Se abrirá una ventana de navegador para iniciar sesión con la cuenta de Google propietaria del proyecto).*

#### Paso 4: Confirmar el proyecto activo
```bash
firebase use gorillaz-gym-the--challenge
```

#### Paso 5: Desplegar a producción

##### Opción A — Despliegue Completo (Hosting + Firestore + Functions):
```bash
firebase deploy
```

##### Opción B — Despliegue Esencial (Hosting + Reglas e Índices de Firestore):
Si el proyecto está en el plan gratuito **Spark**, utiliza este comando:
```bash
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

---

### 5. Aviso Crítico de Facturación y Planes (Spark vs Blaze)

- **Firebase Hosting, Cloud Firestore y Firebase Authentication**:
  - Funcionan dentro del **Plan Gratuito Spark**.
  - Puedes publicar la aplicación y conectar la base de datos sin necesidad de ingresar tarjeta de crédito.
- **Firebase Cloud Functions**:
  - Google Cloud y Firebase exigen el **Plan Blaze (Pay-as-you-go)** para compilar y ejecutar Cloud Functions (utiliza Cloud Build y Artifact Registry).
  - Si tu proyecto aún está en el plan **Spark**, el comando `firebase deploy` completo dará un aviso de facturación. En ese caso, la aplicación React ya cuenta con **validaciones y persistencia directa en Firestore** preparadas para funcionar perfectamente utilizando:
    ```bash
    firebase deploy --only hosting,firestore
    ```
  - Si deseas activar las Cloud Functions, actualiza el proyecto a Plan Blaze desde la consola de Firebase:
    [https://console.firebase.google.com/project/gorillaz-gym-the--challenge/usage/details](https://console.firebase.google.com/project/gorillaz-gym-the--challenge/usage/details)

---

### 6. Acceso al Panel de Administración

- La aplicación cuenta con un acceso protegido para encargados del gimnasio con el botón con candado en el encabezado.
- **Clave de seguridad inicial**: `GORILLA2025` (o mediante usuario de correo y contraseña creado en Firebase Authentication).
- Desde el panel puedes:
  - Establecer el límite de intentos (1, 2, 3, 5, 10 o Ilimitados).
  - Pausar o reanudar el torneo.
  - Consultar los DNI, nombres y cantidad de partidas de cada socio.
  - Reiniciar intentos individual o globalmente.
  - Exportar el listado completo a Excel (CSV).
