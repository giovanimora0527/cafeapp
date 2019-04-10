import { Component, OnInit } from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Modelos
 */
import { Directivas } from '../../../../_directives/directiva/directiva.directive';
import { CupsService } from '../../../../_services/administracion/cups/cups.service';
import { ArchivoCups } from '../../../../_models/administracion/cups/index';


@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html'
})
export class HistoricoComponent implements OnInit {
  title: string = 'Datos no cargados Clasificación Única de Procedimientos de Salud';
  msjSpinner: string = "Guardando";

  archivos: Array<ArchivoCups> = [];
  resultados: Array<ArchivoCups> = [];

  readonly optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric', hour12: true };

  constructor(private spinner: NgxSpinnerService, private cupsService: CupsService) { }

  ngOnInit() {
    const year =
      this.cupsService.getFiles().subscribe(
        data => {
          this.archivos = this.parseFiles(data);
          this.resultados = this.archivos;
        }
      );
  }

  /**
   * Descarga el archivo seleccionado
   */
  descargarArchivoSeleccionado(file: ArchivoCups) {
    this.cupsService.downloadFile(file.path).subscribe(
      data => {
        const csv: Blob = new Blob(['\ufeff', data]);
        Directivas.downloadBlobFile(csv, file.path);
      });
  }

  /**
  * Filtrar los datos de la tabla
  * @param patron - texto ingresado a buscar
  */
  filterBy(patron: string) {
    const splitted: Array<string> = patron.replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().normalize('NFD')
      .replace(/\s\s+/g, ' ').split(' ');
    this.resultados = this.archivos.filter((archivo: ArchivoCups) => {
      const noCodigoWords: Array<string> = [];      
      for (let i = 0; i < splitted.length; i++) {
        const word = splitted[i].trim();       
        if (!archivo.nombre.toLocaleLowerCase().includes(word)
          && !archivo.fechaCarga.toLocaleTimeString('en-GB', this.optionsDate).includes(word)
          && !Directivas.parseDateFormat(archivo.fechaCarga.toLocaleString('en-GB', this.optionsDate)).includes(word)) {           
          noCodigoWords.push(word);
        }
      }
      return archivo.nombre.replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().normalize('NFD').match(`.*${noCodigoWords.join('\.\*')}.*`);
    });
  }

  /**
   * Convierte un arreglo de strings con formato nombreArchivo|fecha.csv a un arreglo de objetos ArchivoCups
   * @param files 
   */
  private parseFiles(files: Array<string>): Array<ArchivoCups> {
    const archivos: Array<ArchivoCups> = [];
    for (let index = 0; index < files.length; index++) {      
      const fullFileName = files[index];
      const underscorePos = fullFileName.lastIndexOf('.csv');      
      const dateString = fullFileName.slice(underscorePos - 14, underscorePos);     
      const year = Number(dateString.slice(0, 4));
      const month = Number(dateString.slice(4, 6)) - 1;
      const day = Number(dateString.slice(6, 8));
      const hours = Number(dateString.slice(8, 10));
      const minutes = Number(dateString.slice(10, 12));
      const seconds = Number(dateString.slice(12, underscorePos - 1));     
      const fechaCarga = new Date(year, month, day, hours, minutes, seconds);
      const archivo: ArchivoCups = { nombre: fullFileName.slice(0, underscorePos-15), fechaCarga: fechaCarga, path: fullFileName };
      archivos.push(archivo);
    }
    archivos.sort(
      (a,b) => { return <any> new Date(b.fechaCarga.toISOString()) - <any> new Date(a.fechaCarga.toISOString()) }
    );
    return archivos;
  }
  
}
