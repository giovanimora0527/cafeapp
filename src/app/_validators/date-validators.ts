/*
* Archivo: date-validators.ts
* Fecha: 01/01/2019
* Todos los derechos de propiedad intelectual e industrial sobre esta
* aplicacion son de propiedad exclusiva del GRUPO ASESORIA EN
* SISTEMATIZACION DE DATOS SOCIEDAD POR ACCIONES SIMPLIFICADA GRUPO ASD
  S.A.S.
* Su uso, alteracion, reproduccion o modificacion sin la debida
* consentimiento por escrito de GRUPO ASD S.A.S.
* autorizacion por parte de su autor quedan totalmente prohibidos.
*
* Este programa se encuentra protegido por las disposiciones de la
* Ley 23 de 1982 y demas normas concordantes sobre derechos de autor y
* propiedad intelectual. Su uso no autorizado dara lugar a las sanciones
* previstas en la Ley.
*/

import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Validación para un arreglo de Dates ordenados
 * Importante: los campos deben ser "my-date-picker", no funciona con simples inputs type="date"
 * @param firstDateField - Fecha que debe ser anterior
 * @param lsatDateField - Fecha que debe ser posterior
 * @param allowEquality - permite igualdad de Dates continuos, por defecto es true
 * @param validatorField - objeto a retornar en caso de incumplir la validación - por defecto 'orderDate'
 */
export function orderDateValidation(firstDateField: string, lastDateField: string, allowEquality: boolean = true,
    validatorField: { [key: string]: boolean } = { 'orderDate': true }): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
        const firstDateValue = control.get(firstDateField).value;
        const lastDateValue = control.get(lastDateField).value;
        if (firstDateValue && lastDateValue && firstDateValue.jsdate && lastDateValue.jsdate) {
            const firstDate = firstDateValue.jsdate.valueOf();
            const lastDate = lastDateValue.jsdate.valueOf();
            const delta = firstDate - lastDate;
            if (firstDate !== 0 && lastDate !== 0 && (delta >= 0 && (allowEquality || delta === 0))) {
                return validatorField;
            }
        }
        return null;
    };
}

/**
 * Valida que un Date no sea menor a hoy
 * Importante: los campos deben ser "my-date-picker", no funciona con simples inputs type="date"
 * @param allowPresent - permite que el Date sea hoy, por defecto true
 * @param allowPristine - permite que se salte la validación si no se ha modificado el campo - por defecto false
 * @param validatorField - objeto a retornar en caso de incumplir la validación - por defecto 'pastDate'
 */
export function futureDateValidation(allowPresent: boolean = true, allowPristine: boolean = false,
    validatorField: { [key: string]: boolean } = { 'pastDate': true }): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if ((!allowPristine || control.dirty) && control.value && control.value.jsdate) {
            const controlDate = new Date(control.value.jsdate).valueOf();
            const today = new Date().setHours(0, 0, 0, 0);
            const delta = today - controlDate;
            if (delta >= 0) {
                if (delta !== 0 || !allowPresent) {
                    return validatorField;
                }
            }
        }
        return null;
    };
}
