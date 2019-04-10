import { Component, OnInit } from '@angular/core';
import { Directivas } from 'src/app/_directives/directiva/directiva.directive';
import { ArchivoCums } from 'src/app/_models/administracion/cums/archivo';
import { CumsService } from 'src/app/_services/administracion/cums/cums.service';
import { AutenticacionService } from 'src/app/_services/autenticacion/autenticacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-historicocums',
  templateUrl: './historicocums.component.html'
})
export class HistoricocumsComponent implements OnInit {

  title: string = 'Datos no cargados Código Único de Medicamentos'; 
  msjSpinner: string = "Guardando";

  archivos: Array<ArchivoCums> = [];
  resultados: Array<ArchivoCums> = [];

  readonly optionsDate = { day: '2-digit', month: '2-digit', year: 'numeric', hour12: true };

  constructor(private cumsService: CumsService, 
    private autentication: AutenticacionService,
    private router: Router) { 
      this.validarPermisos();
    }

  /**
   * Método que permite validar si el usuario tiene permisos para acceder al módulo
   */
  async validarPermisos() {
    let url: string = this.router.routerState.root.children[0].firstChild
      .routeConfig.path;     
    this.autentication.validarPermisosUsuario(url);
    return;
  }

  ngOnInit() {
    this.cargarDataHistorico();
  }

  cargarDataHistorico() {
    this.cumsService.getFiles().subscribe(
      data => {
        this.archivos = this.parseFiles(data);
        this.resultados = this.archivos;
      }
    );
  }

  /**
   * Convierte un arreglo de strings con formato nombreArchivo|fecha.csv a un arreglo de objetos ArchivoCups
   * @param files 
   */
  private parseFiles(files: Array<string>): Array<ArchivoCums> {
    const archivos: Array<ArchivoCums> = [];
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
      const archivo: ArchivoCums = { nombre: fullFileName.slice(0, underscorePos-15), fechaCarga: fechaCarga, path: fullFileName };
      archivos.push(archivo);
    }
    archivos.sort(
      (a,b) => { return <any> new Date(b.fechaCarga.toISOString()) - <any> new Date(a.fechaCarga.toISOString()) }
    );
    return archivos;
  }

  /**
   * Descarga el archivo seleccionado
   */
  descargarArchivoSeleccionado(file: ArchivoCums) {
    this.cumsService.downloadFile(file.path).subscribe(
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
  this.resultados = this.archivos.filter((archivo: ArchivoCums) => {
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


}
