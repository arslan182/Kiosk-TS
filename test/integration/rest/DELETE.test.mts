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

import { beforeAll, describe, expect, test } from 'vitest';
import { AUTHORIZATION, BEARER, DELETE, restURL } from '../constants.mts';
import { getToken } from '../token.mts';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
// Die ID eines Kiosks, der gelöscht werden soll (z.B. aus deinen CSV-Testdaten)
const id = '50';

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
describe('DELETE /rest/:id', () => {
    let tokenAdmin: string;
    let tokenUser: string;

    beforeAll(async () => {
        // Tokens für die verschiedenen Rollen vom Keycloak-Mock/Service holen
        tokenAdmin = await getToken('admin', 'p');
        tokenUser = await getToken('user', 'p');
    });

    test.concurrent('Vorhandenen Kiosk als "admin" loeschen', async () => {
        // given
        const url = `${restURL}/${id}`;
        const headers = new Headers();
        headers.append(AUTHORIZATION, `${BEARER} ${tokenAdmin}`);

        // when
        const response = await fetch(url, {
            method: DELETE,
            headers,
        });

        // then
        expect(response.status).toBe(204);
    });

    test.concurrent(
        'Kiosk loeschen schlaegt fehl ohne Token (401)',
        async () => {
            // given
            const url = `${restURL}/${id}`;

            // when
            const response = await fetch(url, { method: DELETE });

            // then
            expect(response.status).toBe(401);
        },
    );

    test.concurrent(
        'Kiosk loeschen schlaegt fehl mit falschem Token (401)',
        async () => {
            // given
            const url = `${restURL}/${id}`;
            const headers = new Headers();
            headers.append(AUTHORIZATION, `${BEARER} UNGUELTIGER_TOKEN_XYZ`);

            // when
            const response = await fetch(url, {
                method: DELETE,
                headers,
            });

            // then
            expect(response.status).toBe(401);
        },
    );

    test.concurrent(
        'Kiosk loeschen als normaler "user" verboten (403)',
        async () => {
            // given
            // Wir nehmen eine andere ID, falls ID 50 im ersten Test bereits gelöscht wurde
            const url = `${restURL}/60`;
            const headers = new Headers();
            headers.append(AUTHORIZATION, `${BEARER} ${tokenUser}`);

            // when
            const response = await fetch(url, {
                method: DELETE,
                headers,
            });

            // then
            expect(response.status).toBe(403);
        },
    );
});
