// oxlint-disable max-lines-per-function
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

import { type KioskCreate, KioskWriteService } from './kiosk-write-service.mts';
import { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { KioskService } from './kiosk-service.mts';

// Hoisting: wird an den (Datei-) Anfang verschoben
const { createMock, countMock, transactionMock, sendmailMock } = vi.hoisted(
    () => {
        return {
            createMock: vi.fn<Prisma.KioskDelegate['create']>(),
            countMock: vi.fn<Prisma.KioskDelegate['count']>(),
            transactionMock: vi.fn(), // oxlint-disable-line vitest/require-mock-type-parameters
            sendmailMock: vi.fn(), // oxlint-disable-line vitest/require-mock-type-parameters
        };
    },
);

// vi.mock() bewirkt Hoisting
vi.mock(import('../../config/prisma-client.mts'), () => {
    return {
        prismaClient: {
            kiosk: {
                create: createMock,
                count: countMock,
            },
            $transaction: transactionMock,
        } as unknown as PrismaClient,
    };
});

vi.mock(import('../../mail/sendmail.mts'), () => {
    return {
        sendmail: sendmailMock,
    };
});

describe('KioskWriteService create', () => {
    let service: KioskWriteService;
    let readService: KioskService;

    beforeEach(() => {
        readService = new KioskService();
        service = new KioskWriteService(readService);

        createMock.mockReset();
        countMock.mockReset();
        transactionMock.mockReset();
        sendmailMock.mockReset();

        transactionMock.mockImplementation(
            async (
                transactionBody: (
                    tx: Prisma.TransactionClient,
                ) => Promise<unknown>,
            ) =>
                await transactionBody({
                    kiosk: {
                        create: createMock,
                        count: countMock,
                    },
                } as unknown as Prisma.TransactionClient),
        );
    });

    test('Neuer Kiosk', async () => {
        // given
        const idMock = 1;
        const kiosk: KioskCreate = {
            name: 'Test Kiosk',
            email: 'test@kiosk.de',
            istGeoeffnet: true,
            homepage: 'https://test.kiosk.de',
            username: 'testkiosk',
            erzeugt: new Date(),
            aktualisiert: new Date(),
            betreiber: {
                create: {
                    vorname: 'Max',
                    nachname: 'Mustermann',
                    geschlecht: 'MAENNLICH',
                },
            },
            produkt: {
                create: {
                    name: 'Testprodukt',
                    preis: new Prisma.Decimal(1.99),
                    waehrung: 'EUR',
                },
            },
        };
        const kioskTmp: any = { ...kiosk };
        kioskTmp.id = idMock;
        // return von tx.kiosk.create()
        createMock.mockResolvedValue(kioskTmp);
        // sendmail ist eine void-Funktion
        sendmailMock.mockResolvedValue(null);

        // when
        const id = await service.create(kiosk);

        // then
        expect(id).toBe(idMock);
        expect(sendmailMock).toHaveBeenCalledOnce();
    });
});
