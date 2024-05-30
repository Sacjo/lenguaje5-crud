import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-profesor-list',
  templateUrl: './profesor-list.page.html',
  styleUrls: ['./profesor-list.page.scss'],
})
export class ProfesorListPage implements OnInit {
  constructor(
    private readonly firestore: Firestore,
    private alertCtrl: AlertController
  ) {}

  profesoresArray: any[] = [];

  ngOnInit() {
    this.listarProfesores();
  }

  listarProfesores = () => {
    console.log('Listar profesores');
    const profesoresRef = collection(this.firestore, 'profesores');
    collectionData(profesoresRef, { idField: 'id' }).subscribe((respuesta) => {
      this.profesoresArray = respuesta.map((profesor) => ({
        ...profesor,
        registro: this.formatoFecha(profesor["registro"].toDate()),
      }));
      console.log('estos son los profesores', respuesta);
    });
  };

  formatoFecha = (fecha: Date): string => {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  async noTanRapido() {
    const alert = await this.alertCtrl.create({
      header: '¡Espera un momento!',
      message: 'No tan rápido, aún no llegamos ahí.',
      buttons: ['OK'],
    });

    await alert.present();
  }
}
