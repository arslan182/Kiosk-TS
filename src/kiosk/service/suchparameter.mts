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
// along with this program. If not, see <https://www.gnu.org/licenses/>.

/**
 * Das Modul besteht aus Typdefinitionen für die Suche in `KioskService`.
 * @packageDocumentation
 */

import { type Geschlecht } from '../../generated/prisma/enums.ts';

// Typdefinition für `find`
export type Suchparameter = {
    readonly name?: string;
    readonly email?: string;
    readonly istGeoeffnet?: boolean;
    readonly homepage?: string;
    readonly username?: string;
    readonly geschlecht?: Geschlecht;
};

// gueltige Namen fuer die Suchparameter
export const suchparameterNamen = [
    'name',
    'email',
    'istGeoeffnet',
    'homepage',
    'username',
    'geschlecht',
];
