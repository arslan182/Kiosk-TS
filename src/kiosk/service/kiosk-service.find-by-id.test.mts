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
// along with this program. If not, see <https://www.gnu.org/licenses/>.

import {
    type KioskMitBetreiberUndProdukt,
    type KioskMitBetreiberUndProduktDTO,
    KioskService,
} from './kiosk-service.mts';
import { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Hoisting: wird an den (Datei-) Anfang verschoben
const { findUniqueMock } = vi.hoisted(() => {
    return {
        findUniqueMock: vi.fn<PrismaClient['kiosk']['findUnique']>(),
    };
});

// vi.mock() bewirkt Hoisting
vi.mock(import('../../config/prisma-client.mts'), () => {
    return {
        prismaClient: {
            kiosk: {
                findUnique: findUniqueMock,
            },
        } as unknown as PrismaClient,
    };
});

describe('KioskService findById', () => {
    let service: KioskService;

    beforeEach(() => {
        service = new KioskService();
        findUniqueMock.mockReset();
    });

    test('id vorhanden', async () => {
        // given
        const id = 1;
        const kioskMock: Readonly<KioskMitBetreiberUndProdukt> = {
            id,
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
                    kioskId: id,
                },
            ],
            produkt: [
                {
                    id: 21,
                    name: 'Testprodukt',
                    preis: new Prisma.Decimal(1.99),
                    waehrung: 'EUR',
                    kioskId: id,
                },
            ],
        };
        const { produkt, ...kioskRest } = kioskMock;
        const kioskMockDTO: KioskMitBetreiberUndProduktDTO = {
            ...kioskRest,
            produkt: produkt.map((p) => ({
                ...p,
                preis: p.preis.toNumber(),
            })),
        };
        // return von prismaClient.kiosk.findUnique()
        findUniqueMock.mockResolvedValueOnce(kioskMock);

        // when
        const kiosk = await service.findById({ id });

        // then
        expect(kiosk).toStrictEqual(kioskMockDTO);
    });

    test('id nicht vorhanden', async () => {
        // given
        const id = 999;
        findUniqueMock.mockResolvedValue(null);

        // when / then
        await expect(service.findById({ id })).rejects.toThrow(
            `Es gibt keinen Kiosk mit der ID ${id}.`,
        );
    });
});
