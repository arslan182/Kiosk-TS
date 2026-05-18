// oxlint-disable max-lines-per-function, no-magic-numbers
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

import {
    type KioskMitBetreiber,
    type KioskMitBetreiberDTO,
    KioskService,
} from './kiosk-service.mts';
import { PrismaClient } from '../../generated/prisma/client.ts';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type Pageable } from './pageable.mts';
import { type Suchparameter } from './suchparameter.mts';

// Hoisting: wird an den (Datei-) Anfang verschoben
const { findManyMock, countMock } = vi.hoisted(() => {
    return {
        findManyMock: vi.fn<PrismaClient['kiosk']['findMany']>(),
        countMock: vi.fn<PrismaClient['kiosk']['count']>(),
    };
});

// vi.mock() bewirkt Hoisting
vi.mock(import('../../config/prisma-client.mts'), () => {
    return {
        prismaClient: {
            kiosk: {
                findMany: findManyMock,
                count: countMock,
            },
        } as unknown as PrismaClient,
    };
});

describe('KioskService find', () => {
    let service: KioskService;

    beforeEach(() => {
        service = new KioskService();
        findManyMock.mockReset();
        countMock.mockReset();
    });

    test('name vorhanden', async () => {
        // given
        const name = 'Test Kiosk';
        const suchparameter: Suchparameter = { name };
        const pageable: Pageable = { number: 1, size: 5 };
        const kioskMock: KioskMitBetreiber = {
            id: 1,
            version: 0,
            name: 'Test Kiosk',
            email: 'test@kiosk.de',
            istGeoeffnet: true,
            homepage: 'https://test.kiosk.de',
            username: 'testkiosk',
            erzeugt: new Date(),
            aktualisiert: new Date(),
            betreiber: [
                {
                    id: 11,
                    vorname: 'Max',
                    nachname: 'Mustermann',
                    geschlecht: 'MAENNLICH',
                    kioskId: 1,
                },
            ],
        };
        const kioskMockDTO: KioskMitBetreiberDTO = kioskMock;
        // return von prismaClient.kiosk.findMany()
        findManyMock.mockResolvedValueOnce([kioskMock]);
        // return von prismaClient.kiosk.count()
        countMock.mockResolvedValueOnce(1);

        // when
        const result = await service.find(suchparameter, pageable);

        // then
        const { content } = result;

        expect(content).toHaveLength(1);
        expect(content[0]).toStrictEqual(kioskMockDTO);
    });

    test('name nicht vorhanden', async () => {
        // given
        const name = 'Test Kiosk';
        const suchparameter: Suchparameter = { name };
        const pageable: Pageable = { number: 1, size: 5 };
        findManyMock.mockResolvedValue([]);

        // when / then
        await expect(service.find(suchparameter, pageable)).rejects.toThrow(
            /^Keine Kioske gefunden/u,
        );
    });
});
