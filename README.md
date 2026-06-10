
# MiahuaBus — Mobile Prototype

Este repositorio contiene una versión prototipo de la aplicación móvil MiahuaBus. Está pensada para demostraciones y pruebas de interfaz; algunas funcionalidades (por ejemplo, permisos de ubicación y autenticación con Google) están simuladas.

Repositorio original de diseño: https://www.figma.com/design/94IrOSyImxFQ6WoXmNFmv7/MiahuaBus-mobile-prototype

## Contenido
- Código fuente de la aplicación en `src/` (Vite + React).
- Configuración de estilos y utilidades en `src/styles` y `src/app`.

## Requisitos
- Node.js (versión recomendada: 18.x para este prototipo).
- pnpm (se puede instalar globalmente o usar `corepack`).

Si deseas actualizar Node a una versión más nueva (recomendada para pnpm v11+), usa nvm o el gestor de paquetes de tu sistema.

## Instalación (rápida)

1. Instalar `pnpm` (si no está disponible):

```bash
# Usando npm (requiere permisos de administrador o --location=global)
npm install -g pnpm

# O con corepack (si tu Node lo incluye):
corepack enable
corepack prepare pnpm@latest --activate
```

2. Instalar dependencias del proyecto:

```bash
pnpm install
```

3. Levantar servidor de desarrollo:

```bash
pnpm dev
```

El servidor de Vite quedará disponible en `http://localhost:5173/` por defecto.

## Comandos útiles

```bash
# Instalar dependencias
pnpm install

# Levantar servidor de desarrollo
pnpm dev

# Construir para producción
pnpm build

# Ejecutar formateo/lint (si dispone de scripts)
pnpm run format
pnpm run lint
```

[!TIP]
Si tu sistema no tiene `pnpm` instalado y no quieres instalarlo globalmente, puedes usar `npx pnpm@<version> install` para ejecutar pnpm en modo puntual.

## Nota sobre funcionalidades simuladas
- Permisos de ubicación: el prototipo no solicita la geolocalización real del dispositivo; el flujo está simulado y guarda el estado en `localStorage`. Esto permite probar la experiencia de usuario sin depender de la API de geolocalización.
- Inicio con Google: el login con Google está simulado desde el contexto de autenticación (`src/app/context/AuthContext.tsx`) para pruebas locales.

Si necesitas integrar OAuth real o la API de geolocalización, puedo ayudarte a añadir la implementación y los pasos de configuración (credenciales, redirect URIs, alcance de permisos, etc.).

## Comportamiento relacionado con permisos (resumen)
- Si el usuario rechaza permisos de ubicación, la acción de "Planificar ruta" queda bloqueada y se muestra un mensaje que indica: "Para usar esta funcionalidad debes dar permisos".
- Desde ese mensaje el usuario puede:
  - Pulsar **Dar permiso** — abre un modal simulado que, si se acepta, concede el permiso en el prototipo y permite usar el planificador.
  - Pulsar **Ver Mis rutas** — permite navegar a la lista de rutas sin conceder permisos.

## Advertencias
- Este proyecto es un prototipo; no se recomienda usarlo en producción tal cual.
- No expongas claves ni credenciales en el código fuente.

## Contribución
Para cambios locales:

```bash
git init                # sólo si aún no hay repo
git add .
git commit -m "Initial prototype import"
```

Si quieres que haga el primer commit por ti lo puedo ejecutar aquí (dime si lo deseas).

---
Si deseas que adapte este README a otro idioma o que añada un apartado de despliegue (Vercel/Netlify/Docker), dime y lo genero.
  