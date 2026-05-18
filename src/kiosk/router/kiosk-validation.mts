// oxlint-disable no-magic-numbers
// Copyright (C) 2026 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// Alternativen zu Zod:
//      ajv -> JSON schema statt TypeScript-Code
//      valibot <- Bachelorthesis an der HdM Stuttgart mit Miško Hevery (→ Angular) als Zweitbetreuer
//      arktype
//      joi von Hapi
//      class-validator (ursprüngl. in Nest integriert)

import { z } from 'zod';

const KioskComplete = z.strictObject({
    // bei GraphQL ist der Typ ID i.a. ein String
    id: z.union([z.number().int().gt(0), z.string().regex(/^[1-9]\d*$/u)]),
    version: z.int().gte(0),
    name: z.string().regex(/^\w.*/u).max(40),
    email: z.string().email(),
    istGeoeffnet: z.boolean().optional(),
    homepage: z.httpUrl().optional(),
    username: z.string().regex(/^\w.*/u).max(20),

    betreiber: z
        .array(
            z.strictObject({
                vorname: z.string().regex(/^\w.*/u).max(40),
                nachname: z.string().regex(/^\w.*/u).max(40),
                geschlecht: z
                    .enum(['MAENNLICH', 'WEIBLICH', 'DIVERS'])
                    .optional(),
            }),
        )
        .optional(),
    produkt: z
        .array(
            z.strictObject({
                name: z.string().regex(/^\w.*/u).max(40),
                preis: z.number().gte(0),
                waehrung: z.string().max(3),
            }),
        )
        .optional(),
});

export const KioskNeuSchema = KioskComplete.omit({
    id: true,
    version: true,
}).readonly();

export const KioskUpdateSchema = KioskComplete.omit({
    id: true,
    version: true,
    betreiber: true,
    produkt: true,
}).readonly();

export const KioskUpdateGraphQLSchema = KioskComplete.omit({
    betreiber: true,
    produkt: true,
}).readonly();

export type KioskNeuType = z.infer<typeof KioskNeuSchema>;
export type KioskUpdateType = z.infer<typeof KioskUpdateSchema>;
