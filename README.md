# Subasta de Marcadores · Mundial 2026

Puja por el marcador exacto de los 104 partidos del Mundial 2026. En vivo, en
USD, sin límite de precio, hasta que el partido comienza.

## Cómo funciona

- Los 104 partidos están organizados por fecha, desde el 11 de junio hasta la
  final el 19 de julio de 2026.
- Cualquiera puede pujar con solo nombre + correo (sin contraseña).
- El marcador que se puja va de **0 a 7** por equipo.
- La puja debe ser en USD y siempre **mayor a la puja anterior** — no hay
  techo de precio.
- La subasta de cada partido **cierra automáticamente** en el momento exacto
  del kickoff (se valida en el navegador y también en la base de datos, para
  que nadie pueda hacer trampa cambiando la hora de su celular).
- Las pujas se actualizan **en vivo** para todos los presentes (Supabase
  Realtime).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind v4
- **Supabase**: Postgres + Realtime + Row Level Security
- Diseñado para alojarse en **Vercel** (deploy automático con cada push)

---

## Paso 1 — Crear el proyecto en Supabase (gratis)

1. Ve a [supabase.com](https://supabase.com) → **New project**.
2. Ponle un nombre, por ejemplo `subasta-mundial-2026`, y crea una contraseña
   de base de datos (guárdala, no la necesitarás de nuevo si usas el panel
   web).
3. Espera ~2 minutos a que se aprovisione.
4. Ve a **SQL Editor** (ícono de la izquierda) → **New query**.
5. Abre el archivo [`supabase/schema.sql`](./supabase/schema.sql) de este
   repo, copia todo su contenido, pégalo en el editor, y dale **Run**.
6. Abre [`supabase/seed_matches.sql`](./supabase/seed_matches.sql), copia su
   contenido, pégalo en una nueva query, y dale **Run**. Esto carga los 104
   partidos.
7. Ve a **Project Settings → API**. Vas a necesitar dos valores en el
   siguiente paso:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public key** (la llave pública, no la `service_role`)

> La llave `anon` es segura de exponer en el frontend — Row Level Security
> (ya incluido en `schema.sql`) es lo que protege los datos, no el secreto de
> la llave.

## Paso 2 — Subir este código a tu repo de GitHub

```bash
git init
git add .
git commit -m "Subasta de marcadores Mundial 2026"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

(Si ya tienes el repo creado en GitHub, usa esa URL en el `remote add`.)

## Paso 3 — Conectar a Vercel

1. Ve a [vercel.com/new](https://vercel.com/new) e importa tu repositorio de
   GitHub.
2. Vercel detecta Next.js automáticamente — no cambies nada del **Build
   Command** ni el **Output Directory**.
3. Antes de darle **Deploy**, abre la sección **Environment Variables** y
   agrega:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | el Project URL del Paso 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | el anon public key del Paso 1 |

4. Dale **Deploy**. En ~1 minuto tendrás una URL pública tipo
   `tu-proyecto.vercel.app` ya funcionando, con pujas en vivo.

Cada vez que hagas `git push` a `main`, Vercel vuelve a desplegar solo.

---

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local con tus valores reales de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

```
src/
  app/page.tsx              página principal (lista de partidos por fecha)
  components/
    MatchCard.tsx            card de un partido con countdown + marcador líder
    BidModal.tsx              formulario para pujar (selector de marcador táctil)
    LeaderScoreboard.tsx       mini marcador de la puja ganadora
    Countdown.tsx              cuenta regresiva en vivo hasta el kickoff
    Header.tsx / IdentityModal.tsx   identidad del postor (nombre + correo)
    PhaseFilterBar.tsx         filtro por fase del torneo
  lib/
    matches-data.json          los 104 partidos (fecha, hora, sede, equipos)
    format.ts                  formato de fecha/hora/USD y cálculo de countdown
    supabase.ts                 cliente de Supabase
    useBidderIdentity.ts        guarda nombre+correo del postor en localStorage
  types/domain.ts               tipos compartidos
supabase/
  schema.sql                   tablas, RLS, función place_bid()
  seed_matches.sql              los 104 partidos en formato SQL
```

## Notas sobre los partidos de eliminatorias

Los 72 partidos de fase de grupos tienen los equipos confirmados por el
sorteo oficial. Los 32 partidos de eliminatorias (dieciseisavos en adelante)
todavía no tienen equipos definidos — aparecen como `1° Grupo A`,
`Ganador 89`, etc., tal como los publica la FIFA, y se irán aclarando
conforme avance el torneo real. Si quieres, puedo ayudarte a actualizar esos
nombres en `matches-data.json` (y la tabla `matches` en Supabase) a medida
que se vayan confirmando los cruces.
