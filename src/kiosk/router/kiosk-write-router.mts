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
 * Das Modul besteht aus Router für die Verwaltung von Kiosken.
 * @packageDocumentation
 */

import {
    type KioskCreate,
    type KioskUpdate,
} from '../service/kiosk-write-service.mts';
import {
    KioskNeuSchema,
    type KioskNeuType,
    KioskUpdateSchema,
    type KioskUpdateType,
} from './kiosk-validation.mts';
import {
    createProblemDetails,
    preconditionRequired,
} from '../../problem-details.mts';
import { Hono } from 'hono';
import { container } from '../../container.mts';
import { createBaseUrl } from './create-base-url.mts';
import { getLogger } from '../../logger/logger.mts';
import { rolesRequired } from '../../security/roles-required.mts';

const { kioskWriteService } = container;

/**
 * Router für die Verwaltung von Kiosken.
 * @author [Jürgen Zimmermann](mailto:Juergen.Zimmermann@h-ka.de)
 */
export const router = new Hono();

const logger = getLogger('kiosk-write-router', 'file');

// -----------------------------------------------------------------------------
// N e u a n l e g e n
// -----------------------------------------------------------------------------
const kioskDtoToKioskCreateInput = (kioskDTO: KioskNeuType): KioskCreate => {
    const betreiber = kioskDTO.betreiber?.map((betreiberDTO) => {
        return {
            vorname: betreiberDTO.vorname,
            nachname: betreiberDTO.nachname,
            geschlecht: betreiberDTO.geschlecht ?? null,
        };
    });
    const produkt = kioskDTO.produkt?.map((produktDTO) => {
        return {
            name: produktDTO.name,
            preis: produktDTO.preis,
            waehrung: produktDTO.waehrung,
        };
    });
    const kiosk: KioskCreate = {
        version: 0,
        name: kioskDTO.name,
        email: kioskDTO.email,
        istGeoeffnet: kioskDTO.istGeoeffnet ?? true,
        homepage: kioskDTO.homepage ?? null,
        username: kioskDTO.username,
        erzeugt: new Date(),
        aktualisiert: new Date(),
        betreiber: { create: betreiber ?? [] },
        produkt: { create: produkt ?? [] },
    };
    return kiosk;
};

router.post('/', rolesRequired('admin', 'user'), async (c) => {
    const requestBody = await c.req.json();

    // Validierung mit Zod: ZodError wird geworfen, falls Validierung nicht erfolgreich
    const kioskDTO: KioskNeuType = KioskNeuSchema.parse(requestBody);
    logger.debug('post: kioskDTO=%o', kioskDTO);

    const kiosk = kioskDtoToKioskCreateInput(kioskDTO);
    const id = await kioskWriteService.create(kiosk);

    const location = `${createBaseUrl(c.req)}/${id}`;
    const { header, body } = c;
    header('Location', location);
    return body(null, 201);
});

// -----------------------------------------------------------------------------
// A e n d e r n
// -----------------------------------------------------------------------------
const kioskDtoToKioskUpdate = (kioskDTO: KioskUpdateType): KioskUpdate => {
    return {
        version: 0,
        name: kioskDTO.name,
        email: kioskDTO.email,
        istGeoeffnet: kioskDTO.istGeoeffnet ?? true,
        homepage: kioskDTO.homepage ?? null,
        username: kioskDTO.username,
        erzeugt: new Date(),
        aktualisiert: new Date(),
    };
};

router.put('/:id', rolesRequired('admin', 'user'), async (c) => {
    const { req } = c;
    const id = req.param('id') ?? '-1';
    logger.debug('put: id=%s', id);
    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber)) {
        // https://hono.dev/docs/api/context#notfound
        return c.notFound();
    }

    // https://hono.dev/docs/api/request#header
    const version = req.header('If-Match');
    logger.debug('put: version=%s', version);
    if (typeof version === 'undefined') {
        logger.debug('put: version === undefined');
        return createProblemDetails(
            c,
            preconditionRequired,
            'Header "If-Match" fehlt',
        );
    }

    const requestBody = await c.req.json();
    logger.debug('put: requestBody=%o', requestBody);

    // Validierung mit Zod
    const kioskDTO: KioskUpdateType = KioskUpdateSchema.parse(requestBody);
    logger.debug('put: kioskDTO=%o', kioskDTO);

    const kiosk = kioskDtoToKioskUpdate(kioskDTO);
    const neueVersion = await kioskWriteService.update({
        id: idNumber,
        kiosk,
        version,
    });
    logger.debug('put: neueVersion=%d', neueVersion);
    const headers = {
        ETag: `"${neueVersion}"`,
    };
    return c.body(null, 204, headers);
});

// -----------------------------------------------------------------------------
// L o e s c h e n
// -----------------------------------------------------------------------------
router.delete('/:id', rolesRequired('admin'), async (c) => {
    const id = c.req.param('id') ?? '-1';
    logger.debug('delete: id=%s', id);
    const idNumber = Number.parseInt(id, 10);
    const { body } = c;
    if (Number.isNaN(idNumber)) {
        return body(null, 204);
    }

    await kioskWriteService.delete(idNumber);
    return body(null, 204);
});
